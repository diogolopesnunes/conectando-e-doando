from flask import Flask, jsonify, request
from flask_bcrypt import generate_password_hash, check_password_hash
import smtplib
from email.mime.text import MIMEText
import jwt
import datetime
import random
import threading

from main import app, con

senha_secreta = app.config['SECRET_KEY']

def validar_senha(senha):
    if len(senha) <8:
        return 'Senha fraca: deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número, um caractere especial e pelo menos 8 caracteres'
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


def enviando_email(destinatario, assunto, mensagem, codigo):

    user = "nikola11tech@gmail.com"
    senha = "ucqs orwa wmdu zgse"

    html = f"""
        <html>
            <body style="font-family: Arial; background-color: #f4f4f4; padding: 20px;">
                <div style="
                    max-width: 600px;
                    margin: auto;
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                ">
                    <h2 style="color: #F1731F; text-align: center;">
                        Sistema Nikola Tech
                    </h2>

                    <p style="font-size: 16px; color: #333; text-align: center;">Olá, <b>{mensagem}</b> 👋</p>
                    <div>
                        <p style="margin: auto; font-size: 30px; text-align: center; font-weight: bold; background-color: #BD0D59; padding: 3px; border-radius: 5px; color: white;">{codigo}</p>
                    </div>

                    

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://seusite.com"
                           style="
                               background-color: #730662;
                               color: white;
                               padding: 12px 20px;
                               text-decoration: none;
                               border-radius: 8px;
                               font-weight: bold;
                               font-size: 20px;
                           ">
                            Acessar sistema
                        </a>
                    </div>

                    <p style="font-size: 15px; color: #555;">
                        Recebemos sua solicitação com sucesso.
                    </p>

                    <p style="font-size: 13px; color: #999;">
                        Se você não reconhece essa ação, ignore este email.
                    </p>

                    <hr>

                    <p style="font-size: 12px; color: #aaa; text-align: center;">
                        © 2026 Nikola Tech
                    </p>
                </div>
            </body>
        </html>
        """

    msg = MIMEText(html, "html")
    msg['Subject'] = assunto
    msg['From'] = user
    msg['To'] = destinatario

    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(user, senha)
    server.send_message(msg)
    server.quit()


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

        mensagem_email = f"{mensagem}:"

        thread = threading.Thread(target=enviando_email, args=(destinatario, assunto_email, mensagem_email, codigo))

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


def valida_nova_senha(senha, id_usuario, cur):
    cur.execute("""select senha
                   from usuario
                   where id_usuario = ?""", (id_usuario,))
    senha_criptografada = cur.fetchone()[0]
    cur.execute("""select senha_2, senha_3
                   from senhas_antigas
                   where fk_usuario = ?""", (id_usuario,))
    senhasAnteriores = cur.fetchone()

    if senhasAnteriores and senhasAnteriores[0]:
        senha2 = senhasAnteriores[0]
    else:
        senha2 = None

    if senhasAnteriores and senhasAnteriores[1]:
        senha3 = senhasAnteriores[1]
    else:
        senha3 = None

    senha_atual_repetida = checar_senha(senha, senha_criptografada)

    senha2_repetida = False
    if senha2 != None:
        senha2_repetida = checar_senha(senha, senha2)

    senha3_repetida = False
    if senha3 != None:
        senha3_repetida = checar_senha(senha, senha3)

    if senha_atual_repetida or senha2_repetida or senha3_repetida:
        mensagem = "A nova senha deve ser diferente das últimas 3 senhas utilizadas."
        return (mensagem, senha_criptografada)
    else:
        return (None, senha_criptografada)