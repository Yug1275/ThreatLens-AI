import re
from urllib.parse import urlparse
from datetime import datetime, timedelta, timezone

class URLInvestigatorService:
    @staticmethod
    def is_valid_url(url: str) -> bool:
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except ValueError:
            return False

    @staticmethod
    def _is_suspicious_pattern(url: str) -> bool:
        # Simple mock logic: if url contains certain words, mark as malicious
        suspicious_keywords = ["login", "verify", "secure", "bank", "update", "account", "crypto", "free", "malicious"]
        lower_url = url.lower()
        return any(keyword in lower_url for keyword in suspicious_keywords)

    @staticmethod
    def analyze(url: str) -> dict:
        if not URLInvestigatorService.is_valid_url(url):
            raise ValueError("Invalid URL format")
            
        parsed = urlparse(url)
        domain = parsed.netloc
        
        is_suspicious = URLInvestigatorService._is_suspicious_pattern(url)
        
        # Threat Score
        base_score = 85 if is_suspicious else 12
        # Add some randomness for realism
        threat_score = min(100, max(0, base_score + (len(domain) % 15) - 5))
        
        now = datetime.now(timezone.utc)
        
        # 1. Mock WHOIS Data
        creation_date = (now - timedelta(days=30 if is_suspicious else 3650)).strftime("%Y-%m-%dT%H:%M:%SZ")
        whois_data = {
            "registrar": "NameCheap, Inc." if is_suspicious else "MarkMonitor Inc.",
            "creation_date": creation_date,
            "expiration_date": (now + timedelta(days=335 if is_suspicious else 730)).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "domain_age_days": 30 if is_suspicious else 3650,
            "registrant_country": "RU" if is_suspicious else "US",
            "status": "clientTransferProhibited"
        }
        
        # 2. Mock DNS Lookup
        dns_data = {
            "A": ["192.168.1.100", "10.0.0.5"] if is_suspicious else ["142.250.190.46"],
            "MX": [f"mail.{domain}"] if not is_suspicious else [],
            "TXT": [f"v=spf1 include:_spf.{domain} ~all"]
        }
        
        # 3. Mock SSL Certificate
        ssl_data = {
            "issuer": "Let's Encrypt Authority X3" if is_suspicious else "DigiCert SHA2 High Assurance Server CA",
            "valid_from": (now - timedelta(days=10)).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "valid_to": (now + timedelta(days=80)).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "is_valid": True,
            "subject": domain
        }
        
        # 4. Mock Redirect Chain
        redirect_chain = [
            {"url": url, "status_code": 301},
            {"url": f"https://{domain}/tracking" if is_suspicious else f"https://www.{domain}/", "status_code": 302},
            {"url": f"https://{domain}/login-portal" if is_suspicious else f"https://www.{domain}/home", "status_code": 200}
        ]
        
        # 5. Mock IOCs (Indicators of Compromise)
        iocs = []
        if is_suspicious:
            iocs = [
                {"type": "IPv4", "value": "192.168.1.100", "description": "Known phishing infrastructure"},
                {"type": "URL", "value": f"https://{domain}/login-portal", "description": "Credential harvesting page"},
                {"type": "Email", "value": f"admin@{domain}", "description": "Associated with previous spam campaigns"}
            ]
            
        # 6. Timeline Generation
        timeline = [
            {"time": whois_data["creation_date"], "event": "Domain Registered"},
            {"time": ssl_data["valid_from"], "event": "SSL Certificate Issued"},
            {"time": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "event": "URL Submitted for Analysis"},
            {"time": (now + timedelta(seconds=2)).strftime("%Y-%m-%dT%H:%M:%SZ"), "event": "Redirect Chain Traced"},
            {"time": (now + timedelta(seconds=3)).strftime("%Y-%m-%dT%H:%M:%SZ"), "event": "Analysis Complete"}
        ]
            
        return {
            "url": url,
            "domain": domain,
            "threat_score": threat_score,
            "is_suspicious": is_suspicious,
            "whois": whois_data,
            "dns": dns_data,
            "ssl": ssl_data,
            "redirect_chain": redirect_chain,
            "iocs": iocs,
            "timeline": timeline,
            "summary": "This URL exhibits patterns strongly associated with phishing campaigns and was recently registered." if is_suspicious else "This URL appears to belong to a legitimate, established organization."
        }
