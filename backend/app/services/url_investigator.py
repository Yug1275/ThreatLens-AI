"""
URL Investigator Service — Phase 5B
Replaces all mock data with real WHOIS and SSL certificate lookups.

Dependencies:
  python-whois   (pip install python-whois)
  ssl, socket    (stdlib)
"""

import re
import ssl
import socket
import urllib.request
import urllib.error
from urllib.parse import urlparse
from datetime import datetime, timezone, timedelta
from typing import Optional

try:
    import whois as whois_lib
    WHOIS_AVAILABLE = True
except ImportError:
    WHOIS_AVAILABLE = False


# ── Helpers ───────────────────────────────────────────────────────────── #

def _first(value):
    """python-whois sometimes returns a list instead of a scalar; unwrap it."""
    if isinstance(value, list):
        return value[0] if value else None
    return value


def _fmt_date(dt) -> Optional[str]:
    """Normalise a datetime (or None) to an ISO-8601 string in UTC."""
    if dt is None:
        return None
    dt = _first(dt)
    if dt is None:
        return None
    if isinstance(dt, str):
        return dt
    # Make timezone-aware if naive
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    return str(dt)


def _domain_age(creation_dt) -> Optional[dict]:
    """Return a human-readable age dict from a creation date."""
    creation_dt = _first(creation_dt)
    if not isinstance(creation_dt, datetime):
        return None
    if creation_dt.tzinfo is None:
        creation_dt = creation_dt.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    delta = now - creation_dt
    days = delta.days
    if days < 0:
        return {"days": 0, "label": "Unknown"}
    if days < 30:
        return {"days": days, "label": f"{days} day{'s' if days != 1 else ''}"}
    if days < 365:
        months = days // 30
        return {"days": days, "label": f"{months} month{'s' if months != 1 else ''}"}
    years = days // 365
    return {"days": days, "label": f"{years} year{'s' if years != 1 else ''}"}


def _parse_domain(url: str) -> dict:
    """
    Extracts hostname, root domain, TLD, and subdomain from a URL.

    Example:
      https://login.amazon.com.secure-auth.net
        hostname   = login.amazon.com.secure-auth.net
        root_domain = secure-auth.net
        tld         = .net
        subdomain   = login.amazon.com
    """
    parsed = urlparse(url)
    hostname = (parsed.hostname or parsed.netloc or "").lower().split(":")[0]
    parts = hostname.split(".")

    tld = f".{parts[-1]}" if parts else ""
    if len(parts) >= 2:
        root_domain = ".".join(parts[-2:])
        subdomain = ".".join(parts[:-2]) if len(parts) > 2 else None
    else:
        root_domain = hostname
        subdomain = None

    return {
        "hostname": hostname,
        "root_domain": root_domain,
        "tld": tld,
        "subdomain": subdomain,
    }


# ── WHOIS ─────────────────────────────────────────────────────────────── #

def _fetch_whois(root_domain: str) -> dict:
    """
    Performs a real WHOIS lookup against the root domain.
    Returns a structured dict; every field is None on failure rather than faking data.
    """
    if not WHOIS_AVAILABLE:
        return {
            "registrar": None,
            "creation_date": None,
            "updated_date": None,
            "expiration_date": None,
            "domain_age": None,
            "registrant_country": None,
            "name_servers": [],
            "whois_privacy": None,
            "status": None,
            "whois_error": "python-whois library not installed",
        }

    try:
        w = whois_lib.whois(root_domain)
    except Exception as e:
        error_msg = str(e)
        if "No match" in error_msg or "not found" in error_msg.lower():
            reason = "Domain does not exist in WHOIS"
        elif "timeout" in error_msg.lower():
            reason = "WHOIS server timed out"
        elif "rate" in error_msg.lower() or "throttl" in error_msg.lower():
            reason = "WHOIS server rate-limited this request"
        elif "socket" in error_msg.lower() or "connect" in error_msg.lower():
            reason = "WHOIS server unreachable"
        else:
            reason = f"WHOIS lookup failed: {error_msg}"
        return {
            "registrar": None,
            "creation_date": None,
            "updated_date": None,
            "expiration_date": None,
            "domain_age": None,
            "registrant_country": None,
            "name_servers": [],
            "whois_privacy": None,
            "status": None,
            "whois_error": reason,
        }

    creation_dt = _first(w.creation_date)
    expiry_dt = _first(w.expiration_date)
    updated_dt = _first(w.updated_date)

    # Detect WHOIS privacy (registrar name contains known privacy providers)
    registrar = w.registrar or None
    whois_privacy = False
    if registrar:
        privacy_keywords = ["privacy", "whoisguard", "perfect privacy", "redacted", "withheld"]
        whois_privacy = any(k in registrar.lower() for k in privacy_keywords)

    # Name servers — deduplicate and sort
    raw_ns = w.name_servers or []
    if isinstance(raw_ns, str):
        raw_ns = [raw_ns]
    name_servers = sorted(set(ns.lower() for ns in raw_ns if ns))

    # Status — can also be a list
    raw_status = w.status or []
    if isinstance(raw_status, str):
        raw_status = [raw_status]
    status_list = list(set(raw_status)) if raw_status else []

    age_info = _domain_age(creation_dt)

    return {
        "registrar": registrar,
        "creation_date": _fmt_date(creation_dt),
        "updated_date": _fmt_date(updated_dt),
        "expiration_date": _fmt_date(expiry_dt),
        "domain_age": age_info,          # {"days": int, "label": str}
        "domain_age_days": age_info["days"] if age_info else None,
        "registrant_country": getattr(w, "country", None),
        "name_servers": name_servers,
        "whois_privacy": whois_privacy,
        "status": status_list,
        "whois_error": None,
    }


