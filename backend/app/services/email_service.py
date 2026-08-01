import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger("auth.email")

class EmailService:
    @staticmethod
    def send_otp_email(to_email: str, otp: str):
        if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
            logger.warning(f"SMTP credentials not configured. OTP generated for {to_email}: {otp}")
            return False

        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = "ThreatLens AI - Password Reset Verification Code"
        
        body = f"""Hello,

You requested a password reset for your ThreatLens AI account.

Your 6-digit verification code is: {otp}

This code is valid for 15 minutes. If you did not request this, please ignore this email.

Best regards,
ThreatLens AI Security Team
"""
        msg.attach(MIMEText(body, 'plain'))
        
        try:
            server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            logger.info(f"OTP email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

email_service = EmailService()
