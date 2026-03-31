# from fpdf import FPDF
# import pygal
import datetime
import random

import os.path
from flask import Flask, jsonify, request, send_file, Response, make_response
import jwt
from flask_bcrypt import check_password_hash, bcrypt

from funcoes import validar_senha, criptografar, checar_senha, enviando_email, gerar_token, verificar_codigo, email_verificacao, valida_nova_senha
from main import app, con

senha_secreta = app.config['SECRET_KEY']

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

codigo = 0

@app.route('/cadastro', methods=['POST'])
def cadastro():
    try:
        cur = con.cursor()
        nome = request.form.get('nome')
        nome = nome.strip()
        if len(nome) <= 0:
            return jsonify({'erro': 'O nome não pode ser vazio'}), 400
        email = request.form.get('email')
        senha = request.form.get('senha')
        confirmar_senha = request.form.get('confirmar_senha')
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

        if tipo_de_usuario == 1:
            if not tipo_ong and not descricao_causa and not banco_ong and not agencia_ong and not conta_ong and not cidade_ong:
                return jsonify({'erro': 'A ong deve ter tipo, descrição, banco, agencia, conta e cidade'})


        if not nome or not senha or not email:
            return jsonify({'erro': 'Insira Nome, Email e Senha'}), 400

        mensagem_validacao = validar_senha(senha, confirmar_senha)
        if mensagem_validacao:
            return jsonify({'erro': mensagem_validacao}), 400
        senha_cript = criptografar(senha)

        cur.execute('select 1 from usuario where email = ?', (email,))
        if cur.fetchone():
            return jsonify({'erro': 'Usuário já cadastrado'}), 400
        cur.execute("""insert into usuario (nome, email, senha, tipo_de_usuario, cpf_cnpj, tipo_ong,
        descricao_causa, banco_ong, agencia_ong, conta_ong, cidade_ong, telefone, senha_antiga_2, senha_antiga_3) 
                        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null, null) RETURNING id_usuario """, (nome, email, senha_cript, tipo_de_usuario, cpf_cnpj,
                                     tipo_ong, descricao_causa, banco_ong, agencia_ong,
                                           conta_ong, cidade_ong, telefone ))

        con.commit()

        cur.execute("""select id_usuario from usuario where email = ?""", (email,))
        codigo_usuario = cur.fetchone()[0]

        caminho_imagem = None

        if imagem:
            nome_imagem = f"{codigo_usuario}.jpg"
            caminho_imagem_destino = os.path.join(app.config['UPLOAD_FOLDER'], "Usuarios")
            os.makedirs(caminho_imagem_destino, exist_ok=True)
            caminho_imagem = os.path.join(caminho_imagem_destino, nome_imagem)
            imagem.save(caminho_imagem)
        try:
            destinatario = email
            assunto = "Ativação de conta"
            mensagem = f"Seu código para ativar usa conta é"

            email = email_verificacao(destinatario, assunto, mensagem)

        except Exception as e:
            return jsonify({'erro': f'Erro ao gerar código de validação {e}'}), 500

        return jsonify({'mensagem': 'Usuário cadastrado com sucesso',
                        'usuario': {
                            'nome': nome,
                            'imagem': caminho_imagem,
                            'email': email_usuario
                        },
                        'mensagem_email': email
                        }), 201

    except Exception as e:
        return jsonify({'message': f'Erro ao cadastrar usuário {e}'}), 500
    finally:
        cur.close()


