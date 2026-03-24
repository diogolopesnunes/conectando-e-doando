# from fpdf import FPDF
# import pygal
import datetime
import random

import os.path
from asyncio.windows_events import NULL

from flask import Flask, jsonify, request, send_file, Response, make_response
import jwt
from flask_bcrypt import check_password_hash, bcrypt

from funcoes import validar_senha, criptografar, checar_senha, enviando_email, gerar_token, verificar_codigo, \
    email_verificacao, valida_nova_senha
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
        cur.execute("""insert into senhas_antigas (fk_usuario) values (?)""", (cur.fetchone()[0],))

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
            if situacao == 0 or situacao == 2 :
                return jsonify({'message': 'Sua conta está inativa'}), 403

            if check_password_hash(senha_armazenada, senha):
                token = gerar_token(id_usuario)
                resp = make_response(jsonify({'message': 'Login bem-sucedido', 'token':token}), 200)
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
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': 'Token de autenticação necessário'}), 401

    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_usuario = dados['id_usuario']
        cur = con.cursor()
        cur.execute('select tipo_de_usuario from usuario where id_usuario = ?', (id_usuario,))
        tipo_usuario = cur.fetchone()[0]
        if tipo_usuario != 2:
            cur.close()
            return jsonify({'error': 'Apenas administradores podem deletar usuários'}), 403
    except Exception as e:
        return jsonify({'message': f'Erro ao verificar token {e}'}), 500

    try:
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
        # if infos[0] == 1:
        tipo_ong = request.form.get('tipo_ong') or infos[4]
        descricao_causa = request.form.get('descricao_causa') or infos[5]
        banco_ong = request.form.get('banco_ong') or infos[6]
        agencia_ong = request.form.get('agencia_ong') or infos[7]
        conta_ong = request.form.get('conta_ong') or infos[8]
        cidade_ong = request.form.get('cidade_ong') or infos[9]

        if imagem and imagem.filename != "":
            nome_imagem = f"{id_usuario}.jpg"
            caminho_imagem_destino = os.path.join(app.config['UPLOAD_FOLDER'], "Usuários")
            os.makedirs(caminho_imagem_destino, exist_ok=True)
            caminho_imagem = os.path.join(caminho_imagem_destino, nome_imagem)
            imagem.save(caminho_imagem)
        if senha:
            # cur.execute("""select senha
            #                from usuario
            #                where id_usuario = ?""", (id_usuario,))
            # senha_criptografada = cur.fetchone()[0]
            # cur.execute("""select senha_2, senha_3
            #                from senhas_antigas
            #                where fk_usuario = ?""", (id_usuario,))
            # senhasAnteriores = cur.fetchone()
            #
            # if senhasAnteriores and senhasAnteriores[0]:
            #     senha2 = senhasAnteriores[0]
            # else:
            #     senha2 = None
            #
            # if senhasAnteriores and senhasAnteriores[1]:
            #     senha3 = senhasAnteriores[1]
            # else:
            #     senha3 = None
            #
            # senha_atual_repetida = checar_senha(senha, senha_criptografada)
            #
            # senha2_repetida = False
            # if senha2 != None:
            #     senha2_repetida = checar_senha(senha, senha2)
            #
            # senha3_repetida = False
            # if senha3 != None:
            #     senha3_repetida = checar_senha(senha, senha3)


            mensagem, senha_criptografada = valida_nova_senha(senha, id_usuario, cur)

            if mensagem:
                return jsonify({'erro': mensagem}), 400


            # if senha_atual_repetida or senha2_repetida or senha3_repetida:
            #     return jsonify({"mensagem": "Sua senha não pode ser uma das ultimas 3 senhas"})
            # senha2 = senhasAnteriores[0] if senhasAnteriores and senhasAnteriores[0] else None
            # senha3 = senhasAnteriores[1] if senhasAnteriores and senhasAnteriores[1] else None
            # if checar_senha(senha, senha_criptografada) or (senha2 and checar_senha(senha, senha2)) or (senha3 and checar_senha(senha, senha3)):
            #     return jsonify({"mensagem": "Sua senha não pode ser uma das ultimas 3 senhas"})
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
                               cidade_ong      = ?
                           where id_usuario = ?""",
                        (nome, email, nova_senha, telefone, tipo_ong, descricao_causa, banco_ong, agencia_ong, conta_ong,
                         cidade_ong, id_usuario))
            cur.execute("""
                        update senhas_antigas
                        set senha_3 = senha_2,
                            senha_2 = ?
                        where fk_usuario = ?
                        """, (senha_criptografada, id_usuario))
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


@app.route('/deletar_usuario/<int:id>', methods=['DELETE'])
def deletar_usuario(id):
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
            return jsonify({'error': 'Apenas administradores podem deletar usuários'}), 403




    except Exception as e:
        return jsonify({'message': f'Erro ao verificar token {e}'}), 500

    try:
        cur = con.cursor()

        cur.execute('select id_usuario from usuario where id_usuario= ?', (id,))

        if not cur.fetchone():
            cur.close()
            return jsonify({"error": "Usuário não encontrado"}), 404

        cur.execute("delete from usuario where id_usuario = ?", (id,))
        con.commit()
        cur.close()

        return jsonify({"message": "Usuário deletado com sucesso", 'id_usuario':id})
    except Exception as e:
        return jsonify({'message': f'Erro ao deletar usuário {e}'}), 500
    finally:
        cur.close()


@app.route("/verificar_usuario", methods=['POST'])
def verificar_usuario():
    data = request.get_json()

    destinatario = data.get('email')
    assunto = "Ativação de usuário"
    mensagem = "Seu código para ativar sua conta é"

    email = email_verificacao(destinatario, assunto, mensagem)

    return jsonify({'mensagem': email})


@app.route('/esqueci_minha_senha', methods=['POST'])
def esqueci_minha_senha():
    data = request.get_json()

    destinatario = data.get('email')
    assunto = "Recuperação de senha"
    mensagem = f"Seu código para recuperar sua senha é"

    email = email_verificacao(destinatario, assunto, mensagem)

    return jsonify({'mensagem': email})


@app.route('/alterar_senha', methods=['POST'])
def alterar_senha():
    try:
        dados = request.get_json()

        email = dados.get('email')
        codigo = dados.get('codigo')
        nova_senha = dados.get('nova_senha')

        if not email or not codigo or not nova_senha:
            return jsonify({"message": "Email, código e nova senha são obrigatórios"}), 400

        cur = con.cursor()

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

        id_usuario = usuario[0]
        senha_atual = usuario[1]

        # Nova senha não pode ser igual à atual
        if bcrypt.checkpw(nova_senha.encode('utf-8'), senha_atual.encode('utf-8')):
            return jsonify({"message": "A nova senha não pode ser igual à senha atual"}), 400

        # Busca histórico
        cur.execute("""
            SELECT SENHA_2, SENHA_3
            FROM SENHAS_ANTIGAS
            WHERE FK_USUARIO = ?
        """, (id_usuario,))
        historico = cur.fetchone()

        if historico:
            senha_2 = historico[0]
            senha_3 = historico[1]

            if senha_2 and bcrypt.checkpw(nova_senha.encode('utf-8'), senha_2.encode('utf-8')):
                return jsonify({"message": "Não pode usar a última senha"}), 400

            if senha_3 and bcrypt.checkpw(nova_senha.encode('utf-8'), senha_3.encode('utf-8')):
                return jsonify({"message": "Não pode usar a penúltima senha"}), 400

        nova_senha_verificada = validar_senha(nova_senha)

        if nova_senha_verificada:
            return jsonify({'erro': nova_senha_verificada}), 400

        # 5. Gera hash da nova senha
        nova_senha_verificada_hash = criptografar(nova_senha)

        # Atualiza histórico
        if historico:
            cur.execute("""
                UPDATE SENHAS_ANTIGAS
                SET SENHA_3 = SENHA_2,
                    SENHA_2 = ?
                WHERE FK_USUARIO = ?
            """, (senha_atual, id_usuario))
        else:
            cur.execute("""
                INSERT INTO SENHAS_ANTIGAS (FK_USUARIO, SENHA_2, SENHA_3)
                VALUES (?, ?, ?)
            """, (id_usuario, senha_atual, None))



        # Atualiza senha e limpa código
        cur.execute("""
            UPDATE USUARIO
            SET SENHA = ?,
                CODIGO = NULL
            WHERE ID_USUARIO = ?
        """, (nova_senha_verificada_hash, id_usuario))

        con.commit()

        return jsonify({"message": "Senha alterada com sucesso"}), 200

    except Exception as e:
        if con:
            con.rollback()
        return jsonify({"message": f"Erro ao alterar senha: {e}"}), 500



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


@app.route('/gerar_validar_conta', methods=['POST'])
def gerar_validar_conta():
    data = request.get_json()

    destinatario = data.get('email')
    assunto = "Recuperação de senha"
    mensagem = f"Seu código para recuperar sua senha é"

    email = email_verificacao(destinatario, assunto, mensagem)

    return jsonify({'mensagem': email})


@app.route('/validar_conta/<int:id_usuario>', methods=['POST'])
def validar_conta(id_usuario):
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
    try:
        data = request.get_json()

        email = data.get('email')
        codigo = data.get('codigo')

        sucesso, mensagem = verificar_codigo(email, codigo)

        if sucesso:
            cur = con.cursor()
            cur.execute("""update usuario set situacao = 1 where email = ?""", (email,))
            con.commit()
            return jsonify({"message": "Conta validada com sucesso"})
        else:
            return jsonify({"message": mensagem}), 400
    except Exception as e:
        return jsonify({"message": f"Erro ao validar conta: {e}"}), 500
    finally:
        cur.close()