# ── SSL Certificate ───────────────────────────────────────────────────── #

def _fetch_ssl(hostname: str) -> dict:
    """
    Retrieves the live SSL certificate via a raw socket connection.
    Returns a structured dict; every field is None on failure with a clear error reason.
    """
    SSL_PORT = 443
    TIMEOUT = 8

    def _parse_rdns(rdns_tuple) -> dict:
        """Flatten ((('commonName', 'X'),),) into {'commonName': 'X'}."""
        result = {}
        for rdn in rdns_tuple:
            for key, val in rdn:
                result[key] = val
        return result

    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((hostname, SSL_PORT), timeout=TIMEOUT) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
    except ssl.SSLCertVerificationError as e:
        return {
            "valid": False,
            "issuer": None,
            "subject": None,
            "common_name": None,
            "sans": [],
            "signature_algorithm": None,
            "issued_date": None,
            "expiration_date": None,
            "days_remaining": None,
            "ssl_error": f"SSL certificate verification failed: {e.reason}",
        }
    except ssl.SSLError as e:
        return {
            "valid": False,
            "issuer": None,
            "subject": None,
            "common_name": None,
            "sans": [],
            "signature_algorithm": None,
            "issued_date": None,
            "expiration_date": None,
            "days_remaining": None,
            "ssl_error": f"SSL handshake failed: {e}",
        }
    except socket.timeout:
        return {
            "valid": False,
            "issuer": None,
            "subject": None,
            "common_name": None,
            "sans": [],
            "signature_algorithm": None,
            "issued_date": None,
            "expiration_date": None,
            "days_remaining": None,
            "ssl_error": "Connection timed out — HTTPS may not be supported",
        }
    except ConnectionRefusedError:
        return {
            "valid": False,
            "issuer": None,
            "subject": None,
            "common_name": None,
            "sans": [],
            "signature_algorithm": None,
            "issued_date": None,
            "expiration_date": None,
            "days_remaining": None,
            "ssl_error": "Port 443 refused — HTTPS is not enabled on this server",
        }
    except socket.gaierror:
        return {
            "valid": False,
            "issuer": None,
            "subject": None,
            "common_name": None,
            "sans": [],
            "signature_algorithm": None,
            "issued_date": None,
            "expiration_date": None,
            "days_remaining": None,
            "ssl_error": "DNS resolution failed — domain does not exist or is unreachable",
        }
    except Exception as e:
        return {
            "valid": False,
            "issuer": None,
            "subject": None,
            "common_name": None,
            "sans": [],
            "signature_algorithm": None,
            "issued_date": None,
            "expiration_date": None,
            "days_remaining": None,
            "ssl_error": f"SSL fetch failed: {e}",
        }

    # Parse the certificate fields
    subject_info = _parse_rdns(cert.get("subject", ()))
    issuer_info = _parse_rdns(cert.get("issuer", ()))

    common_name = subject_info.get("commonName")
    issuer_str = issuer_info.get("organizationName") or issuer_info.get("commonName")

    # SANs
    sans = [value for type_, value in cert.get("subjectAltName", []) if type_ == "DNS"]

    # Dates
    NOT_AFTER_FORMAT = "%b %d %H:%M:%S %Y %Z"
    not_before_raw = cert.get("notBefore")
    not_after_raw = cert.get("notAfter")

    try:
        not_after = datetime.strptime(not_after_raw, NOT_AFTER_FORMAT).replace(tzinfo=timezone.utc)
        issued = datetime.strptime(not_before_raw, NOT_AFTER_FORMAT).replace(tzinfo=timezone.utc)
        days_remaining = (not_after - datetime.now(timezone.utc)).days
        is_valid = days_remaining > 0
    except Exception:
        not_after = None
        issued = None
        days_remaining = None
        is_valid = True  # cert was retrieved, assume valid

    # Signature algorithm from extended attributes (Python 3.10+)
    sig_alg = cert.get("signatureAlgorithm") or cert.get("signature_algorithm")

    return {
        "valid": is_valid,
        "issuer": issuer_str,
        "issuer_detail": issuer_info,
        "subject": subject_info.get("organizationName") or common_name,
        "common_name": common_name,
        "sans": sans[:10],  # Cap at 10 to keep response size sane
        "signature_algorithm": sig_alg,
        "issued_date": issued.strftime("%Y-%m-%dT%H:%M:%SZ") if issued else None,
        "expiration_date": not_after.strftime("%Y-%m-%dT%H:%M:%SZ") if not_after else None,
        "days_remaining": days_remaining,
        "ssl_error": None,
    }