@app.route('/listar_usuarios', methods=['GET'])
def listar_usuarios():
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': 'Token de autenticação necessário'}), 401
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
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': 'Token de autenticação necessário'}), 401

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
            if situacao != 1 :
                return jsonify({'message': 'Sua conta está inativa'}), 403

            if check_password_hash(senha_armazenada, senha):
                token = gerar_token(id_usuario)
                cur.execute("""select nome from usuario where id_usuario = ?""", (id_usuario,))
                nome = cur.fetchone()[0]
                resp = make_response(jsonify({'message': 'Login bem-sucedido', 'usuario': {
                    'id': id_usuario,
                    'nome': nome,
                    'email': email
                }}), 200)
                resp.set_cookie('access_token',
                                httponly=True,
                                secure=False,
                                samesite='Lax',
                                path="/",
                                max_age=600)
                cur.execute('UPDATE USUARIO SET TENTATIVAS = 0 WHERE email = ?', (email,))
                con.commit()
                return resp
            else:
                cur.execute('SELECT TENTATIVAS FROM USUARIO WHERE EMAIL = ?', (email,))
                resultado = cur.fetchone()
                if not resultado:
                    return jsonify({'error': 'Erro ao buscar tentativas'}), 500

                tentativas = resultado[0]

                tentativas += 1
                cur.execute('UPDATE USUARIO SET TENTATIVAS = ? WHERE EMAIL = ? AND TIPO_DE_USUARIO != 2', (tentativas, email))
                con.commit()

                if tentativas >= 3:
                    cur.execute('UPDATE USUARIO SET SITUACAO = 2, TENTATIVAS = 0 WHERE EMAIL = ?', (email,))
                    con.commit()
                    return jsonify({'message': 'Sua conta está inativada'})
                return jsonify({'error': 'Senha ou email incorreto(s)'}), 401
        else:
            return jsonify({'error': 'Usuário não encontrado'}), 404
    except Exception as e:
        return jsonify({'message': f'Erro ao realizar o login {e}'}), 500
    finally:
        cur.close()


@app.route('/desbloquear_usuario/<int:id_usuario>', methods=['PUT'])
def desbloquear_usuario(id_usuario):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': 'Token de autenticação necessário'}), 401

    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']
        cur = con.cursor()
        cur.execute('select tipo_de_usuario from usuario where id_usuario = ?', (id_token,))
        tipo_usuario = cur.fetchone()[0]
        if tipo_usuario != 2:
            cur.close()
            return jsonify({'error': 'Apenas administradores podem desbloquear usuários'}), 403
    except Exception as e:
        return jsonify({'message': f'Erro ao verificar token {e}'}), 500

    try:
        cur = con.cursor()
        cur.execute("select situacao from usuario where id_usuario = ?", (id_usuario,))
        infos = cur.fetchone()
        if not infos:
            return jsonify({'error': 'Erro ao buscar dados do usuário'}), 500
        situacao = infos[0]
        if situacao == 2 or situacao == 3:
            cur.execute("update usuario set situacao = 1 where id_usuario = ?",(id_usuario,))
            con.commit()
            cur.close()
            return jsonify({'message': 'Usuario desbloqueado'})
    except Exception as e:
        return jsonify({'message': f'Erro ao desbloquear usuário {e}'}), 500
    finally:
        cur.close()


