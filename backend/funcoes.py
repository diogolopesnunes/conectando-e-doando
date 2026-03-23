from flask import Flask, jsonify, request
from flask_bcrypt import generate_password_hash, check_password_hash
import smtplib
from email.mime.text import MIMEText
import jwt
import datetime
import random
import threading

from main import app, con


def validar_senha(senha):
    if len(senha) <8:
        return 'Senha fraca: deve conter pelo menos 8 caracteres'
    elif not any(char.isdigit() for char in senha) or not any(char.isalnum() for char in senha):
        return 'Senha fraca: deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número, um caractere especial e pelo menos 8 caracteres'
    elif not any(char.isupper() for char in senha) or not any(char.islower() for char in senha):
        return 'Senha fraca: deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número, um caractere especial e pelo menos 8 caracteres'
    else:
        return None


def criptografar(senha):
    return generate_password_hash(senha).decode('utf-8')


def checar_senha(senha, senha_criptografada):
    return check_password_hash(senha_criptografada, senha)


def enviando_email(destinatario, assunto, mensagem):
    user = "nikola11tech@gmail.com"
    senha = "ucqs orwa wmdu zgse"

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



def email_verificacao(destinatario, assunto, mensagem):
    cur = con.cursor()

    cur.execute("""SELECT id_usuario
                   FROM USUARIO
                   WHERE email = ?""", (destinatario,))
    usuario = cur.fetchone()

    if usuario:
        id_usuario = usuario[0]
        assunto_email = f"{assunto}"
        codigo = random.randint(000000, 999999)
        cur.execute("""UPDATE USUARIO SET codigo = ? WHERE id_usuario = ?""", (codigo, id_usuario))
        con.commit()

        mensagem_email = f"{mensagem}: {codigo}"

        thread = threading.Thread(target=enviando_email, args=(destinatario, assunto_email, mensagem_email))

        thread.start()
        return "Seu código foi enviado no email informado!"
    else:
        return "Email informado não existente"



def verificar_codigo(email, codigo):
    cur = con.cursor()

    cur.execute("""SELECT codigo from USUARIO where email = ?""", (email,))
    codigo_real = cur.fetchone()

    if not codigo_real:
        return jsonify({'mensagem': 'Usuário não encontrado'}), 404

    if str(codigo_real[0]) == str(codigo):
        return True, "Código válido"
    else:
        return False, "Código inválido"


