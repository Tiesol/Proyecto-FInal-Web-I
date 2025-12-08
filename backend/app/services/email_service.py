import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

async def send_email(to_email: str, subject: str, html_content: str):

    message = MIMEMultipart("alternative")
    message["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
    message["To"] = to_email
    message["Subject"] = subject

    html_part = MIMEText(html_content, "html")
    message.attach(html_part)

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.MAIL_SERVER,
            port=settings.MAIL_PORT,
            username=settings.MAIL_USERNAME,
            password=settings.MAIL_PASSWORD,
            start_tls=True,
        )
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False

async def send_verification_email(to_email: str, first_name: str, verification_token: str):

    verification_link = f"{settings.FRONTEND_URL}/verify.html?token={verification_token}"

    html_content = f

    return await send_email(to_email, "Verifica tu cuenta en RiseUp", html_content)

async def send_welcome_email(to_email: str, first_name: str):

    html_content = f

    return await send_email(to_email, "¡Bienvenido a RiseUp!", html_content)