@app.route('/editar_usuario/<int:id_usuario>', methods=['PUT'])
def editar_usuario(id_usuario):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': 'Token de autenticação necessário'}), 401
    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']
        cur = con.cursor()
        cur.execute('select tipo_de_usuario from usuario where id_usuario = ?', (id_token,))
        tipo_usuario = cur.fetchone()[0]
        if tipo_usuario == 2:
            pass
        elif (tipo_usuario == 0 or tipo_usuario == 1) and id_usuario != id_token:
            return jsonify({'error': 'Usuário não tem permissão para editar esse usuário'}), 403


    except Exception as e:
        return jsonify({'message': f'Erro ao verificar token {e}'}), 500

    try:
        cur = con.cursor()
        cur.execute("""select 1
                        from usuario
                        where id_usuario = ?""", (id_usuario,))
        tem_user = cur.fetchone()

        if not tem_user:
            cur.close()
            return jsonify({'error': 'Usuário não encontrado'}), 404

        cur.execute("""select tipo_de_usuario, nome, email, telefone, tipo_ong, descricao_causa, banco_ong, agencia_ong, conta_ong, cidade_ong
                       from usuario
                       where id_usuario = ?""", (id_usuario,))
        infos = cur.fetchone()

        nome = request.form.get('nome') or infos[1]
        email = request.form.get('email') or infos[2]
        senha = request.form.get('senha')
        telefone = request.form.get('telefone') or infos[3]
        imagem = request.files.get('imagem')
        tipo_ong = request.form.get('tipo_ong') or infos[4]
        descricao_causa = request.form.get('descricao_causa') or infos[5]
        banco_ong = request.form.get('banco_ong') or infos[6]
        agencia_ong = request.form.get('agencia_ong') or infos[7]
        conta_ong = request.form.get('conta_ong') or infos[8]
        cidade_ong = request.form.get('cidade_ong') or infos[9]

        cur.execute('select 1 from usuario where email = ? and id_usuario != ?', (email, id_usuario,))
        if cur.fetchone():
            return jsonify({'erro': 'Usuário já cadastrado'}), 400

        if imagem and imagem.filename != "":
            nome_imagem = f"{id_usuario}.jpg"
            caminho_imagem_destino = os.path.join(app.config['UPLOAD_FOLDER'], "Usuários")
            os.makedirs(caminho_imagem_destino, exist_ok=True)
            caminho_imagem = os.path.join(caminho_imagem_destino, nome_imagem)
            imagem.save(caminho_imagem)
        if senha:
            mensagem, senha_criptografada = valida_nova_senha(senha, id_usuario, cur)

            if mensagem:
                return jsonify({'erro': mensagem}), 400

            mensagem_validacao = validar_senha(senha)
            if mensagem_validacao:
                return jsonify({'erro': mensagem_validacao}), 400

            nova_senha = criptografar(senha)
            cur.execute("""update usuario
                           set nome            = ?,
                               email           = ?,
                               senha           = ?,
                               telefone        = ?,
                               tipo_ong        = ?,
                               descricao_causa = ?,
                               banco_ong       = ?,
                               agencia_ong     = ?,
                               conta_ong       = ?,
                               cidade_ong      = ?,
                               senha_antiga_2 = ?,
                               senha_antiga_3 = senha_antiga_2
                           where id_usuario = ?""",
                        (nome, email, nova_senha, telefone, tipo_ong, descricao_causa, banco_ong, agencia_ong, conta_ong,
                         cidade_ong, senha_criptografada, id_usuario))

            con.commit()
            return jsonify({'mensagem': 'Usuário atualizado com sucesso'}), 201
        cur.execute("""update usuario
                       set nome            = ?,
                           email           = ?,
                           telefone        = ?,
                           tipo_ong        = ?,
                           descricao_causa = ?,
                           banco_ong       = ?,
                           agencia_ong     = ?,
                           conta_ong       = ?,
                           cidade_ong      = ?
                       where id_usuario = ?""",
                    (nome, email, telefone, tipo_ong, descricao_causa, banco_ong, agencia_ong, conta_ong,
                     cidade_ong, id_usuario))
        con.commit()
        return jsonify({'mensagem': 'Usuário atualizado com sucesso'}), 201
    except Exception as e:
        return jsonify({'message': f'Erro ao editar usuário {e}'}), 500
    finally:
        cur.close()


@app.route('/desativar_usuario/<int:id_usuario>', methods=['PUT'])
def desativar_usuario(id_usuario):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': 'Token de autenticação necessário'}), 401

    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']
        cur = con.cursor()
        cur.execute('select tipo_de_usuario from usuario where id_usuario = ?', (id_token,))
        tipo_usuario = cur.fetchone()[0]
        if tipo_usuario != 2:
            cur.close()
            return jsonify({'error': 'Apenas administradores podem desativar usuários'}), 403
    except Exception as e:
        return jsonify({'message': f'Erro ao verificar token {e}'}), 500
    finally:
        cur.close()

    try:
        cur = con.cursor()

        cur.execute('select id_usuario from usuario where id_usuario= ?', (id_usuario,))

        if not cur.fetchone():
            return jsonify({"error": "Usuário não encontrado"}), 404

        cur.execute("""update usuario set situacao = 3 where id_usuario = ?""", (id_usuario,))
        con.commit()

        return jsonify({"message": "Usuário desativado com sucesso", 'id_usuario':id_usuario})
    except Exception as e:
        return jsonify({'message': f'Erro ao desativar usuário {e}'}), 500
    finally:
        cur.close()

