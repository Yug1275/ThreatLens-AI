import random

class OCRInvestigatorService:
    @staticmethod
    def analyze(filename: str, filesize: int) -> dict:
        """
        Mocks the OCR extraction and analysis.
        Since we don't do real OCR in Phase 4B, we return mock text, 
        highlighted words, and an AI summary.
        """
        
        is_suspicious = "malicious" in filename.lower() or "phishing" in filename.lower()
        
        if is_suspicious:
            extracted_text = (
                "URGENT: Your account has been temporarily locked due to suspicious activity. "
                "Please click here immediately to verify your identity and restore access. "
                "Failure to act within 24 hours will result in permanent account deletion. "
                "Contact our support at admin@secure-login-update.com for help."
            )
            suspicious_words = ["URGENT", "locked", "suspicious", "click here immediately", "verify your identity", "permanent account deletion", "admin@secure-login-update.com"]
            ai_summary = (
                "The extracted text exhibits multiple classic signs of a phishing attempt, "
                "including a false sense of urgency ('URGENT', '24 hours'), threats of negative "
                "consequences ('permanent account deletion'), and a request to click a link to verify identity. "
                "The email address provided is likely illegitimate."
            )
            threat_score = random.randint(85, 98)
            confidence = 94.2
        else:
            extracted_text = (
                "Invoice #49281\n"
                "Date: Oct 12, 2026\n"
                "To: John Doe\n"
                "Amount Due: $150.00\n"
                "Please remit payment by Oct 26, 2026. Thank you for your business."
            )
            suspicious_words = []
            ai_summary = (
                "The extracted text appears to be a standard invoice. It contains typical billing "
                "information such as an invoice number, dates, and amounts. No common social engineering "
                "tactics or malicious indicators were detected."
            )
            threat_score = random.randint(5, 15)
            confidence = 98.7
            
        return {
            "filename": filename,
            "filesize_bytes": filesize,
            "extracted_text": extracted_text,
            "suspicious_words": suspicious_words,
            "ai_summary": ai_summary,
            "threat_score": threat_score,
            "confidence_score": confidence
        }
