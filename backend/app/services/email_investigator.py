import re
import email
from email import policy
from email.parser import Parser
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
            "spf": "Not Available",
            "dkim": "Not Available",
            "dmarc": "Not Available"
        }
        sender_analysis = {
            "envelope_from": "Not Available",
            "header_from": "Not Available",
            "reply_to": "Not Available",
            "mismatch": False
        }
        
        full_text = ""
        
        if raw_headers:
            # Parse raw headers using Python's email library
            msg = email.message_from_string(raw_headers, policy=policy.default)
            
            # Extract basic info
            h_from = msg.get('From', '')
            h_reply_to = msg.get('Reply-To', '')
            h_subject = msg.get('Subject', '')
            h_return_path = msg.get('Return-Path', '')
            
            sender_analysis["header_from"] = h_from
            sender_analysis["reply_to"] = h_reply_to
            sender_analysis["envelope_from"] = h_return_path
            
            # Extract emails for comparison
            h_from_email = cls._extract_email_address(h_from)
            env_from_email = cls._extract_email_address(h_return_path)
            
            if h_from_email and env_from_email and h_from_email.lower() != env_from_email.lower():
                sender_analysis["mismatch"] = True
                threat_score += 20
                indicators.append("Mismatch between Envelope From and Header From")
                
            # Parse Authentication-Results
            auth_header = str(msg.get('Authentication-Results', '')).lower()
            if auth_header:
                auth_results["spf"] = "Pass" if "spf=pass" in auth_header else ("Fail" if "spf=" in auth_header else "Not Available")
                auth_results["dkim"] = "Pass" if "dkim=pass" in auth_header else ("Fail" if "dkim=" in auth_header else "Not Available")
                auth_results["dmarc"] = "Pass" if "dmarc=pass" in auth_header else ("Fail" if "dmarc=" in auth_header else "Not Available")
                
                # Penalize failures
                if auth_results["spf"] == "Fail": threat_score += 20; indicators.append("SPF Authentication Failed")
                if auth_results["dkim"] == "Fail": threat_score += 20; indicators.append("DKIM Authentication Failed")
                if auth_results["dmarc"] == "Fail": threat_score += 20; indicators.append("DMARC Authentication Failed")
            else:
                indicators.append("Authentication-Results header missing")
                
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
            sender_analysis["header_from"] = sender_email or ""
            sender_analysis["envelope_from"] = "Not Provided"
            sender_analysis["reply_to"] = "Not Provided"
            indicators.append("Authentication skipped: Raw email headers were not supplied.")
            full_text = f"{sender_email}\n{subject}\n{body}"
            
        # Typosquatting Detection
        header_email = cls._extract_email_address(sender_analysis["header_from"])
        if header_email:
            domain = header_email.split('@')[-1].lower()
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
        
        return {
            "threat_score": threat_score,
            "is_suspicious": threat_score > 40,
            "auth_results": auth_results,
            "sender_analysis": sender_analysis,
            "indicators": indicators,
            "iocs": iocs,
            "summary": "AI Investigation Summary will be available in Phase 9."
        }

    @staticmethod
    def _extract_email_address(text: str) -> str:
        if not text: return ""
        match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        return match.group(0) if match else ""
        
    @staticmethod
    def _is_typosquat(domain: str, target: str) -> bool:
        # Simple heuristic for typosquatting (e.g. amaz0n.com vs amazon.com)
        if domain == target:
            return False
            
        # If lengths are drastically different, probably not typosquat
        if abs(len(domain) - len(target)) > 2:
            return False
            
        # Levenshtein distance simplified
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
        # simplified domain extraction for demo
        domain_pattern = r'(?<=@)[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        for d in set(re.findall(domain_pattern, text)):
            if d not in seen:
                iocs.append({"type": "Domain", "value": d})
                seen.add(d)
            
        # Emails
        email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        for e in set(re.findall(email_pattern, text)):
            if e not in seen:
                iocs.append({"type": "Email", "value": e})
                seen.add(e)
            
        # Phones
        phone_pattern = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        for p in set(re.findall(phone_pattern, text)):
            if p not in seen:
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
