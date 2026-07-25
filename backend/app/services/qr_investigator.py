import random

class QRInvestigatorService:
    @staticmethod
    def analyze(filename: str, filesize: int) -> dict:
        """
        Mocks the QR decoding and analysis.
        Since we don't do real QR decoding in Phase 4C, we return mock embedded URL, 
        and threat analysis.
        """
        
        is_suspicious = "malicious" in filename.lower() or "phishing" in filename.lower()
        
        if is_suspicious:
            embedded_url = "https://secure-login.bank-update-portal.com/auth"
            ai_summary = (
                "The embedded URL in this QR code directs to a known phishing domain attempting "
                "to impersonate a banking institution. It uses a deceptive subdomain structure "
                "to bypass simple filters. Do not open or scan this QR code on a personal device."
            )
            threat_score = random.randint(85, 99)
        else:
            embedded_url = "https://www.example.com/menu.pdf"
            ai_summary = (
                "The QR code contains a standard URL directing to a PDF document. "
                "The domain is reputable and no malicious redirect chains were detected. "
                "This appears to be a typical restaurant menu or informational brochure."
            )
            threat_score = random.randint(1, 10)
            
        return {
            "filename": filename,
            "filesize_bytes": filesize,
            "embedded_url": embedded_url,
            "ai_summary": ai_summary,
            "threat_score": threat_score,
            "is_suspicious": is_suspicious
        }
