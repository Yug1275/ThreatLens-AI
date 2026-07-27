import re
import email
from email import policy
from typing import Dict, Any, List

class EmailInvestigatorService:
    TARGET_DOMAINS = [
        "google.com", "amazon.com", "paypal.com", "microsoft.com", 
        "apple.com", "facebook.com", "instagram.com", "linkedin.com", "github.com"
    ]

    @classmethod
    def analyze(cls, raw_headers: str = None, sender_email: str = None, subject: str = None, body: str = None) -> Dict[str, Any]:
        """
        Parses either raw headers or structured email input.
        """
        iocs = []
        indicators = []
        threat_score = 5 # Base score
        
        # Auth defaults
        auth_results = {
            "spf": "Unavailable",
            "dkim": "Unavailable",
            "dmarc": "Unavailable"
        }
        sender_analysis = {
            "envelope_from": "Not Provided",
            "header_from": "Not Provided",
            "reply_to": "Not Provided",
            "mismatch": False
        }
        
        full_text = ""
        input_mode = "Structured Email"
        h_subject = "Not Provided"
        recipient = "Not Provided"
        date = "Not Provided"
        auth_header = "Not Provided"
        received_chain = []
        message_id = "Not Provided"
        originating_ip = "Not Provided"
        
        # New Gmail fields
        mailed_by = "Not Provided"
        signed_by = "Not Provided"
        security_tls = "Not Provided"
        mime_version = "Not Provided"
        content_type = "Not Provided"
        
        if raw_headers:
            input_mode = "Raw Headers"
            # Parse raw headers using Python's email library
            msg = email.message_from_string(raw_headers, policy=policy.default)
            
            # Extract basic info
            h_from = msg.get('From', 'Not Provided')
            h_reply_to = msg.get('Reply-To', 'Not Provided')
            h_subject = msg.get('Subject', 'Not Provided')
            h_return_path = msg.get('Return-Path', 'Not Provided')
            recipient = msg.get('To', 'Not Provided')
            message_id = msg.get('Message-ID', 'Not Provided')
            date = msg.get('Date', 'Not Provided')
            mime_version = msg.get('MIME-Version', 'Not Provided')
            content_type = msg.get('Content-Type', 'Not Provided')
            
            received_headers = msg.get_all('Received', [])
            if received_headers:
                received_chain = received_headers
                # Extract Originating IP
                ip_match = re.search(r'\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]', received_headers[-1])
                if ip_match:
                    originating_ip = ip_match.group(1)
                # Extract TLS Security
                for rh in received_headers:
                    tls_match = re.search(r'(TLS[\w.]+.*?cipher.*?)(?:\s|\)|$)', rh, re.IGNORECASE)
                    if tls_match:
                        security_tls = tls_match.group(1).strip()
                        break
            
            sender_analysis["header_from"] = h_from
            sender_analysis["reply_to"] = h_reply_to
            sender_analysis["envelope_from"] = h_return_path
            
            # Extract emails for comparison
            h_from_email = cls._extract_email_address(h_from)
            env_from_email = cls._extract_email_address(h_return_path)
            
            if h_from_email and env_from_email and h_from_email.lower() != env_from_email.lower():
                sender_analysis["mismatch"] = True
                threat_score += 20
                indicators.append("Mismatch between Envelope From (Return-Path) and Header From")
                
            # Mailed-By
            if env_from_email:
                mailed_by = env_from_email.split('@')[-1].lower()
            google_mailed_by = msg.get('X-Google-Mailed-By')
            if google_mailed_by:
                mailed_by = google_mailed_by.strip()
                
            # Signed-By (DKIM d=)
            dkim_headers = msg.get_all('DKIM-Signature', [])
            for dh in dkim_headers:
                d_match = re.search(r'\bd=([^;\s]+)', dh)
                if d_match:
                    signed_by = d_match.group(1).strip()
                    break

            # Parse Authentication-Results / Received-SPF
            auth_header_val = str(msg.get('Authentication-Results', ''))
            auth_header = auth_header_val if auth_header_val else "Not Provided"
            auth_lower = auth_header_val.lower()
            
            received_spf = str(msg.get('Received-SPF', '')).lower()
            
            # Determine SPF
            if "spf=pass" in auth_lower or received_spf.startswith("pass"):
                auth_results["spf"] = "Pass"
            elif "spf=fail" in auth_lower or "spf=softfail" in auth_lower or received_spf.startswith("fail") or received_spf.startswith("softfail"):
                auth_results["spf"] = "Fail"
            elif auth_lower or received_spf:
                auth_results["spf"] = "None"
            
            # Determine DKIM
            if "dkim=pass" in auth_lower:
                auth_results["dkim"] = "Pass"
            elif "dkim=fail" in auth_lower:
                auth_results["dkim"] = "Fail"
            elif auth_lower:
                auth_results["dkim"] = "None"
                
            # Determine DMARC
            if "dmarc=pass" in auth_lower:
                auth_results["dmarc"] = "Pass"
            elif "dmarc=fail" in auth_lower:
                auth_results["dmarc"] = "Fail"
            elif auth_lower:
                auth_results["dmarc"] = "None"
                
            # Penalize failures
            if auth_results["spf"] == "Fail": threat_score += 20; indicators.append("SPF Authentication Failed")
            if auth_results["dkim"] == "Fail": threat_score += 20; indicators.append("DKIM Authentication Failed")
            if auth_results["dmarc"] == "Fail": threat_score += 20; indicators.append("DMARC Authentication Failed")
            
            if not auth_lower and not received_spf:
                indicators.append("Authentication headers missing (No SPF/DKIM/DMARC found)")
                auth_results["spf"] = "Not Provided"
                auth_results["dkim"] = "Not Provided"
                auth_results["dmarc"] = "Not Provided"
                
            # If body is embedded in raw message
            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == 'text/plain':
                        full_text += str(part.get_payload(decode=True) or '')
            else:
                full_text += str(msg.get_payload(decode=True) or '')
                
            full_text = f"{raw_headers}\n{full_text}"
            
        else:
            # Mode 1: Structured
            sender_analysis["header_from"] = sender_email or "Not Provided"
            sender_analysis["envelope_from"] = "Not Provided"
            sender_analysis["reply_to"] = "Not Provided"
            h_subject = subject or "Not Provided"
            # Date can be assumed current if none provided in structured, but better left as Not Provided if we don't have it
            date = "Not Provided" 
            indicators.append("Authentication skipped: Raw email headers were not supplied.")
            full_text = f"{sender_email}\n{subject}\n{body}"
            
        # Typosquatting & Mismatch Detection
        header_email = cls._extract_email_address(sender_analysis["header_from"])
        sender_domain = "Not Provided"
        if header_email:
            sender_domain = header_email.split('@')[-1].lower()
            
            # Domain mismatches
            if signed_by != "Not Provided" and sender_domain != signed_by:
                threat_score += 15
                indicators.append(f"Domain Mismatch: Header From ({sender_domain}) does not match Signed-By ({signed_by})")
                
            if mailed_by != "Not Provided" and sender_domain != mailed_by and mailed_by != signed_by:
                threat_score += 15
                indicators.append(f"Domain Mismatch: Header From ({sender_domain}) does not match Mailed-By ({mailed_by})")
            
            domain = sender_domain
            if domain not in cls.TARGET_DOMAINS:
                # Check similarity
                for target in cls.TARGET_DOMAINS:
                    if cls._is_typosquat(domain, target):
                        threat_score += 40
                        indicators.append(f"Brand Impersonation / Typosquatting Detected: {domain} mimics {target}")
                        break
        
        # Rule-based Threat Detection
        score, rules_triggered = cls._detect_threats(full_text)
        threat_score += score
        indicators.extend(rules_triggered)
        
        # Extract IOCs
        iocs = cls._extract_entities(full_text)
        
        threat_score = min(threat_score, 99)
        risk_level = "Malicious" if threat_score > 75 else "Suspicious" if threat_score > 40 else "Safe"
        
        recommendations = []
        if threat_score > 40:
            recommendations.append("Do not click any embedded links or download attachments.")
            recommendations.append("Report this email to your security operations center.")
        else:
            recommendations.append("No immediate threats found, but proceed with caution.")

        return {
            "input_mode": input_mode,
            "sender": sender_analysis["header_from"],
            "sender_domain": sender_domain,
            "subject": h_subject,
            "reply_to": sender_analysis["reply_to"],
            "return_path": sender_analysis["envelope_from"],
            "recipient": recipient,
            "date": date,
            
            "mailed_by": mailed_by,
            "signed_by": signed_by,
            "security_tls": security_tls,
            "mime_version": mime_version,
            "content_type": content_type,
            
            "spf": auth_results["spf"],
            "dkim": auth_results["dkim"],
            "dmarc": auth_results["dmarc"],
            
            "authentication_results": auth_header,
            "received_chain": received_chain,
            "message_id": message_id,
            "originating_ip": originating_ip,
            
            "threat_score": threat_score,
            "risk_level": risk_level,
            "matched_rules": indicators,
            "extracted_iocs": iocs,
            "recommendations": recommendations,
            
            # Keep legacy fields just in case anything else depends on them implicitly
            "is_suspicious": threat_score > 40,
            "auth_results": auth_results,
            "sender_analysis": sender_analysis,
            "indicators": indicators,
            "iocs": iocs,
            
            "summary": "AI Investigation Summary will be available in Phase 9."
        }

    @staticmethod
    def _extract_email_address(text: str) -> str:
        if not text or text == "Not Provided": return ""
        # Using word boundary equivalent to avoid partial matching
        match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b', text)
        return match.group(0) if match else ""
        
    @staticmethod
    def _is_typosquat(domain: str, target: str) -> bool:
        if domain == target:
            return False
        if abs(len(domain) - len(target)) > 2:
            return False
        def levenshtein(s1, s2):
            if len(s1) < len(s2):
                return levenshtein(s2, s1)
            if len(s2) == 0:
                return len(s1)
            previous_row = range(len(s2) + 1)
            for i, c1 in enumerate(s1):
                current_row = [i + 1]
                for j, c2 in enumerate(s2):
                    insertions = previous_row[j + 1] + 1
                    deletions = current_row[j] + 1
                    substitutions = previous_row[j] + (c1 != c2)
                    current_row.append(min(insertions, deletions, substitutions))
                previous_row = current_row
            return previous_row[-1]
            
        dist = levenshtein(domain.split('.')[0], target.split('.')[0])
        return dist > 0 and dist <= 2

    @staticmethod
    def _extract_entities(text: str) -> List[Dict[str, str]]:
        iocs = []
        seen = set()
        
        # URLs
        url_pattern = r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+'
        for u in set(re.findall(url_pattern, text)):
            if u not in seen:
                iocs.append({"type": "URL", "value": u})
                seen.add(u)
                
        # Domains (extracted from emails or standalone)
        domain_pattern = r'(?<=@)[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        for d in set(re.findall(domain_pattern, text)):
            if d not in seen:
                iocs.append({"type": "Domain", "value": d})
                seen.add(d)
            
        # Emails with word boundaries
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
        for e in set(re.findall(email_pattern, text)):
            if e not in seen:
                iocs.append({"type": "Email", "value": e})
                seen.add(e)
            
        # Phones
        phone_pattern = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        for p in set(re.findall(phone_pattern, text)):
            # simple len check to avoid noise
            if p not in seen and len(re.sub(r'\D', '', p)) >= 10:
                iocs.append({"type": "Phone", "value": p})
                seen.add(p)
                
        # Crypto Wallets
        btc_pattern = r'\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b'
        eth_pattern = r'\b0x[a-fA-F0-9]{40}\b'
        for b in set(re.findall(btc_pattern, text)):
            if b not in seen: iocs.append({"type": "Crypto Wallet", "value": b}); seen.add(b)
        for e in set(re.findall(eth_pattern, text)):
            if e not in seen: iocs.append({"type": "Crypto Wallet", "value": e}); seen.add(e)
            
        # IPs
        ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
        for ip in set(re.findall(ip_pattern, text)):
            if ip not in seen: iocs.append({"type": "IP", "value": ip}); seen.add(ip)
            
        return iocs

    @staticmethod
    def _detect_threats(text: str):
        lower_text = text.lower()
        score = 0
        matched_rules = []
        
        rules = {
            "Urgent Language (Action Required/Immediate)": (["urgent", "verify now", "immediate action", "limited time"], 15),
            "Account Security Alert / Locked": (["account locked", "security alert", "suspended", "expired"], 15),
            "Credential Harvesting": (["password", "otp", "verify your account"], 25),
            "Financial Request / Invoice": (["bank", "invoice", "payment", "gift card"], 20),
            "Brand Impersonation Terms": (["paypal", "netflix", "amazon", "apple", "microsoft", "google", "github"], 10)
        }
        
        for rule_name, (keywords, weight) in rules.items():
            if any(kw in lower_text for kw in keywords):
                score += weight
                matched_rules.append(rule_name)
                
        return score, matched_rules
