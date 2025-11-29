import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

async def send_email(to_email: str, subject: str, html_content: str):
    """Envía un correo electrónico usando Mailtrap"""
    
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
    """Envía email de verificación de cuenta"""
    
    verification_link = f"{settings.FRONTEND_URL}/verify.html?token={verification_token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .logo {{ text-align: center; margin-bottom: 30px; }}
            .logo img {{ max-width: 150px; }}
            h1 {{ color: #FF7A59; text-align: center; }}
            p {{ color: #333; line-height: 1.6; }}
            .button {{ display: block; width: 200px; margin: 30px auto; padding: 15px 30px; background-color: #FF7A59; color: white; text-decoration: none; text-align: center; border-radius: 5px; font-weight: bold; }}
            .button:hover {{ background-color: #e5694d; }}
            .footer {{ text-align: center; margin-top: 40px; color: #888; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <h2 style="color: #FF7A59;">🚀 RiseUp</h2>
            </div>
            <h1>¡Bienvenido a RiseUp!</h1>
            <p>Hola <strong>{first_name}</strong>,</p>
            <p>Gracias por registrarte en nuestra plataforma de crowdfunding. Para completar tu registro y comenzar a explorar proyectos increíbles, necesitas verificar tu correo electrónico.</p>
            <p>Haz clic en el siguiente botón para activar tu cuenta:</p>
            <a href="{verification_link}" class="button">Verificar mi cuenta</a>
            <p>Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #FF7A59;">{verification_link}</p>
            <p>Este enlace expirará en 24 horas.</p>
            <div class="footer">
                <p>Si no te registraste en RiseUp, puedes ignorar este correo.</p>
                <p>&copy; 2024 RiseUp. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(to_email, "Verifica tu cuenta en RiseUp", html_content)

async def send_welcome_email(to_email: str, first_name: str):
    """Envía email de bienvenida después de verificar la cuenta"""
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            h1 {{ color: #FF7A59; text-align: center; }}
            p {{ color: #333; line-height: 1.6; }}
            .button {{ display: block; width: 200px; margin: 30px auto; padding: 15px 30px; background-color: #FF7A59; color: white; text-decoration: none; text-align: center; border-radius: 5px; font-weight: bold; }}
            .features {{ background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }}
            .features ul {{ color: #555; }}
            .footer {{ text-align: center; margin-top: 40px; color: #888; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎉 ¡Tu cuenta está activa!</h1>
            <p>Hola <strong>{first_name}</strong>,</p>
            <p>¡Felicitaciones! Tu cuenta en RiseUp ha sido verificada exitosamente. Ahora puedes disfrutar de todas las funcionalidades de nuestra plataforma.</p>
            <div class="features">
                <p><strong>Con tu cuenta puedes:</strong></p>
                <ul>
                    <li>🚀 Crear tus propios proyectos de crowdfunding</li>
                    <li>💰 Apoyar proyectos que te inspiren</li>
                    <li>⭐ Guardar proyectos en favoritos</li>
                    <li>📊 Hacer seguimiento de tus donaciones</li>
                </ul>
            </div>
            <a href="{settings.FRONTEND_URL}/index-logged.html" class="button">Explorar Proyectos</a>
            <div class="footer">
                <p>&copy; 2024 RiseUp. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(to_email, "¡Bienvenido a RiseUp!", html_content)
