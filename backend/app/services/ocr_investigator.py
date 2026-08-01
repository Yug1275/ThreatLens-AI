import re
import math
from typing import Dict, Any, List

class OCRInvestigatorService:
    _reader = None

    @classmethod
    def get_reader(cls):
        if cls._reader is None:
            import easyocr
            # We initialize EasyOCR for English only
            # It will download weights on first run to ~/.EasyOCR/model if not present
            cls._reader = easyocr.Reader(['en'])
        return cls._reader

    @classmethod
    def analyze(cls, file_bytes: bytes) -> Dict[str, Any]:
        reader = cls.get_reader()
        
        # EasyOCR can directly read from bytes
        results = reader.readtext(file_bytes)
        
        # results is a list of tuples: (bbox, text, prob)
        extracted_text = []
        total_prob = 0
        count = 0
        
        for bbox, text, prob in results:
            extracted_text.append(text)
            total_prob += prob
            count += 1
            
        full_text = " ".join(extracted_text)
        avg_confidence = (total_prob / count) if count > 0 else 0
        
        # Entity Extraction
        iocs = cls._extract_entities(full_text)
        
        # Rule-based Threat Detection
        threat_score, matched_rules = cls._detect_threats(full_text)
        
        # Threat score adjustments based on IOCs
        if any(ioc["type"] == "URL" for ioc in iocs):
            threat_score += 15
        if any(ioc["type"] == "Crypto Wallet" for ioc in iocs):
            threat_score += 30
            
        # Cap score
        threat_score = min(threat_score, 99)
        
        # Logic to generate recommendations based on matched rules and IOCs
        recommendations = []
        if threat_score > 50:
            recommendations.append("High threat detected: Do not interact with this content.")
        if "Credential Request" in matched_rules:
            recommendations.append("Do not enter credentials on any site linked in this document.")
            
        return {
            "extracted_text": full_text,
            "confidence_score": round(avg_confidence * 100, 2),
            "threat_score": threat_score,
            "matched_rules": matched_rules,
            "iocs": iocs,
            "recommendations": recommendations
        }
        
    @staticmethod
    def _extract_entities(text: str) -> List[Dict[str, str]]:
        iocs = []
        
        # URLs
        url_pattern = r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+'
        urls = set(re.findall(url_pattern, text))
        for u in urls:
            iocs.append({"type": "URL", "value": u})
            
        # Emails
        email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        emails = set(re.findall(email_pattern, text))
        for e in emails:
            iocs.append({"type": "Email", "value": e})
            
        # Phones (Basic international/US format approximation)
        phone_pattern = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phones = set(re.findall(phone_pattern, text))
        for p in phones:
            iocs.append({"type": "Phone", "value": p})
            
        # Crypto Wallets (BTC, ETH approximations)
        btc_pattern = r'\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b'
        eth_pattern = r'\b0x[a-fA-F0-9]{40}\b'
        for b in set(re.findall(btc_pattern, text)):
            iocs.append({"type": "Crypto Wallet", "value": b})
        for e in set(re.findall(eth_pattern, text)):
            iocs.append({"type": "Crypto Wallet", "value": e})
            
        # IPv4
        ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
        ips = set(re.findall(ip_pattern, text))
        for ip in ips:
            iocs.append({"type": "IP", "value": ip})
            
        # OTP codes (look for 6 digit codes near "code", "otp")
        if "code" in text.lower() or "otp" in text.lower():
            otp_pattern = r'\b\d{6}\b'
            otps = set(re.findall(otp_pattern, text))
            for otp in otps:
                iocs.append({"type": "OTP", "value": otp})
                
        return iocs
        
    @staticmethod
    def _detect_threats(text: str):
        lower_text = text.lower()
        score = 5 # base score
        matched_rules = []
        
        rules = {
            "Urgent Language": (["urgent", "immediate", "action required", "suspended", "expire"], 15),
            "Credential Request": (["password", "login", "credentials", "sign in", "verify your account"], 25),
            "Banking Terminology": (["bank", "account", "transaction", "payment", "invoice", "billing"], 10),
            "Brand Impersonation": (["paypal", "netflix", "amazon", "apple", "microsoft", "google"], 20),
            "Cryptocurrency Scams": (["bitcoin", "btc", "wallet", "seed phrase", "eth", "crypto"], 30),
            "Giveaway Scams": (["winner", "giveaway", "prize", "claim", "lottery", "free"], 20)
        }
        
        for rule_name, (keywords, weight) in rules.items():
            if any(kw in lower_text for kw in keywords):
                score += weight
                matched_rules.append(rule_name)
                
        return score, matched_rules