# ── DNS ───────────────────────────────────────────────────────────────── #

def _fetch_dns(hostname: str) -> dict:
    """
    Basic DNS resolution — A record only (no dnspython dependency).
    Returns resolved IPs or an empty list.
    """
    try:
        results = socket.getaddrinfo(hostname, None)
        ips = list({r[4][0] for r in results})
        return {"A": ips, "resolved": True, "error": None}
    except socket.gaierror as e:
        return {"A": [], "resolved": False, "error": str(e)}


# ── Redirect Chain ────────────────────────────────────────────────────── #

def _fetch_redirects(url: str, max_hops: int = 10) -> list:
    """Follow HTTP redirects and record each hop."""
    chain = []
    current = url
    try:
        opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler)
        opener.addheaders = [("User-Agent", "ThreatLens-URL-Inspector/1.0")]

        class _NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, req, fp, code, msg, headers, newurl):
                return None

        no_redir_opener = urllib.request.build_opener(_NoRedirect())
        no_redir_opener.addheaders = [("User-Agent", "ThreatLens-URL-Inspector/1.0")]

        for _ in range(max_hops):
            try:
                req = urllib.request.Request(current, method="HEAD")
                with no_redir_opener.open(req, timeout=5) as resp:
                    chain.append({"url": current, "status_code": resp.status})
                    break  # No redirect
            except urllib.error.HTTPError as e:
                chain.append({"url": current, "status_code": e.code})
                location = e.headers.get("Location")
                if location and e.code in (301, 302, 303, 307, 308):
                    if not location.startswith("http"):
                        from urllib.parse import urljoin
                        location = urljoin(current, location)
                    current = location
                else:
                    break
            except Exception:
                break
    except Exception:
        pass

    if not chain:
        chain = [{"url": url, "status_code": None}]
    return chain


# ── Threat Scoring ────────────────────────────────────────────────────── #

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "secure", "bank", "update", "account",
    "crypto", "free", "malicious", "phish", "credential", "signin",
    "password", "paypal", "amazon", "microsoft", "apple", "google",
    "support", "alert", "confirm", "suspended", "billing",
]

