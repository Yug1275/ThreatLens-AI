import cv2
import numpy as np
import re
from typing import Dict, Any

class QRInvestigatorService:
    _detector = None

    @classmethod
    def get_detector(cls):
        if cls._detector is None:
            # cv2 is available via opencv-python-headless (installed with easyocr)
            cls._detector = cv2.QRCodeDetector()
        return cls._detector

    @classmethod
    def analyze(cls, file_bytes: bytes) -> Dict[str, Any]:
        detector = cls.get_detector()
        
        # Convert bytes to numpy array for cv2
        np_arr = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Invalid image file.")
            
        data, bbox, straight_qrcode = detector.detectAndDecode(img)
        
        if not data:
            # If standard detector fails, try again with WechatQRCode if available, or just fail
            raise ValueError("No QR code detected or unable to decode.")
            
        # Parse content type
        qr_type = "Plain Text"
        metadata = {}
        
        if re.match(r'^https?://', data, re.IGNORECASE):
            qr_type = "URL"
        elif re.match(r'^(mailto:|[\w\.-]+@[\w\.-]+\.\w+)', data, re.IGNORECASE):
            qr_type = "Email"
        elif re.match(r'^(tel:|sms:)', data, re.IGNORECASE):
            qr_type = "Phone"
        elif data.upper().startswith("WIFI:"):
            qr_type = "WiFi"
            # Extract WIFI:S:MyNetwork;T:WPA;P:MyPassword;H:false;;
            s_match = re.search(r'S:(.*?);', data)
            t_match = re.search(r'T:(.*?);', data)
            p_match = re.search(r'P:(.*?);', data)
            h_match = re.search(r'H:(.*?);', data)
            metadata = {
                "ssid": s_match.group(1) if s_match else "Unknown",
                "auth": t_match.group(1) if t_match else "None",
                "password_hidden": h_match.group(1).lower() == 'true' if h_match else False,
                "has_password": bool(p_match)
            }
        elif data.upper().startswith("BEGIN:VCARD") or data.upper().startswith("BEGIN:MECARD"):
            qr_type = "Contact Card"
        elif data.upper().startswith("GEO:"):
            qr_type = "Geo Location"

        # Rule-based Threat Detection
        threat_score = 5
        matched_rules = []
        lower_data = data.lower()
        
        if qr_type == "URL":
            # Shortened URLs
            shorteners = ['bit.ly', 'tinyurl', 't.co', 'goo.gl', 'ow.ly', 'is.gd']
            if any(s in lower_data for s in shorteners):
                threat_score += 40
                matched_rules.append("Shortened URL Detected")
                
            # Executable downloads
            executables = ['.exe', '.apk', '.sh', '.bat', '.dmg']
            if any(lower_data.endswith(ext) for ext in executables):
                threat_score += 60
                matched_rules.append("Executable Download Link")
                
            # Phishing keywords
            phish_keywords = ['login', 'verify', 'update', 'secure', 'banking']
            if any(kw in lower_data for kw in phish_keywords):
                threat_score += 30
                matched_rules.append("Phishing Terminology")
                
        elif qr_type == "WiFi":
            if metadata.get("auth") in ["None", "WEP"]:
                threat_score += 25
                matched_rules.append(f"Insecure WiFi Protocol ({metadata.get('auth')})")

        threat_score = min(threat_score, 99)
            
        return {
            "content": data,
            "type": qr_type,
            "metadata": metadata,
            "threat_score": threat_score,
            "matched_rules": matched_rules,
            "summary": "AI Investigation Summary will be available in Phase 9."
        }
