from flask import Flask, jsonify, request, render_template
from flask_bcrypt import generate_password_hash, check_password_hash
import smtplib
from email.mime.text import MIMEText
import jwt
import datetime
import random
import threading
from validate_docbr import CPF, CNPJ

from main import app, con

senha_secreta = app.config['SECRET_KEY']

def validar_senha(senha, confirmar_senha):
    if len(senha) <8:
        return 'Senha fraca: deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número, um caractere especial e pelo menos 8 caracteres'
    elif not any(char.isdigit() for char in senha) or not any(char.isalnum() for char in senha):
        return 'Senha fraca: deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número, um caractere especial e pelo menos 8 caracteres'
    elif not any(char.isupper() for char in senha) or not any(char.islower() for char in senha):
        return 'Senha fraca: deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número, um caractere especial e pelo menos 8 caracteres'
    elif senha != confirmar_senha:
        return 'As senhas não coincidem'
    else:
        return None


def criptografar(senha):
    return generate_password_hash(senha).decode('utf-8')


def checar_senha(senha, senha_criptografada):
    return check_password_hash(senha_criptografada, senha)


def enviando_email(destinatario, assunto, mensagem, codigo, nome):

    user = "nikola11tech@gmail.com"
    senha = "ucqs orwa wmdu zgse"

    with app.app_context():
        html = render_template("email.html", mensagem=mensagem, codigo=codigo, nome=nome)

    msg = MIMEText(html, "html", "utf-8")
    msg["Subject"] = assunto
    msg["From"] = user
    msg["To"] = destinatario


    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        # para trocar a porta para 587 que é uma existente deve adicionar essa linha a mais, é uma porta que começa sem criptografia
        # server = smtplib.SMTP("smtp.gmail.com", 587)
        # server.starttls()
        server.login(user, senha)
        server.send_message(msg)
        server.quit()
        print("Email enviado com sucesso!")
    except Exception as e:
        print("Erro ao enviar email:", e)


def gerar_token_temporario(id_usuario):
    payload = {
        'id_usuario': id_usuario,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=90),
        'timestamp': datetime.datetime.utcnow().isoformat()
    }

    token = jwt.encode(payload, senha_secreta, algorithm='HS256')

    return token

def gerar_token(id_usuario):
    payload = {
        'id_usuario': id_usuario,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=90),
        'timestamp': datetime.datetime.utcnow().isoformat()
    }

    token = jwt.encode(payload, senha_secreta, algorithm='HS256')

    if isinstance(token, bytes):
        token = token.decode('utf-8')

    return token

def validar_token(token):
    try:
        payload = jwt.decode(
            token,
            senha_secreta,
            algorithms=['HS256']
        )

        return payload

    except jwt.ExpiredSignatureError:
        return "expirado"

    except jwt.InvalidTokenError:
        return "invalido"

def email_verificacao(destinatario, assunto, mensagem):
    cur = con.cursor()

    cur.execute("""SELECT id_usuario, nome
                   FROM USUARIO
                   WHERE email = ?""", (destinatario,))
    usuario = cur.fetchone()

    if usuario:
        id_usuario = usuario[0]
        nome = usuario[1]
        assunto_email = f"{assunto}"
        codigo = random.randint(100000, 999999)
        cur.execute("""UPDATE USUARIO SET codigo = ? WHERE id_usuario = ?""", (codigo, id_usuario))
        con.commit()

        mensagem_email = f"{mensagem}:"

        thread = threading.Thread(target=enviando_email, args=(destinatario, assunto_email, mensagem_email, codigo, nome))

        thread.start()
        return "Seu código foi enviado para o email informado, por favor verifique sua caixa de entrada.", 'sucesso'
    else:
        return "Email informado não encontrado.", 'erro'



def verificar_codigo(email, codigo):
    cur = con.cursor()

    cur.execute("""SELECT codigo from USUARIO where email = ?""", (email,))
    codigo_real = cur.fetchone()

    if not codigo_real:
        return jsonify({'descricao': 'Usuário não encontrado'}), 404

    if str(codigo_real[0]) == str(codigo) and codigo != "None":
        return True, "Código válido"
    else:
        return False, "Código inválido"


def valida_nova_senha(senha, id_usuario, cur):
    cur.execute("""select senha, senha_antiga_2, senha_antiga_3
                   from usuario
                   where id_usuario = ?""", (id_usuario,))
    senhas = cur.fetchone()
    senha_criptografada = senhas[0]

    if senhas and senhas[1]:
        senha2 = senhas[1]
    else:
        senha2 = None

    if senhas and senhas[2]:
        senha3 = senhas[2]
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

def validaCpfCnpj(cpf_cnpj):
    cpfV = CPF().validate(cpf_cnpj)
    cnpjV = CNPJ().validate(cpf_cnpj)
    if cpfV == cnpjV:
        return False
    elif cpfV:
        return cpfV
    elif cnpjV:
        return cnpjV
    return 'Não foi possível verificar o CPF ou CNPJ'