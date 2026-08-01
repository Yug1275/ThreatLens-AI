import phonenumbers
from phonenumbers import geocoder, carrier, number_type, PhoneNumberType
from typing import Dict, Any

class PhoneInvestigatorService:
    @classmethod
    def analyze(cls, phone_number: str) -> Dict[str, Any]:
        indicators = []
        threat_score = 5 # base score
        timeline = ["Phone Submitted", "Validation Completed"]
        
        try:
            # Parse the number. If no country code, fallback to US/IN is tricky, 
            # so we let phonenumbers attempt it. If it fails without a region, it throws NumberParseException.
            if not phone_number.startswith('+'):
                # Try parsing with US default if no +, but let's just let phonenumbers try
                # We can try a few common regions if they didn't provide +
                try:
                    parsed = phonenumbers.parse(phone_number, "US")
                except phonenumbers.NumberParseException:
                    parsed = phonenumbers.parse(phone_number, "IN") # Attempt IN
            else:
                parsed = phonenumbers.parse(phone_number)
                
            if not phonenumbers.is_possible_number(parsed) or not phonenumbers.is_valid_number(parsed):
                raise ValueError("Invalid phone number format or impossible number.")
                
            timeline.append("Phone Parsed")
                
            # Formatting
            e164 = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
            intl = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.INTERNATIONAL)
            national = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.NATIONAL)
            
            # Geo & Carrier
            country_name = geocoder.description_for_number(parsed, "en") or "Unknown"
            region_code = phonenumbers.region_code_for_number(parsed) or "Unknown"
            phone_carrier = carrier.name_for_number(parsed, "en") or "Unavailable"
            country_code = f"+{parsed.country_code}"
            timeline.append("Carrier Lookup Completed")
            
            # Type
            p_type = number_type(parsed)
            type_str = cls._get_type_string(p_type)
            
            # Rules
            if p_type == PhoneNumberType.PREMIUM_RATE:
                threat_score += 30
                indicators.append("Premium Rate Number Detected")
            elif p_type in [PhoneNumberType.VOIP, PhoneNumberType.PERSONAL_NUMBER]:
                threat_score += 15
                indicators.append("Possible VoIP or Virtual Number (often used for masking)")
            elif p_type == PhoneNumberType.TOLL_FREE:
                threat_score += 5
                indicators.append("Toll-Free Number")
                
            # High risk countries (demo list)
            high_risk_countries = ["Nigeria", "Somalia", "Russia", "North Korea"]
            if country_name in high_risk_countries:
                threat_score += 25
                indicators.append(f"High-Risk Country Code ({country_name})")
                
            timeline.append("Threat Analysis Completed")
            timeline.append("Investigation Completed")
            
            threat_score = min(threat_score, 100)
            
            # Risk Level
            risk_level = "Safe"
            if threat_score > 60:
                risk_level = "High"
            elif threat_score > 40:
                risk_level = "Medium"
            elif threat_score > 20:
                risk_level = "Low"
                
            # Recommendations
            recommendations = []
            if threat_score > 40:
                recommendations.append("Exercise caution. This number has suspicious indicators.")
            if p_type == PhoneNumberType.PREMIUM_RATE:
                recommendations.append("Avoid calling this number to prevent unexpected charges.")
            if not recommendations:
                recommendations.append("Number appears safe, but always verify the caller's identity.")
            
            from datetime import datetime, timezone
            
            return {
                "original_number": phone_number,
                "normalized_number": e164,
                "e164_number": e164,
                "international_format": intl,
                "national_format": national,
                "country_name": country_name,
                "country_code": country_code,
                "region": region_code,
                "carrier": phone_carrier,
                "line_type": type_str,
                "risk_level": risk_level,
                "threat_score": threat_score,
                "matched_rules": indicators,
                "recommendations": recommendations,
                "investigation_timestamp": datetime.now(timezone.utc).isoformat(),
                "timeline": timeline
            }
            
        except phonenumbers.NumberParseException as e:
            raise ValueError("Failed to parse phone number. Ensure it includes a valid country code (e.g., +1, +91).")

    @staticmethod
    def _get_type_string(p_type: int) -> str:
        mapping = {
            PhoneNumberType.FIXED_LINE: "Fixed Line",
            PhoneNumberType.MOBILE: "Mobile",
            PhoneNumberType.FIXED_LINE_OR_MOBILE: "Fixed Line or Mobile",
            PhoneNumberType.TOLL_FREE: "Toll Free",
            PhoneNumberType.PREMIUM_RATE: "Premium Rate",
            PhoneNumberType.SHARED_COST: "Shared Cost",
            PhoneNumberType.VOIP: "VoIP",
            PhoneNumberType.PERSONAL_NUMBER: "Personal Number",
            PhoneNumberType.PAGER: "Pager",
            PhoneNumberType.UAN: "UAN",
            PhoneNumberType.VOICEMAIL: "Voicemail",
            PhoneNumberType.UNKNOWN: "Unknown"
        }
        return mapping.get(p_type, "Unknown")
