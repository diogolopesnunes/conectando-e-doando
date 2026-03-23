import os.path
from idlelib.colorizer import prog_group_name_to_tag
from mimetypes import knownfiles

from flask import Flask, jsonify, request, send_file, Response, make_response

from backend.funcoes import email_verificacao
from main import app, con
from funcoes import validar_senha, criptografar, checar_senha, enviando_email, gerar_token, verificar_codigo, email_verificacao
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

        nome = request.form.get('nome')
        email = request.form.get('email')
        senha = request.form.get('senha')
        tipo_de_usuario = request.form.get('tipo_de_usuario')
        cpf_cnpj = request.form.get('cpf_cnpj')
        tipo_ong = request.form.get('tipo_ong')
        descricao_causa = request.form.get('descricao_causa')
        banco_ong = request.form.get('banco_ong')
        agencia_ong = request.form.get('agencia_ong')
        conta_ong = request.form.get('conta_ong')
        cidade_ong = request.form.get('cidade_ong')
        telefone = request.form.get('telefone')
        imagem = request.files.get('imagem')


        if not nome or not senha or not email:
            return jsonify({'erro': 'Insira Nome, Email e Senha'}), 400

        mensagem_validacao = validar_senha(senha)
        if mensagem_validacao:
            return jsonify({'erro': mensagem_validacao}), 400
        senha_cript = criptografar(senha)

        cur.execute('select 1 from usuario where email = ?', (email,))
        if cur.fetchone():
            return jsonify({'erro': 'Usuário já cadastrado'}), 400
        cur.execute("""insert into usuario (nome, email, senha, tipo_de_usuario, cpf_cnpj, tipo_ong,
        descricao_causa, banco_ong, agencia_ong, conta_ong, cidade_ong, telefone ) 
                        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_usuario """, (nome, email, senha_cript, tipo_de_usuario, cpf_cnpj,
                                     tipo_ong, descricao_causa, banco_ong, agencia_ong,
                                           conta_ong, cidade_ong, telefone ))

        codigo_usuario = cur.fetchone()[0]
        con.commit()

        caminho_imagem = None

        if imagem:
            nome_imagem = f"{codigo_usuario}.jpg"
            caminho_imagem_destino = os.path.join(app.config['UPLOAD_FOLDER'], "Usuários")
            os.makedirs(caminho_imagem_destino, exist_ok=True)
            caminho_imagem = os.path.join(caminho_imagem_destino, nome_imagem)
            imagem.save(caminho_imagem)

        return jsonify({'mensagem': 'Usuário cadastrado com sucesso',
                        'usuario': {
                            'nome': nome,
                            'senha': senha, #Essa linha é apenas de debbug, remover na versão final,
                            'imagem': caminho_imagem
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

        cur.execute('select id_usuario, nome, cpf_cnpj, email, telefone, tipo_de_usuario from usuario')
        usuarios = cur.fetchall()
        usuarios_lista = []

        for usuario in usuarios:
            if usuario[5] == 0:
                tipo = 'Doador'
            elif usuario[5] == 1:
                tipo = 'ONG'
            elif usuario[5] == 2:
                tipo = 'Administrador'
            usuarios_lista.append({
                'id_usuario': usuario[0],
                'nome': usuario[1],
                'cpf_cnpj': usuario[2],
                'email': usuario[3],
                'telefone': usuario[4],
                'tipo_de_usuario': tipo,

            })

        return jsonify(mensagem='Lista de Usuários', usuarios=usuarios_lista)

    except Exception as e:
        return jsonify({'message': f'Erro ao consultar banco de dados: {e}'}), 500
    finally:
        cur.close()

@app.route('/buscar_usuarios', methods=['GET'])
def buscar_usuarios():
    try:
        cur = con.cursor()
        dados = request.get_json()
        nome = dados.get('nome')
        cur.execute('select id_usuario, nome, cpf_cnpj, email, telefone, tipo_de_usuario from usuario where UPPER(nome) LIKE UPPER(?)',
                    (f"{nome}%",))
        usuarios = cur.fetchall()
        usuarios_lista = []

        for usuario in usuarios:
            if usuario[5] == 0:
                tipo = 'Doador'
            elif usuario[5] == 1:
                tipo = 'ONG'
            elif usuario[5] == 2:
                tipo = 'Administrador'
            usuarios_lista.append({
                'id_usuario': usuario[0],
                'nome': usuario[1],
                'cpf_cnpj': usuario[2],
                'email': usuario[3],
                'telefone': usuario[4],
                'tipo_de_usuario': tipo,

            })

        if not usuarios_lista:
                return jsonify({
                    'mensagem': 'Nenhum usuário encontrado com esse nome.',
                }), 404

        return jsonify(mensagem='Usuario de Usuários', usuarios=usuarios_lista)

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
        cur.execute('SELECT 1 FROM USUARIO WHERE EMAIL = ?', (email,))
        if cur.fetchone():
            cur.execute('SELECT SENHA, ID_USUARIO, SITUACAO  FROM USUARIO WHERE EMAIL = ?', (email,))
            infos = cur.fetchone()
            if not infos:
                return jsonify({'error': 'Erro ao buscar dados do usuário'}), 500


            senha_armazenada = infos[0]
            id_usuario = infos[1]
            situacao = infos[2]
            if situacao == 0 or situacao == 2 :
                return jsonify({'message': 'Sua conta está inativa'}), 403

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
                cur.execute('SELECT TENTATIVAS FROM USUARIO WHERE EMAIL = ?', (email,))
                resultado = cur.fetchone()
                if not resultado:
                    return jsonify({'error': 'Erro ao buscar tentativas'}), 500

                tentativas = resultado[0]

                if tentativas == 3:
                    cur.execute('UPDATE USUARIO SET SITUACAO = 2,TENTATIVAS = 0')
                    return jsonify({'message': 'Sua conta está inativada'})


                tentativas += 1
                cur.execute('UPDATE USUARIO SET TENTATIVAS = ? WHERE EMAIL = ?  AND (TIPO_DE_USUARIO = 0 OR TIPO_DE_USUARIO= 1)', (tentativas, email))
                con.commit()
                return jsonify({'error': 'Senha ou email incorreto(s)'}), 401
        else:
            return jsonify({'error': 'Usuário não encontrado'}), 404
    except Exception as e:
        return jsonify({'message': f'Erro ao realizar o login {e}'}), 500
    finally:
        cur.close()


@app.route('/desbloquear_usuario/<int:id_usuario>', methods=['PUT'])
def desbloquear_usuario(id_usuario):
    cur = con.cursor()
    cur.execute("select situacao from usuario where id_usuario = ?", (id_usuario,))
    infos = cur.fetchone()
    if not infos:
        return jsonify({'error': 'Erro ao buscar dados do usuário'}), 500
    situacao = infos[0]
    if situacao == 2:
        cur.execute("update usuario set situacao = 1 where id_usuario = ?",(id_usuario,))
        con.commit()
        cur.close()
        return jsonify({'message': 'Usuario desbloqueado'})





@app.route('/editar_usuario/<int:id_usuario>', methods=['PUT'])
def editar_usuario(id_usuario):
    cur = con.cursor()
    cur.execute("""select 1
                    from usuarios
                    where id_usuario = ?""", (id_usuario,))
    tem_user = cur.fetchone()

    if not tem_user:
        cur.close()
        return jsonify({'error': 'Usuário não encontrado'}), 404

    nome = request.form.get('nome')
    email = request.form.get('email')
    senha = request.form.get('senha')
    tipo_ong = request.form.get('tipo_ong')
    descricao_causa = request.form.get('descricao_causa')
    banco_ong = request.form.get('banco_ong')
    agencia_ong = request.form.get('agencia_ong')
    conta_ong = request.form.get('conta_ong')
    cidade_ong = request.form.get('cidade_ong')
    telefone = request.form.get('telefone')
    imagem = request.files.get('imagem')


    cur.execute("""select senha
                   from usuario
                   where id_usuario = ?""", (id_usuario,))
    senha_criptografada = cur.fetchone()
    cur.execute("""select senha_2, senha_3 
                   from senhas_antigas
                   where fk_usuario = ?""", (id_usuario,))
    senhas = cur.fetchall()

    if checar_senha(senha, senha_criptografada) or checar_senha(senha, senhas[0]) or checar_senha(senha, senhas[1]):
        return jsonify({"mensagem": "Sua senha não pode ser uma das ultimas 3 senhas"})

    #
    # con.commit()
    # cur.close()
    #
    # return jsonify({'mensagem': 'Usuário editado com sucesso',
    #                 'usuario': {
    #                     'id_usuario': id_usuario,
    #                     'usuario': usuario,
    #                     'autor': senha
    #                 }
    #                 }), 201

@app.route('/deletar_usuario/<int:id>', methods=['DELETE'])
def deletar_usuario(id):
    cur = con.cursor()

    cur.execute('select id_usuario from usuario where id_usuario= ?', (id,))

    if not cur.fetchone():
        cur.close()
        return jsonify({"error": "Usuário não encontrado"}), 404

    cur.execute("delete from usuario where id_usuario = ?", (id,))
    con.commit()
    cur.close()

    return jsonify({"message": "Usuário deletado com sucesso", 'id_usuario':id})



@app.route("/verificar_usuario", methods=['POST'])
def verificar_usuario():
    data = request.get_json()

    destinatario = data.get('email')
    assunto = "Ativação de usuário"
    mensagem = "Seu código para ativar sua conta é"

    email = email_verificacao(destinatario, assunto, mensagem)

    return jsonify({'mensagem': email})


@app.route('/esqueci_minha_senha/', methods=['POST'])
    def esqueci_minha_senha():
        data = request.get_json()

        destinatario = data.get('email')
        assunto = "Recuperação de senha"
        mensagem = f"Seu código para recuperar sua senha é"

        email = email_verificacao(destinatario, assunto, mensagem)

        return jsonify({'mensagem': email})


@app.route('/alterar_senha', methods=['POST'])
def alterar_senha():
    cur = con.cursor()

    data = request.get_json()
    senhaAtualData = data.get('senhaAtual')
    senhaData = data.get('senhaNova')
    confirmaSenhaData = data.get('confirmaSenha')

    # senhaAtual = cur.execute('select 1 from usuario where email = ?', (email,))

    # if senhaAtualData == senhaAtual

@app.route('/logout', methods=['POST'])
def logout():
    token = request.cookies.get('access_token')

    if not token:
        return jsonify({'error': 'Usuário não está logado'}), 401

    resp = make_response(jsonify({'message': 'Logout realizado com sucesso'}))

    resp.set_cookie(
        'access_token',
        '',
        expires=0,
        httponly=True,
        secure=False,
        samesite='Lax',
        path="/"
    )

    return resp, 200