@app.route("/verificar_usuario", methods=['POST'])
def verificar_usuario():
    cur = con.cursor()

    cur.execute("SELECT SITUACAO FROM USUARIO WHERE EMAIL = ?" , (email,))

    usuario = cur.fetchone()

    if usuario == 0:

        data = request.get_json()

        destinatario = data.get('email')
        assunto = "Ativação de usuário"
        mensagem = "Seu código para ativar sua conta é"

        email = email_verificacao(destinatario, assunto, mensagem)

        return jsonify({'mensagem': email})

    else:
        return jsonify({'mensagem':'Conta já ativa apenas logue'})


@app.route('/esqueci_minha_senha', methods=['POST'])
def esqueci_minha_senha():
    try:
        data = request.get_json()

        destinatario = data.get('email')
        assunto = "Recuperação de senha"
        mensagem = f"Seu código para recuperar sua senha é"

        email = email_verificacao(destinatario, assunto, mensagem)

        return jsonify({'mensagem': email})
    except Exception as e:
        return jsonify({'erro': 'Erro ao enviar email'})

@app.route('/alterar_senha', methods=['POST'])
def alterar_senha():
    cur = con.cursor()
    try:
        dados = request.get_json()

        email = dados.get('email')
        codigo = dados.get('codigo')
        nova_senha = dados.get('nova_senha')

        if not email or not codigo or not nova_senha:
            return jsonify({"message": "Email, código e nova senha são obrigatórios"}), 400

        cur.execute("""select 1 from usuario where email = ?""", (email,))
        if not cur.fetchone():
            return jsonify({"erro": "Email não encontrado"}), 404

        # 1. Verifica código
        sucesso, mensagem = verificar_codigo(email, codigo)

        if not sucesso:
            return jsonify({"message": mensagem}), 400

        # Busca usuário
        cur.execute("""
            SELECT ID_USUARIO, SENHA
            FROM USUARIO
            WHERE EMAIL = ?
        """, (email,))
        usuario = cur.fetchone()

        if not usuario:
            return jsonify({"message": "Usuário não encontrado"}), 404

        mensagem, senha_criptografada = valida_nova_senha(nova_senha, usuario[0], cur)
        if mensagem:
            return jsonify({'erro': mensagem}), 400

        mensagem_validacao = validar_senha(nova_senha)
        if mensagem_validacao:
            return jsonify({'erro': mensagem_validacao}), 400

        senha = criptografar(nova_senha)
        # Atualiza senha e limpa código
        cur.execute("""
            UPDATE USUARIO
            SET SENHA = ?,
                SENHA_ANTIGA_3 = SENHA_ANTIGA_2,
                SENHA_ANTIGA_2 = ?,
                CODIGO = NULL
            WHERE ID_USUARIO = ?
        """, (senha, senha_criptografada, usuario[0]))
        con.commit()

        return jsonify({"messagem": "Senha alterada com sucesso"}), 200

    except Exception as e:
        if con:
            con.rollback()
        return jsonify({"messagem": f"Erro ao alterar senha: {e}"}), 500
    finally:
        cur.close()


@app.route('/logout/<int:id_usuario>', methods=['POST'])
def logout(id_usuario):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': 'Token de autenticação necessário'}), 401

    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']
        cur = con.cursor()

        if id_token != id_usuario:
            cur.close()
            return jsonify({'error': 'Não é possível fazer logout sem estar logado na conta'}), 403
    except Exception as e:
        return jsonify({'message': f'Erro ao verificar token {e}'}), 500

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

@app.route('/validar_conta', methods=['POST'])
def validar_conta():
    cur = con.cursor()
    try:
        data = request.get_json()

        email = data.get('email')
        codigo = data.get('codigo')

        cur.execute("""select 1, situacao from usuario where email = ? """,(email, ))
        infos = cur.fetchone()
        
        if not infos:
            return jsonify({"erro": "Email não encontrado"}), 404
        elif infos[1] == 0:
            sucesso, mensagem = verificar_codigo(email, codigo)
            if sucesso:
                cur.execute("""UPDATE usuario SET situacao = 1, codigo = NULL WHERE email = ? AND situacao != 1 """, (email,))
                con.commit()
                return jsonify({"message": "Conta validada com sucesso"})
            else:
                return jsonify({"message": mensagem}), 400
        else:
            return jsonify({"mensagem": "Conta já validada"})

    except Exception as e:
        return jsonify({"message": f"Erro ao validar conta: {e}"}), 500
    finally:
        cur.close()
