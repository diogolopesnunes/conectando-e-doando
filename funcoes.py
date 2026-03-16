from flask import Flask, jsonify, request
from flask_bcrypt import generate_password_hash, check_password_hash
import smtplib
from email.mime.text import MIMEText
import jwt
import datetime

from main import app


def validar_senha(senha):
    if len(senha) <8:
        return 'Senha fraca: deve conter pelo menos 8 caracteres'
    elif not any(char.isdigit() for char in senha) or not any(char.isalnum() for char in senha):
        return 'Senha fraca: deve conter pelo menos um número e um caractér especial'
    elif not any(char.isupper() for char in senha or not any(char.islower() for char in senha)):
        return 'Senha fraca: deve conter pelo menos uma letra maiúscula e uma letra minúscula'
    else:
        return None


def criptografar(senha):
    return generate_password_hash(senha).decode('utf-8')


def checar_senha(senha, senha_criptografada):
    return check_password_hash(senha_criptografada, senha)


def enviando_email(destinatario, assunto, mensagem):
    user = "gran34sudaruska@gmail.com"
    senha = "mqrj qkco dqbm hqrl"

    msg = MIMEText(mensagem)
    msg['Subject'] = assunto
    msg['From'] = user
    msg['To'] = destinatario

    server = smtplib.SMTP('smtp.gmail.com')
    server.starttls()
    server.login(user, senha)
    server.send_message(msg)
    server.quit()


senha_secreta = app.config['SECRET_KEY']

def gerar_token_temporario(id_usuario):
    payload = {
        'id_usuario': id_usuario,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=5),
        'timestamp': datetime.datetime.utcnow().isoformat()
    }

    token = jwt.encode(payload, senha_secreta, algorithm='HS256')

    return token

def gerar_token(id_usuario):
    payload = {
        'id_usuario': id_usuario,
        'timestamp': datetime.datetime.utcnow().isoformat()
    }

    token = jwt.encode(payload, senha_secreta, algorithm='HS256')

    return token