def _compute_threat_score(
    url: str,
    parsed_domain: dict,
    whois_data: dict,
    ssl_data: dict,
    dns_data: dict,
) -> tuple[int, list[str], list[dict]]:
    """
    Rule-based threat scoring.
    Returns (score 0-100, list of triggered rule labels, list of IOC dicts).
    """
    score = 0
    rules = []
    iocs = []
    url_lower = url.lower()
    hostname = parsed_domain["hostname"]
    root_domain = parsed_domain["root_domain"]

    # Rule 1 — Suspicious keywords in URL path/query (skip if keyword IS the root domain)
    matched_kw = [
        kw for kw in SUSPICIOUS_KEYWORDS
        if kw in url_lower and kw not in root_domain  # avoid false-positive on e.g. google.com, amazon.com
    ]
    if matched_kw:
        score += min(30, len(matched_kw) * 10)
        rules.append(f"Suspicious keywords detected: {', '.join(matched_kw[:3])}")
        iocs.append({"type": "URL", "value": url, "description": f"Keywords: {', '.join(matched_kw[:3])}"})

    # Rule 2 — Brand impersonation (subdomain spoofing trusted brand)
    trusted_brands = ["amazon", "google", "microsoft", "apple", "paypal", "facebook", "instagram"]
    if parsed_domain.get("subdomain"):
        sub_lower = parsed_domain["subdomain"].lower()
        for brand in trusted_brands:
            if brand in sub_lower and brand not in root_domain:
                score += 30
                rules.append(f"Subdomain impersonates '{brand}' on unrelated domain '{root_domain}'")
                iocs.append({"type": "Domain", "value": hostname, "description": f"Brand impersonation: {brand}"})
                break

    # Rule 3 — Very young domain (< 30 days)
    age_days = whois_data.get("domain_age_days")
    if age_days is not None and age_days < 30:
        score += 20
        rules.append(f"Domain is very new ({age_days} days old)")

    # Rule 4 — SSL missing or invalid
    if not ssl_data.get("valid"):
        score += 15
        rules.append("No valid SSL certificate")

    # Rule 5 — SSL expiring soon (< 7 days)
    days_rem = ssl_data.get("days_remaining")
    if days_rem is not None and 0 < days_rem < 7:
        score += 10
        rules.append(f"SSL certificate expires in {days_rem} days")

    # Rule 6 — DNS resolution failure
    if not dns_data.get("resolved"):
        score += 10
        rules.append("Domain failed DNS resolution")

    # Rule 7 — High-entropy / unusual domain
    if re.search(r"[a-z0-9]{15,}", root_domain.split(".")[0]):
        score += 10
        rules.append("Domain name has suspicious high-entropy string")

    # Rule 8 — IP in hostname
    if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", hostname):
        score += 20
        rules.append("URL uses a raw IP address instead of a domain name")
        iocs.append({"type": "IPv4", "value": hostname, "description": "Raw IP in URL"})

    # Resolved IPs as IOCs only when suspicious
    if score > 40 and dns_data.get("A"):
        for ip in dns_data["A"][:2]:
            iocs.append({"type": "IPv4", "value": ip, "description": "Resolved IP of suspicious domain"})

    return min(100, max(0, score)), rules, iocs


# ── Summary ───────────────────────────────────────────────────────────── #

def _generate_summary(threat_score: int, rules: list[str], parsed_domain: dict, whois_data: dict) -> str:
    root = parsed_domain["root_domain"]
    age = whois_data.get("domain_age", {})
    age_label = age.get("label", "unknown age") if age else "unknown age"

    if threat_score >= 75:
        detail = f" Triggered rules: {'; '.join(rules[:3])}." if rules else ""
        return (
            f"This URL presents a HIGH threat level (score {threat_score}/100).{detail} "
            f"Exercise extreme caution — do not enter credentials or personal information."
        )
    if threat_score >= 40:
        detail = f" Notable findings: {'; '.join(rules[:2])}." if rules else ""
        return (
            f"This URL shows SUSPICIOUS characteristics (score {threat_score}/100).{detail} "
            f"Proceed with caution and verify the legitimacy of the site before interacting."
        )
    registrar = whois_data.get("registrar") or "an unknown registrar"
    return (
        f"This URL appears to be from a legitimate, established domain ({root}, {age_label} old, "
        f"registered via {registrar}). No significant threat indicators were detected (score {threat_score}/100)."
    )


# ── Main Service ──────────────────────────────────────────────────────── #

