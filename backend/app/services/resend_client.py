import logging
import httpx
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"

async def send_email(to_email: str, subject: str, html_content: str) -> bool:
    api_key = settings.RESEND_API_KEY
    if not api_key:
        logger.error("RESEND_API_KEY is not configured.")
        return False

    from_email = settings.RESEND_FROM_EMAIL or "AgentForge <onboarding@resend.dev>"

    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(RESEND_API_URL, json=payload, headers=headers)
            if resp.status_code in [200, 201]:
                logger.info(f"Email successfully sent to {to_email} via Resend. ID: {resp.json().get('id')}")
                return True
            else:
                logger.error(f"Resend error ({resp.status_code}): {resp.text}")
                return False
    except Exception as e:
        logger.error(f"Failed to dispatch email to {to_email}: {e}")
        return False

async def send_activation_otp_email(to_email: str, otp_code: str, name: Optional[str] = None) -> bool:
    display_name = name or "Founder"
    subject = f"{otp_code} is your AgentForge verification code"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Activate Your AgentForge Account</title>
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAFA; margin: 0; padding: 20px; color: #1E293B; }}
        .container {{ max-width: 540px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; padding: 36px; }}
        .badge {{ display: inline-block; background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }}
        h1 {{ font-size: 22px; color: #0F172A; margin: 0 0 12px; font-weight: 700; }}
        p {{ font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 20px; }}
        .otp-box {{ background: #F8FAFC; border: 2px dashed #D97706; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0; }}
        .otp-code {{ font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #B45309; }}
        .footer {{ font-size: 13px; color: #94A3B8; margin-top: 30px; border-top: 1px solid #F1F5F9; padding-top: 16px; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="badge">AgentForge Account Verification</div>
        <h1>Welcome to AgentForge, {display_name}!</h1>
        <p>Please enter the following 6-digit verification code to activate your account and access your AI employees:</p>
        
        <div class="otp-box">
          <div class="otp-code">{otp_code}</div>
        </div>
        
        <p>This verification code will expire in <strong>10 minutes</strong>. If you did not create an AgentForge account, please ignore this email.</p>
        
        <div class="footer">
          &copy; 2026 AgentForge Inc. Autonomous AI Employee Platform.
        </div>
      </div>
    </body>
    </html>
    """
    return await send_email(to_email, subject, html)

async def send_password_reset_otp_email(to_email: str, otp_code: str, name: Optional[str] = None) -> bool:
    display_name = name or "there"
    subject = f"{otp_code} is your AgentForge password reset code"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAFA; margin: 0; padding: 20px; color: #1E293B; }}
        .container {{ max-width: 540px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; padding: 36px; }}
        .badge {{ display: inline-block; background: #FEE2E2; color: #991B1B; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }}
        h1 {{ font-size: 22px; color: #0F172A; margin: 0 0 12px; font-weight: 700; }}
        p {{ font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 20px; }}
        .otp-box {{ background: #F8FAFC; border: 2px dashed #EF4444; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0; }}
        .otp-code {{ font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #DC2626; }}
        .footer {{ font-size: 13px; color: #94A3B8; margin-top: 30px; border-top: 1px solid #F1F5F9; padding-top: 16px; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="badge">Security Notice: Password Reset</div>
        <h1>Hi {display_name},</h1>
        <p>We received a request to reset the password for your AgentForge account. Use the 6-digit code below to set your new password:</p>
        
        <div class="otp-box">
          <div class="otp-code">{otp_code}</div>
        </div>
        
        <p>This code will expire in <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email; your password remains unchanged.</p>
        
        <div class="footer">
          &copy; 2026 AgentForge Inc. Autonomous AI Employee Platform.
        </div>
      </div>
    </body>
    </html>
    """
    return await send_email(to_email, subject, html)
