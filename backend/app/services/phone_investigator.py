import random
import re

class PhoneInvestigatorService:
    @staticmethod
    def analyze(phone_number: str) -> dict:
        """
        Mocks the phone lookup and analysis.
        Returns mock location, carrier, line type, spam score, and risk score.
        """
        # Clean the input slightly for heuristic checking
        clean_num = re.sub(r'\D', '', phone_number)
        
        # Simple heuristic to trigger malicious path for demonstration
        # E.g. starts with +234 (Nigeria) or ends in "555" (classic fake/spam pattern)
        is_suspicious = clean_num.startswith('234') or "555" in clean_num or len(clean_num) > 13
        
        if is_suspicious:
            threat_score = random.randint(75, 99)
            spam_reputation = "High"
            country = "Nigeria (NG)" if clean_num.startswith('234') else "Unknown / Masked"
            carrier = "VoIP Provider LLC"
            line_type = "VoIP"
            validity = "Valid"
            ai_summary = (
                "This number exhibits strong indicators of being used for spam or fraudulent activity. "
                "It utilizes a VoIP line often leveraged by call centers to mask their true origin. "
                "Multiple user reports flag this number for aggressive telemarketing and phishing."
            )
        else:
            threat_score = random.randint(1, 20)
            spam_reputation = "Low"
            country = "United States (US)"
            carrier = "Verizon Wireless"
            line_type = "Mobile"
            validity = "Valid"
            ai_summary = (
                "This is a standard mobile number with a clean reputation history. "
                "No significant spam reports or malicious associations were found in "
                "global threat intelligence databases."
            )
            
        return {
            "threat_score": threat_score,
            "is_suspicious": is_suspicious,
            "phone_number": phone_number,
            "location": {
                "country": country,
                "city": "Lagos" if clean_num.startswith('234') else "New York",
            },
            "carrier_info": {
                "name": carrier,
                "line_type": line_type,
                "valid": validity
            },
            "spam_reputation": spam_reputation,
            "summary": ai_summary
        }
