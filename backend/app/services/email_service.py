import httpx
from app.core.config import settings
import logging

logger = logging.getLogger("auth.email")

class EmailService:
    @staticmethod
    def send_otp_email(to_email: str, otp: str):
        if not settings.RESEND_API_KEY:
            logger.warning(f"RESEND_API_KEY not configured. OTP generated for {to_email}: {otp}")
            return False

        headers = {
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json"
        }
        
        body = f"""Hello,

You requested a password reset for your ThreatLens AI account.

Your 6-digit verification code is: {otp}

This code is valid for 15 minutes. If you did not request this, please ignore this email.

Best regards,
ThreatLens AI Security Team
"""
        
        # Free resend accounts can only send from onboarding@resend.dev to the verified email
        # If the user verified a domain, they can change the 'from' address
        payload = {
            "from": "onboarding@resend.dev",
            "to": [to_email],
            "subject": "ThreatLens AI - Password Reset Verification Code",
            "text": body
        }
        
        try:
            with httpx.Client() as client:
                response = client.post("https://api.resend.com/emails", json=payload, headers=headers, timeout=10.0)
                response.raise_for_status()
                logger.info(f"OTP email sent successfully via Resend to {to_email}")
                return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email} via Resend: {e}")
            if hasattr(e, 'response') and e.response:
                logger.error(f"Response: {e.response.text}")
            return False

email_service = EmailService()
