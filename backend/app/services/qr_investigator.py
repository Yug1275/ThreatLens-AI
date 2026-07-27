import cv2
import numpy as np
import re
import json
import base64
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
        extracted_fields = {}
        application = "Unknown"
        purpose = "Unknown"

        # Attempt to parse as JSON first
        try:
            parsed_json = json.loads(data)
            if isinstance(parsed_json, (dict, list)):
                qr_type = "JSON"
                metadata["parsed"] = parsed_json
                
                # Recursive field extraction
                important_keys = {'token', 'session', 'userid', 'attendanceid', 'eventid', 'email', 'url', 'phone', 'otp', 'apikey', 'jwt', 'secret', 'hash', 'wallet'}
                
                def extract_fields(obj, current_dict):
                    if isinstance(obj, dict):
                        for k, v in obj.items():
                            if k.lower() in important_keys:
                                if isinstance(v, (str, int, float, bool)):
                                    current_dict[k] = v
                            extract_fields(v, current_dict)
                    elif isinstance(obj, list):
                        for item in obj:
                            extract_fields(item, current_dict)
                
                extract_fields(parsed_json, extracted_fields)
                
                # Application Detection
                str_data = data.lower()
                if "campusconnect" in str_data or "attendance" in str_data:
                    application = "CampusConnect"
                    purpose = "Attendance Verification"
                elif "whatsapp" in str_data:
                    application = "WhatsApp"
                elif "discord" in str_data:
                    application = "Discord"
                elif "google" in str_data and "authenticator" in str_data:
                    application = "Google Authenticator"
                    purpose = "2FA Authentication"
                elif "microsoft" in str_data and "authenticator" in str_data:
                    application = "Microsoft Authenticator"
                    purpose = "2FA Authentication"
                elif "zoom" in str_data:
                    application = "Zoom"
                elif "upi://" in str_data or "paytm" in str_data or "phonepe" in str_data or "gpay" in str_data or "google pay" in str_data:
                    if "paytm" in str_data: application = "Paytm"
                    elif "phonepe" in str_data: application = "PhonePe"
                    elif "gpay" in str_data or "google pay" in str_data: application = "Google Pay"
                    else: application = "UPI App"
                    purpose = "Payment"
                elif "github" in str_data:
                    application = "GitHub"
                elif isinstance(parsed_json, dict) and "type" in parsed_json:
                    application = str(parsed_json.get("type", "Custom Enterprise App")).title()
                    purpose = "Custom Application Action"
                elif isinstance(parsed_json, dict) and "app" in parsed_json:
                    application = str(parsed_json.get("app", "Custom Enterprise App")).title()
                    purpose = "Custom Application Action"
                
                metadata["application"] = application
                metadata["purpose"] = purpose
                metadata["extracted_fields"] = extracted_fields
            else:
                raise ValueError("Parsed JSON is not dict or list")
        except (ValueError, json.JSONDecodeError, TypeError):
            # Fallback format parsing
            if re.match(r'^https?://', data, re.IGNORECASE):
                qr_type = "URL"
            elif re.match(r'^mailto:', data, re.IGNORECASE) or re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', data, re.IGNORECASE):
                qr_type = "Email"
            elif re.match(r'^tel:', data, re.IGNORECASE):
                qr_type = "Phone"
            elif re.match(r'^sms:', data, re.IGNORECASE):
                qr_type = "SMS"
            elif data.upper().startswith("WIFI:"):
                qr_type = "WiFi"
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
            elif data.upper().startswith("BEGIN:VEVENT"):
                qr_type = "Calendar Event"
            elif re.match(r'^(bitcoin|ethereum|litecoin|bitcoincash|dogecoin|solana|polygon|xrp):', data, re.IGNORECASE) or re.match(r'^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$', data):
                qr_type = "Cryptocurrency Address"
            elif re.match(r'^otpauth://', data, re.IGNORECASE):
                qr_type = "Authentication Tokens"
                if "issuer=Google" in data: metadata["application"] = "Google Authenticator"
                elif "issuer=Microsoft" in data: metadata["application"] = "Microsoft Authenticator"
                metadata["purpose"] = "2FA Authentication"
            elif data.upper().startswith("GEO:"):
                qr_type = "Geo Location"
            elif re.match(r'^upi://pay', data, re.IGNORECASE):
                qr_type = "URL"
            else:
                # Check for Base64
                try:
                    if len(data) > 20 and re.match(r'^[A-Za-z0-9+/]+={0,2}$', data):
                        decoded = base64.b64decode(data).decode('utf-8')
                        qr_type = "Base64"
                        metadata["decoded_base64"] = decoded
                except:
                    pass
                
                # Check for binary non-printable
                if any(ord(char) < 32 and ord(char) not in (9, 10, 13) for char in data):
                    qr_type = "Unknown Binary"

        # Rule-based Threat Detection
        threat_score = 5
        matched_rules = []
        lower_data = data.lower()
        
        # Global Security Checks
        if "<script" in lower_data or "javascript:" in lower_data or "eval(" in lower_data or "alert(" in lower_data:
            threat_score += 50
            matched_rules.append("Embedded JavaScript Detected")
            
        if re.search(r'ey[a-zA-Z0-9_-]+\.ey[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+', data):
            matched_rules.append("JWT Token Detected")
            
        if "api_key" in lower_data or "apikey" in lower_data or "secret" in lower_data or "password" in lower_data:
            threat_score += 20
            matched_rules.append("Credential or Secret Embedded")
            
        if re.search(r'(\b(select|insert|update|delete|drop|union)\b.*?;)', lower_data):
            threat_score += 50
            matched_rules.append("SQL Injection Keywords")
            
        if "powershell" in lower_data or "cmd.exe" in lower_data or "/bin/sh" in lower_data or "/bin/bash" in lower_data:
            threat_score += 70
            matched_rules.append("Shell Command Detected")
            
        if re.search(r'(c:\\windows|/etc/passwd|/var/log)', lower_data):
            threat_score += 30
            matched_rules.append("File Path Reference")
            
        if re.search(r'https?://', lower_data) and qr_type != "URL":
            matched_rules.append("Embedded URLs Detected")
        
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
        
        # Recommendations
        recommendations = []
        if threat_score > 40:
            recommendations.append("Exercise caution before proceeding.")
            if "Executable Download Link" in matched_rules:
                recommendations.append("Do not download or execute the linked file.")
            if "Embedded JavaScript Detected" in matched_rules:
                recommendations.append("Do not copy or paste the payload into any browser console or script environment.")
            if "Credential or Secret Embedded" in matched_rules:
                recommendations.append("Be careful, secrets or credentials might be exposed.")
        else:
            recommendations.append("No immediate threats detected, but always verify the source.")
            
        return {
            "content": data,
            "type": qr_type,
            "metadata": metadata,
            "threat_score": threat_score,
            "indicators": matched_rules,
            "recommendations": recommendations,
            "summary": "AI Investigation Summary will be available in Phase 9."
        }