class URLInvestigatorService:

    @staticmethod
    def is_valid_url(url: str) -> bool:
        try:
            result = urlparse(url)
            return all([result.scheme in ("http", "https"), result.netloc])
        except ValueError:
            return False

    @staticmethod
    def analyze(url: str) -> dict:
        if not URLInvestigatorService.is_valid_url(url):
            raise ValueError("Invalid URL format")

        now = datetime.now(timezone.utc)
        parsed = urlparse(url)

        # 1. Domain decomposition (always works, no network required)
        parsed_domain = _parse_domain(url)
        root_domain = parsed_domain["root_domain"]
        hostname = parsed_domain["hostname"]

        # 2. Real WHOIS lookup
        whois_data = _fetch_whois(root_domain)

        # 3. Real SSL certificate
        ssl_data = _fetch_ssl(hostname)

        # 4. Basic DNS resolution
        dns_data = _fetch_dns(hostname)

        # 5. Redirect chain (best-effort, non-blocking on error)
        try:
            redirect_chain = _fetch_redirects(url)
        except Exception:
            redirect_chain = [{"url": url, "status_code": None}]

        # 6. Threat scoring
        threat_score, rules_triggered, iocs = _compute_threat_score(
            url, parsed_domain, whois_data, ssl_data, dns_data
        )

        # 7. Summary
        summary = _generate_summary(threat_score, rules_triggered, parsed_domain, whois_data)

        # 8. Timeline — only add events we actually have dates for
        timeline = []
        if whois_data.get("creation_date"):
            timeline.append({"time": whois_data["creation_date"], "event": "Domain Registered"})
        if ssl_data.get("issued_date"):
            timeline.append({"time": ssl_data["issued_date"], "event": "SSL Certificate Issued"})
        if ssl_data.get("expiration_date"):
            timeline.append({"time": ssl_data["expiration_date"], "event": "SSL Certificate Expires"})
        if whois_data.get("updated_date"):
            timeline.append({"time": whois_data["updated_date"], "event": "WHOIS Last Updated"})
        timeline.append({"time": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "event": "URL Submitted for Analysis"})
        timeline.append({"time": (now + timedelta(seconds=1)).strftime("%Y-%m-%dT%H:%M:%SZ"), "event": "Analysis Complete"})
        timeline.sort(key=lambda x: x["time"])

        return {
            # ── Identification ──────────────────────────────────────────
            "url": url,
            "domain": hostname,
            "threat_score": threat_score,
            "summary": summary,
            "rules_triggered": rules_triggered,

            # ── Domain information (used by frontend 'domain_info' key) ─
            "domain_info": {
                "hostname": parsed_domain["hostname"],
                "root_domain": parsed_domain["root_domain"],
                "subdomain": parsed_domain["subdomain"],
                "tld": parsed_domain["tld"],
                "registrar": whois_data.get("registrar"),
                "creation_date": whois_data.get("creation_date"),
                "updated_date": whois_data.get("updated_date"),
                "expiration_date": whois_data.get("expiration_date"),
                "domain_age_days": whois_data.get("domain_age_days"),
                "domain_age_label": whois_data.get("domain_age", {}).get("label") if whois_data.get("domain_age") else None,
                "registrant_country": whois_data.get("registrant_country"),
                "name_servers": whois_data.get("name_servers", []),
                "whois_privacy": whois_data.get("whois_privacy"),
                "whois_status": whois_data.get("status", []),
                "whois_error": whois_data.get("whois_error"),
            },

            # ── SSL information (used by frontend 'ssl_info' key) ────────
            "ssl_info": {
                "valid": ssl_data.get("valid", False),
                "issuer": ssl_data.get("issuer"),
                "issuer_detail": ssl_data.get("issuer_detail"),
                "subject": ssl_data.get("subject"),
                "common_name": ssl_data.get("common_name"),
                "sans": ssl_data.get("sans", []),
                "signature_algorithm": ssl_data.get("signature_algorithm"),
                "issued_date": ssl_data.get("issued_date"),
                "expiration_date": ssl_data.get("expiration_date"),
                "days_remaining": ssl_data.get("days_remaining"),
                "ssl_error": ssl_data.get("ssl_error"),
            },

            # ── DNS ───────────────────────────────────────────────────────
            "dns": {
                "A": dns_data.get("A", []),
                "resolved": dns_data.get("resolved", False),
                "error": dns_data.get("error"),
            },

            # ── Redirect chain ───────────────────────────────────────────
            "redirect_chain": redirect_chain,

            # ── IOCs ─────────────────────────────────────────────────────
            "iocs": iocs,

            # ── Timeline ─────────────────────────────────────────────────
            "timeline": timeline,
        }
