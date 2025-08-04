import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

def send_contact_email(name, sender_email, message):
    config = current_app.config
    
    msg = MIMEMultipart()
    msg['From'] = config['MAIL_USERNAME']
    msg['To'] = config['MAIL_RECIPIENT']
    msg['Subject'] = f"New Contact Form Message from {name}"

    body = f"You have received a new message from:\n\nName: {name}\nEmail: {sender_email}\n\nMessage:\n{message}"
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP(config['MAIL_SERVER'], config['MAIL_PORT'])
        server.starttls()
        server.login(config['MAIL_USERNAME'], config['MAIL_PASSWORD'])
        text = msg.as_string()
        server.sendmail(config['MAIL_USERNAME'], config['MAIL_RECIPIENT'], text)
        server.quit()
    except Exception as e:
        # Log the error in a real application
        print(f"Failed to send email: {e}")
        raise e