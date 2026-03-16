import os.path
from idlelib.colorizer import prog_group_name_to_tag

from flask import Flask, jsonify, request, send_file, Response, make_response
from main import app, con
from funcoes import validar_senha, criptografar, checar_senha, enviando_email, gerar_token
from fpdf import FPDF
import pygal
import threading
import jwt
import datetime
from flask_bcrypt import check_password_hash
import random

senha_secreta = app.config['SECRET_KEY']

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

codigo = 0

@app.route('/cadastro', methods=['POST'])
def cadastro():
    try:
        cur = con.cursor()
        dados = request.get_json(silent=True)

        usuario = dados.get('usuario');
        email = dados.get('email')
        senha = dados.get('senha')
        tipo_usuario = dados.get('tipo_usuario')
        cpf_cnpj = dados.get('cpf-cnpj')
        descricao_causa = dados.get('descricao_causa')
        tipo_ong = dados.get('tipo_ong')
        banco_ong = dados.get('banco_ong')
        agencia_ong = dados.get('agencia_ong')
        conta_ong = dados.get('conta_ong')
        cidade_ong = dados.get('descricao_causa')
        telefone = dados.get('telefone')
        data_hora_registro = dados.get('data_hora_registro')
        situacao = dados.get('data_hora_registro')



        # if not dados:
        #     return jsonify({'erro': 'Nenhum dado fornecido'}), 400

        if not usuario or not senha or not email:
            return jsonify({'erro': 'Insira Usuário, Email e Senha'}), 400

        mensagem_validacao = validar_senha(senha)
        if mensagem_validacao:
            return jsonify({'erro': mensagem_validacao}), 400
        senha_cript = criptografar(senha)

        cur.execute('select 1 from usuarios where usuario = ? or email = ?', (usuario, email,))
        if cur.fetchone():
            return jsonify({'erro': 'Usuário já cadastrado'}), 400
        cur.execute("""insert into usuarios (usuario, email, senha, tipo_usuario, cpf_cnpj,
        descricao_causa, tipo_ong)
                        values (?, ?)""", (usuario, email, senha_cript))

        con.commit()
        return jsonify({'mensagem': 'Usuário cadastrado com suuuuceeeeeeeeeeeesso',
                        'usuario': {
                            'usuario': usuario,
                            'senha': senha
                        }
                        }), 201

    except Exception as e:
        return jsonify({'message': f'Erro ao cadastrar usuário {e}'}), 500
    finally:
        cur.close()


@app.route('/listar_usuarios', methods=['GET'])
def listar_usuarios():
    try:
        cur = con.cursor()

        cur.execute('select id_usuario, usuario, senha from usuarios')
        usuarios = cur.fetchall()
        usuarios_lista = []
        for usuario in usuarios:
            usuarios_lista.append({
                'id_usuario': usuario[0],
                'usuario': usuario[1],
                'senha': usuario[2]
            })

        return jsonify(mensagem='Lista de Usuários', usuarios=usuarios_lista)

    except Exception as e:
        return jsonify({'message': f'Erro ao consultar banco de dados: {e}'}), 500
    finally:
        cur.close()


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        senha = data.get('senha')

        cur = con.cursor()
        cur.execute('SELECT 1 FROM USUARIOS WHERE EMAIL = ?', (email,))
        if cur.fetchone():
            cur.execute('SELECT SENHA, ID_USUARIO FROM USUARIOS WHERE EMAIL = ?', (email,))
            infos = cur.fetchone()
            senha_armazenada = infos[0]
            id_usuario = infos[1]
            if check_password_hash(senha_armazenada, senha):
                token = gerar_token(id_usuario)
                resp = make_response(jsonify({'message': 'Login bem-sucedido'}), 200)
                resp.set_cookie('access_token', token,
                                httponly=True,
                                secure=False,
                                samesite='Lax',
                                path="/",
                                max_age=600)
                return resp
            else:
                cur.execute('SELECT TENTATIVAS FROM USUARIOS WHERE EMAIL = ?', (email,))
                tentativas = cur.fetchone()[0]
                if tentativas == 3:
                    return jsonify({'message': 'Sua conta está inativada'})
                tentativas += 1
                cur.execute('UPDATE USUARIOS SET TENTATIVAS = ? WHERE EMAIL = ?', (tentativas, email))
                con.commit()
                return jsonify({'error': 'Senha ou email incorreto(s)'}), 401
        else:
            return jsonify({'error': 'Usuário não encontrado'}), 404
    except Exception as e:
        return jsonify({'message': f'Erro ao realizar o login {e}'}), 500
    finally:
        cur.close()


@app.route('/editar_usuario/<int:id_usuario>', methods=['PUT'])
def editar_usuario(id_usuario):
    cur = con.cursor()
    cur.execute("""select id_usuario, usuario, senha
                    from usuarios
                    where id_usuario = ?""", (id_usuario,))
    tem_user = cur.fetchone()

    if not tem_user:
        cur.close()
        return jsonify({'error': 'Usuário não encontrado'}), 404

    dados = request.get_json()
    usuario = dados.get('usuario')
    senha = dados.get('senha')
    if not usuario or not senha:
        return jsonify({'erro': 'Insira Usuário e Senha'}), 400
    senha_cript = criptografar(senha)

    cur.execute(""" update usuarios set usuario = ?, senha = ?
                    where id_usuario = ?""", (usuario, senha_cript, id_usuario))

    con.commit()
    cur.close()

    return jsonify({'mensagem': 'Usuário editado com suuuuceeeeeeeeeeeesso',
                    'usuario': {
                        'id_usuario': id_usuario,
                        'usuario': usuario,
                        'autor': senha
                    }
                    }), 201



@app.route("/enviar_email", methods=['POST'])
def enviar_email():
    dados = request.json
    assunto = dados.get('subject')
    mensagem = dados.get('message')
    destinatario = dados.get('to')

    thread = threading.Thread(target=enviando_email, args=(destinatario, assunto, mensagem))

    thread.start()

    return jsonify({"mensagem": "Email enviado com suuuuceeeeeeeeeeeesso!"}), 200


@app.route('/esqueci_minha_senha', methods=['POST'])
def esqueci_minha_senha():
    data = request.get_json()
    destinatario = data.get('email')
    cur = con.cursor()
    if cur.execute("""SELECT 1 FROM USUARIO WHERE email = ?""", (destinatario,)):
        assunto = "Recuperação de senha"
        codigo = random.randint(100000, 999999)
        mensagem = f"Seu código recuperar sua senha é: {codigo}"

        thread = threading.Thread(target=enviando_email, args=(destinatario, assunto, mensagem))

        thread.start()
        return jsonify({"mensagem": "Seu código foi enviado no email informado!"}), 200
    else:
        return jsonify({"mensagem": "Email informado não existente"})

@app.route('/validar_codigo', methods=['POST'])
def validar_codigo():
    data = request.get_json()
    codigoData = data.get('codigo')
    if codigoData == codigo:
        return jsonify({'mensagem': 'Código válido'})
    else:
        return jsonify({'mensagem': 'Código inválido'})

@app.route('/alterar_senha', methods=['POST'])
def alterar_senha():
    data = request.get_json()
    senha = data.get('senha')
    confirmaSenha = data.get('confirmaSenha')
    if senha == confirmaSenha:
        criptografar(senha)
        cur = con.cursor()
