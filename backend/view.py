import os.path
from enum import nonmember

from flask import Flask, jsonify, request, send_file, Response, make_response, send_from_directory
import jwt
from flask_bcrypt import check_password_hash, bcrypt
import math
from funcoes import validar_senha, criptografar, checar_senha, enviando_email, gerar_token, verificar_codigo, email_verificacao, valida_nova_senha
from main import app, con
from datetime import datetime

senha_secreta = app.config['SECRET_KEY']

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

quantidadePorPagina = 15

# Se precisar validar uma rota utilizando token no backend
# é preciso rodar o projeto com o link com IP não o localhost
# Se rodar com o localhost NÃO FUNCIONA, o back não pega o token de maneira nenhuma

    # print("Cookies recebidos:", dict(request.cookies))
    # token = request.cookies.get("access_token")
    # print("Token:", token)
    #
    # if not token:
    #     return jsonify({'mensagem': {
    #         'tipo': 'erro',
    #         'descricao': 'Token de autenticação necessário'
    #     }}), 401
    # cur = con.cursor()
    #
    # try:
    #     dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
    #     id_token = dados['id_usuario']
    #     if id_usuario != id_token:
    #         return jsonify({'mensagem': {
    #             'tipo': 'erro',
    #             'descricao': 'Você não tem permissão'
    #         }}), 403
    #
    #     cur.execute(
    #         'SELECT tipo_de_usuario FROM usuario WHERE id_usuario = ?',
    #         (id_token,)
    #     )
    #
    #     usuario = cur.fetchone()
    #     if not usuario:
    #         return jsonify({'mensagem': {
    #             'tipo': 'erro',
    #             'descricao': 'Usuário não encontrado'
    #         }}), 404
    #     tipo_usuario = usuario[0]
    #
    #     #  1 = ONG (ajuste se necessário)
    #     if tipo_usuario != 1:
    #         return jsonify({'mensagem': {
    #             'tipo': 'erro',
    #             'descricao': 'Apenas por ONGs podem acessar esta página'
    #         }}), 403




@app.route('/uploads/<path:filename>')
def arquivos_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/cadastro', methods=['POST'])
def cadastro():
    try:
        cur = con.cursor()
        nome = request.form.get('nome')
        nome = nome.strip()
        if len(nome) <= 0:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'O nome não pode ser vazio'
            }}), 400
        email = request.form.get('email')
        senha = request.form.get('senha')
        confirmar_senha = request.form.get('confirmar_senha')
        tipo_de_usuario = request.form.get('tipo_de_usuario')
        cpf_cnpj = request.form.get('cpf_cnpj')
        tipo_ong = request.form.get('tipo_ong') or None
        descricao_causa = request.form.get('descricao_causa') or None
        banco_ong = request.form.get('banco_ong') or None
        agencia_ong = request.form.get('agencia_ong') or None
        conta_ong = request.form.get('conta_ong') or None
        cidade_ong = request.form.get('cidade_ong') or None
        telefone = request.form.get('telefone')
        imagem = request.files.get('imagem')
        bannerOng = request.files.get('bannerOng')
        email_usuario = email
        if not nome or not email or not senha or not cpf_cnpj or not telefone:
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Todos os campos obrigatórios (Nome, Email, Senha, CPF/CNPJ, Telefone) devem ser preenchidos.'
                }
            }), 400

        if tipo_de_usuario == '1':
            if not tipo_ong or not descricao_causa or not banco_ong or not agencia_ong or not conta_ong or not cidade_ong:
                return jsonify({
                    'mensagem':{
                        'tipo': 'erro',
                        'descricao': 'Para ONGs, os campos Tipo de ONG, Descrição da Causa, Banco, Agência, Conta e Cidade são obrigatórios.'
                    }
                }), 400
        mensagem_validacao = validar_senha(senha, confirmar_senha)
        if mensagem_validacao:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': mensagem_validacao
            }}), 400
        senha_cript = criptografar(senha)

        cur.execute('select 1 from usuario where email = ?', (email,))
        if cur.fetchone():
            cur.execute('select situacao from usuario where email = ?', (email,))
            resultado = cur.fetchone()
        else:
            resultado = None
        if resultado is not None and resultado != 5:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Usuário já cadastrado'
            }}), 400
        else:
            if resultado == 5:
                cur.execute("""DELETE FROM usuario WHERE email = ?""", (email,))
                con.commit()
            cur.execute("""insert into usuario (nome, email, senha, tipo_de_usuario, cpf_cnpj, tipo_ong,
                                                descricao_causa, banco_ong, agencia_ong, conta_ong, cidade_ong,
                                                telefone, senha_antiga_2, senha_antiga_3)
                           values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null, null) RETURNING id_usuario """,
                        (nome, email, senha_cript, tipo_de_usuario, cpf_cnpj,
                         tipo_ong, descricao_causa, banco_ong, agencia_ong,
                         conta_ong, cidade_ong, telefone))
            con.commit()

            cur.execute("""select id_usuario from usuario where email = ?""", (email,))
            codigo_usuario = cur.fetchone()[0]

            caminho_imagem = None

            if imagem:
                nome_imagem = f"{codigo_usuario}.jpg"
                caminho_imagem_destino = os.path.join(app.config['UPLOAD_FOLDER'], "Usuarios/Icone_Perfil")
                os.makedirs(caminho_imagem_destino, exist_ok=True)
                caminho_imagem = os.path.join(caminho_imagem_destino, nome_imagem)
                imagem.save(caminho_imagem)

            if tipo_de_usuario == "1":
                if bannerOng:
                    nome_banner = f"{codigo_usuario}_banner.jpg"
                    caminho_banner_destino = os.path.join(app.config['UPLOAD_FOLDER'], "Usuarios/Baner_Ong/")
                    os.makedirs(caminho_banner_destino, exist_ok=True)
                    caminho_banner = os.path.join(caminho_banner_destino, nome_banner)
                    bannerOng.save(caminho_banner)
            try:
                destinatario = email
                assunto = "Ativação de conta"
                mensagem = f"Seu código para ativar usa conta é"

                email = email_verificacao(destinatario, assunto, mensagem)

            except Exception as e:
                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': f'Erro ao gerar código de validação {e}'
                }}), 500

            return jsonify({'mensagem': {
                'tipo': 'sucesso',
                'descricao': 'Usuário cadastrado com sucesso'
            },
                'usuario': {
                    'nome': nome,
                    'imagem': caminho_imagem,
                    'email': email_usuario
                },
                'mensagem_email': email
                }), 201
    except Exception as e:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': f'Erro ao cadastrar usuário {e}'
        }}), 500
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
    cur = None
    try:
        data = request.get_json()
        email = data.get('email')
        senha = data.get('senha')

        cur = con.cursor()
        cur.execute('SELECT 1 FROM USUARIO WHERE EMAIL = ?', (email,))
        if cur.fetchone():
            cur.execute('SELECT SENHA, ID_USUARIO, SITUACAO FROM USUARIO WHERE EMAIL = ?', (email,))
            infos = cur.fetchone()

            if not infos:
                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Erro ao buscar dados do usuário'
                }}), 500

            senha_armazenada = infos[0]
            id_usuario = infos[1]
            situacao = infos[2]

            if situacao == 0:
                try:
                    destinatario = email
                    assunto = "Ativação de conta"
                    mensagem = "Seu código para ativar sua conta é"

                    email_verificacao(destinatario, assunto, mensagem)

                except Exception as e:
                    return jsonify({'mensagem': {
                        'tipo': 'erro',
                        'descricao': f'Erro ao gerar código de validação: {e}'
                    }}), 500

                return jsonify({'mensagem': {
                    'tipo': 'redirecionamento',
                    'descricao': 'Sua conta está inativa'
                }}), 403
            elif situacao == 5:
                return jsonify({'mensagem':{
                    'tipo': 'erro',
                    'descricao':"Sua Ong foi recusada reflita"
                }})
            if check_password_hash(senha_armazenada, senha):
                token = gerar_token(id_usuario)

                cur.execute('SELECT NOME, TIPO_DE_USUARIO, SITUACAO FROM USUARIO WHERE ID_USUARIO = ?', (id_usuario,))
                resultado = cur.fetchone()
                nome = resultado[0]
                tipoUsuario = resultado[1]
                situacao = resultado[2]
                if situacao in [2, 3]:
                    return jsonify({'mensagem': {
                        'tipo': 'redirecionamento',
                        'descricao': 'Sua conta está inativada ou bloqueada'
                    }}), 403
                elif situacao == 4:
                    return jsonify({'mensagem': {
                        'tipo': 'redirecionamento',
                        'descricao': 'Sua conta ainda está em análise para aprovação'
                    }})

                resp = make_response(jsonify({
                    'mensagem': {
                        'tipo': 'sucesso',
                        'descricao': 'Login bem-sucedido'
                    },
                    'usuario': {
                        'id_usuario': id_usuario,
                        'nome': nome,
                        'email': email,
                        'tipoUsuario': tipoUsuario
                    }
                }), 200)

                resp.set_cookie(
                    "access_token",
                    token,
                    httponly=True,
                    secure=False, #Mexer se for localHost para =
                    samesite="Lax", #Mexer se for localHost para =
                    path="/",
                    max_age=60000
                )

                cur.execute('UPDATE USUARIO SET TENTATIVAS = 0 WHERE EMAIL = ?', (email,))
                con.commit()

                return resp

            else:
                cur.execute('SELECT TENTATIVAS FROM USUARIO WHERE EMAIL = ?', (email,))
                resultado = cur.fetchone()

                if not resultado:
                    return jsonify({'mensagem': {
                        'tipo': 'erro',
                        'descricao': 'Erro ao buscar tentativas'
                    }}), 500

                tentativas = resultado[0] + 1

                cur.execute(
                    'UPDATE USUARIO SET TENTATIVAS = ? WHERE EMAIL = ? AND TIPO_DE_USUARIO != 2',
                    (tentativas, email)
                )
                con.commit()

                if tentativas >= 3 or situacao == 2:
                    cur.execute('UPDATE USUARIO SET SITUACAO = 2, TENTATIVAS = 0 WHERE EMAIL = ?', (email,))
                    con.commit()
                    return jsonify({'mensagem': {
                        'tipo': 'redirecionamento',
                        'descricao': 'Sua conta está inativada'
                    }}), 403

                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Senha ou email incorreto(s)'
                }}), 401

        else:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Senha ou email incorreto(s)'
            }}), 404

    except Exception as e:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': f'Erro ao realizar o login: {e}'
        }}), 500

    finally:
        if cur:
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
            return (jsonify({'message': f'Erro ao verificar token {e}'}), 401)

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


@app.route('/editar_usuario/<int:id_usuario>', methods=['GET','PUT'])
def editar_usuario(id_usuario):
    token = request.cookies.get("access_token")
    if not token:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token de autenticação necessário'
        }}), 401
    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']
        cur = con.cursor()
        cur.execute('select tipo_de_usuario from usuario where id_usuario = ?', (id_token,))
        tipo_usuario = cur.fetchone()[0]
        if tipo_usuario == 2:
            pass
        elif (tipo_usuario == 0 or tipo_usuario == 1) and id_usuario != id_token:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Usuário não tem permissão para editar esse usuário'
            }}), 403
    except Exception as e:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': f'Erro ao verificar token {e}'
        }}), 401
    cur = con.cursor()
    if request.method == "GET":
        try:
            if id_usuario == 0:
                cur.execute("""select nome, email, telefone, cpf_cnpj 
                               from usuario
                               where id_usuario = ?""",
                            (id_usuario,))
                usuario = cur.fetchone()
                if not usuario:
                    return jsonify({'mensagem': {
                        'tipo': 'erro',
                        'descricao': 'Usuário não encontrado'
                    }})
                else:

                    return jsonify({'usuario':{
                        'nome': usuario[0],
                        'email': usuario[1],
                        'telefone': usuario[2],
                        'cpf_cnpj': usuario[3]
                    }})
            else:
                cur.execute("""select nome, email, telefone, cpf_cnpj, tipo_ong, descricao_causa, banco_ong, agencia_ong, conta_ong, cidade_ong
                               from usuario
                               where id_usuario = ?""",
                            (id_usuario,))
                usuario = cur.fetchone()
                if not usuario:
                    return jsonify({'mensagem': {
                        'tipo': 'erro',
                        'descricao': 'Usuário não encontrado'
                    }})
                else:
                    return jsonify({'usuario':{
                        'nome' : usuario[0],
                        'email': usuario[1],
                        'telefone': usuario[2],
                        'cpf_cnpj': usuario[3],
                        'tipo_ong': usuario[4],
                        'descricao_causa': usuario[5],
                        'banco_ong': usuario[6],
                        'agencia_ong': usuario[7],
                        'conta_ong': usuario[8],
                        'cidade_ong': usuario[9]
                    }})
        except Exception as e:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': f'Erro ao buscar dados do usuário {e}'
            }})
        finally:
            cur.close()
    if request.method == "PUT":
        try:
            cur.execute("""select 1
                            from usuario
                            where id_usuario = ?""", (id_usuario,))
            tem_user = cur.fetchone()

            if not tem_user:
                cur.close()
                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Usuário não encontrado'
                }}), 404

            cur.execute("""select tipo_de_usuario, nome, email, telefone, tipo_ong, descricao_causa, banco_ong, agencia_ong, conta_ong, cidade_ong
                           from usuario
                           where id_usuario = ?""", (id_usuario,))
            infos = cur.fetchone()

            nome = request.form.get('nome') or infos[1]
            email = request.form.get('email') or infos[2]
            senha = request.form.get('senha')
            telefone = request.form.get('telefone') or infos[3]
            imagem = request.files.get('imagem')
            banner = request.files.get('bannerOng')
            tipo_ong = request.form.get('tipo_ong') or infos[4]
            descricao_causa = request.form.get('descricao_causa') or infos[5]
            banco_ong = request.form.get('banco_ong') or infos[6]
            agencia_ong = request.form.get('agencia_ong') or infos[7]
            conta_ong = request.form.get('conta_ong') or infos[8]
            cidade_ong = request.form.get('cidade_ong') or infos[9]

            cur.execute('select 1 from usuario where email = ? and id_usuario != ?', (email, id_usuario,))
            if cur.fetchone():
                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Usuário já cadastrado'
                }}), 400

            if imagem and imagem.filename != "":
                nome_imagem = f"{id_usuario}.jpg"
                caminho_imagem_destino = os.path.join(app.config['UPLOAD_FOLDER'], "Usuarios/Icone_Perfil")
                os.makedirs(caminho_imagem_destino, exist_ok=True)
                caminho_imagem = os.path.join(caminho_imagem_destino, nome_imagem)
                imagem.save(caminho_imagem)

            if banner and banner.filename != "":
                nome_banner = f"{id_usuario}_banner.jpg"
                caminho_banner_destino = os.path.join(app.config['UPLOAD_FOLDER'], "Usuarios/Baner_Ong", )
                os.makedirs(caminho_banner_destino, exist_ok=True)
                caminho_banner = os.path.join(caminho_banner_destino, nome_banner)
                banner.save(caminho_banner)

            if senha:
                mensagem, senha_criptografada = valida_nova_senha(senha, id_usuario, cur)

                if mensagem:
                    return jsonify({'mensagem': {
                        'tipo': 'erro',
                        'descricao': mensagem
                    }}), 400

                mensagem_validacao = validar_senha(senha)
                if mensagem_validacao:
                    return jsonify({'mensagem': {
                        'tipo': 'erro',
                        'descricao': mensagem_validacao
                    }}), 400


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
                return jsonify({'mensagem': {
                    'tipo': 'sucesso',
                    'descricao': 'Usuário atualizado com sucesso'
                }}), 201

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
            return jsonify({'mensagem': {
                'tipo': 'sucesso',
                'descricao': 'Usuário atualizado com sucesso'
            }}), 201
        except Exception as e:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': f'Erro ao editar usuário {e}'
            }}), 500
        finally:
            cur.close()


@app.route('/ativar_desativar_usuario/<int:id_usuario>', methods=['PUT'])
def ativar_desativar_usuario(id_usuario):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': {
            "tipo":"erro",
            "descricao":'Token de autenticação necessário'}}), 401

    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']
        cur = con.cursor()
        cur.execute('select tipo_de_usuario from usuario where id_usuario = ?', (id_token,))
        tipo_usuario = cur.fetchone()[0]
        if tipo_usuario != 2:
            cur.close()
            return jsonify({'mensagem': {
                "tipo":"erro",
                "descricao":'Apenas administradores podem ativar/desativar usuários'}}), 403

    except Exception as e:
        return jsonify({'message': {
            "tipo":"erro",
            "mensagem":f'Erro ao verificar token {e}'}}), 401

    try:
        cur = con.cursor()

        cur.execute('select id_usuario from usuario where id_usuario= ?', (id_usuario,))

        if not cur.fetchone():
            return jsonify({"mensagem": {
                "tipo":"erro",
                "mensagem":"Usuário não encontrado"}}), 404

        cur.execute('select situacao from usuario where id_usuario =?',(id_usuario,))
        situacao = cur.fetchone()

        if situacao[0] == 1:
            cur.execute("""update usuario set situacao = 3 where id_usuario = ?""", (id_usuario,))
            con.commit()
            return jsonify({"mensagem": {
                "tipo":"sucesso",
                "descricao":"Usuário desativado com sucesso",
                'id_usuario':id_usuario}})

        if situacao[0] == 3 or situacao[0] == 2:
            cur.execute("""update usuario set situacao = 1 where id_usuario = ?""", (id_usuario,))
            con.commit()
            return jsonify({"mensagem": {
                "tipo":"sucesso",
                "descricao":"Usuário Ativado com sucesso",
                'id_usuario':id_usuario}})


    except Exception as e:
        return jsonify({'mensagem': {
            "tipo":"erro",
            "descricao":f'Erro ao desativar usuário {e}'}}), 500
    finally:
        cur.close()


@app.route('/esqueci_minha_senha', methods=['POST'])
def esqueci_minha_senha():
    cur = con.cursor()
    try:
        data = request.get_json()
        destinatario = data.get('email')

        assunto = "Recuperação de senha"
        mensagem = f"Seu código para recuperar sua senha é"
        email, tipo = email_verificacao(destinatario, assunto, mensagem)

        return jsonify({'mensagem': {
            'tipo': tipo,
            'descricao': email
        }})
    except Exception as e:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': f'Erro ao enviar email {e}'
        }})
    finally:
        cur.close()
@app.route('/alterar_senha', methods=['POST'])
def alterar_senha():
    cur = con.cursor()
    try:
        dados = request.get_json()

        email = dados.get('email')
        codigo = dados.get('codigo')
        nova_senha = dados.get('nova_senha')
        confirmar_nova_senha = dados.get('confirmar_nova_senha')

        cur.execute("""select 1
                       from usuario
                       where email = ?""", (email,))
        if not cur.fetchone():
            return jsonify({"mensagem": {
                'tipo': 'erro',
                'descricao': "Email não encontrado"
            }}), 404

        if not nova_senha and not confirmar_nova_senha:
            # 1. Verifica código
            sucesso, mensagem = verificar_codigo(email, codigo)
            if sucesso:
                tipo = 'sucesso'
            else:
                tipo = 'erro'

            if not sucesso:
                return jsonify({"mensagem": {
                    'tipo': 'erro',
                    'descricao': mensagem
                }}), 400
            else:
                return jsonify({"mensagem": {
                    'tipo': 'sucesso',
                    'descricao': mensagem
                }}), 201
        else:
            if not email or not codigo or not nova_senha or not confirmar_nova_senha:
                return jsonify({"mensagem": {
                    'tipo': 'erro',
                    'descricao': "Email, código e nova senha são obrigatórios"
                }}), 400

            cur.execute("""select 1
                           from usuario
                           where email = ?""", (email,))
            if not cur.fetchone():
                return jsonify({"mensagem": {
                    'tipo': 'erro',
                    'descricao': "Email não encontrado"
                }}), 404

            sucesso, mensagem = verificar_codigo(email, codigo)
            if sucesso:
                tipo = 'sucesso'
            else:
                tipo = 'erro'

            if not sucesso:
                return jsonify({"mensagem": {
                    'tipo': 'erro',
                    'descricao': mensagem
                }}), 400


            # Busca usuário
            cur.execute("""
                SELECT ID_USUARIO, SENHA
                FROM USUARIO
                WHERE EMAIL = ?
            """, (email,))
            usuario = cur.fetchone()

            if not usuario:
                return jsonify({"mensagem": {
                    'tipo': 'erro',
                    'descricao': "Usuário não encontrado"
                }}), 404

            mensagem, senha_criptografada = valida_nova_senha(nova_senha, usuario[0], cur)
            if mensagem is not None:
                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': mensagem
                }}), 400

            mensagem_validacao = validar_senha(nova_senha, confirmar_nova_senha)
            if mensagem_validacao is not None:
                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': mensagem_validacao
                }}), 400

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

            return jsonify({"mensagem": {
                'tipo': 'sucesso',
                'descricao': "Senha alterada com sucesso"
            }}), 200

    except Exception as e:
        if con:
            con.rollback()
        return jsonify({"mensagem": {
            'tipo': 'erro',
            'descricao': f"Erro ao alterar senha: {e}"
        }}), 500
    finally:
        cur.close()


@app.route('/logout', methods=['POST'])
def logout():
    # token = request.cookies.get('access_token')
    # if not token:
    #     return jsonify({'mensagem': {
    #         'tipo': 'erro',
    #         'descricao': 'Token de autenticação necessário'
    #     }}), 401
    #o console diz "Token de autenticação necessário" então nn ta passando o token do usuario logado pro backend. -diogo

    resp = make_response(jsonify({'mensagem': {
        'tipo': 'sucesso',
        'descricao': 'Logout realizado com sucesso'
    }}))

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

        cur.execute("select tipo_de_usuario from usuario where email = ?", (email,))
        tipo_usuario = cur.fetchone()[0]


        if not infos:
            return jsonify({"mensagem": {
                'tipo': 'erro',
                'descricao': "Email não encontrado"
            }}), 404
        elif infos[1] == 0:
            sucesso, mensagem = verificar_codigo(email, codigo)
            print(sucesso)
            print(mensagem)
            if tipo_usuario == 0 or tipo_usuario == 2:
                if sucesso:
                    cur.execute("""UPDATE usuario SET situacao = 1, codigo = NULL WHERE email = ? AND situacao != 1 """, (email,))
                    con.commit()
                    return jsonify({"mensagem": {
                        'tipo': 'sucesso',
                        'descricao': "Conta validada com sucesso"
                    }})
                else:
                    return jsonify({"mensagem": {
                        'tipo': 'erro',
                        'descricao': "Código inválido"
                    }})
            elif tipo_usuario == 1:
                if sucesso:
                    cur.execute("""UPDATE usuario SET situacao = 4, codigo = NULL WHERE email = ? AND situacao != 1 """, (email,))
                    con.commit()
                    return jsonify({"mensagem": {
                        'tipo': 'sucesso',
                        'descricao': "Conta validada com sucesso"
                    }})
                else:
                    return jsonify({"mensagem": {
                        'tipo': 'erro',
                        'descricao': "Código inválido"
                    }})
            else:
                return jsonify({"mensagem": {
                    'tipo': 'erro',
                    'descricao': 'Usuário não encontrado'
                }}), 400
        else:
            return jsonify({"mensagem": {
                'tipo': 'redirecionamento',
                'descricao': "Conta já validada"
            }})

    except Exception as e:
        return jsonify({"mensagem": {
            'tipo': 'erro',
            'descricao': f"Erro ao validar conta: {e}"
        }}), 500
    finally:
        cur.close()


@app.route('/listar_ong_adm/<int:pagina>/<int:aprovacao>', methods=['GET'])
def listar_ong_adm(pagina, aprovacao):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': {
            "tipo":"erro",
            "descricao":'Token de autenticação necessário'}}), 401
    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']
        cur = con.cursor()
        cur.execute('select tipo_de_usuario from usuario where id_usuario = ?', (id_token,))
        tipo_usuario = cur.fetchone()[0]
        if tipo_usuario != 2:
            cur.close()
            return jsonify({'mensagem': {
                "tipo":"erro",
                "descricao":'Apenas administradores podem acessar esta pagina'}}), 403
    except Exception as e:
        return jsonify({'mensagem': {
            "tipo":"erro",
            "descricao":f'Erro ao verificar token {e}'}}), 500
    finally:
        cur.close()

    try:
        cur = con.cursor()
        nome = request.args.get('nome', '')

        if aprovacao == 0:
            cur.execute("""select count(id_usuario)
                           from usuario
                           where tipo_de_usuario = 1
                            and situacao in (0, 4)
                            AND UPPER(nome) LIKE UPPER(?)
                        """, (f"%{nome}%",))
        elif aprovacao == 1:
            cur.execute("""select count(id_usuario)
                           from usuario
                           where tipo_de_usuario = 1 
                            and situacao not in (0, 4)
                            AND UPPER(nome) LIKE UPPER(?)
                        """, (f"%{nome}%",))
        else:
            return jsonify({'mensagem': {
                "tipo": "erro",
                "descricao": "Filtro de aprovação inválido"
            }}), 400

        quantidade = cur.fetchone()[0]

        numeroPaginas = math.ceil(quantidade / quantidadePorPagina)

        minimo = ((pagina - 1) * quantidadePorPagina) + 1
        maximo = pagina * quantidadePorPagina

        if aprovacao == 0:
            cur.execute("""
                        SELECT id_usuario, nome, descricao_causa, situacao, cpf_cnpj, telefone, data_hora_registro
                        FROM usuario
                        WHERE tipo_de_usuario = 1
                          AND situacao IN (0, 4)
                                  AND UPPER(nome) LIKE UPPER(?)
                        ORDER BY id_usuario DESC ROWS ? TO ?
                        """, (f"%{nome}%", minimo, maximo))
        elif aprovacao == 1:
            cur.execute("""
                        SELECT id_usuario, nome, descricao_causa, situacao, cpf_cnpj, telefone, data_hora_registro
                        FROM usuario
                        WHERE tipo_de_usuario = 1
                          AND situacao NOT IN (0, 4)
                          AND UPPER(nome) LIKE UPPER(?)
                        ORDER BY id_usuario DESC ROWS ? TO ?
                        """, (f"%{nome}%", minimo, maximo))
        else:
            return jsonify({'mensagem': {
                "tipo": "erro",
                "descricao": "Filtro de aprovação inválido"
            }}), 400

        ongs = cur.fetchall()
        ongs_lista = []

        numeroOng = 1
        for ong in ongs:
            ongs_lista.append({
                'id_usuario': ong[0],
                'nome': ong[1],
                'descricao_causa': ong[2],
                'situacao': ong[3],
                'cpf_cnpj': ong[4],
                'telefone': ong[5],
                'data_hora_registro': ong[6].strftime("%d/%m/%Y %H:%M")
            })
            numeroOng += 1

        proximaPagina = pagina + 1
        if proximaPagina > numeroPaginas:
            proximaPagina = 0

        return jsonify({
            'mensagem':'Lista de Ongs',
            'ongs':ongs_lista,
            'numeroPaginas':numeroPaginas,
            'proximaPagina':proximaPagina,
            'paginaAnterior':pagina - 1
        })

    except Exception as e:
        return jsonify({'message':{
            "tipo":"erro",
            "descricao":f'Erro ao consultar banco de dados: {e}'}}), 500
    finally:
        cur.close()


@app.route('/cadastrar_projeto/<int:id_usuario>', methods=["POST"])
def cadastrar_projeto(id_usuario):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao':'Token de autenticação necessário'}}), 401
    cur = None

    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']
        if id_usuario != id_token:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao':'Você não tem permissão'}}), 403

        cur = con.cursor()
        cur.execute(
            'SELECT tipo_de_usuario FROM usuario WHERE id_usuario = ?',
            (id_token,)
        )
        usuario = cur.fetchone()
        if not usuario:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Usuário não encontrado'
            }}), 404
        tipo_usuario = usuario[0]

        # 2 = admin | 1 = ONG
        if tipo_usuario not in [1, 2]:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Apenas administradores e ONGs podem acessar esta página'
            }}), 403

        nome = request.form.get('nome')
        descricao = request.form.get('descricao')
        meta_doacao = request.form.get('meta_doacao')
        atividade = request.form.get('atividade', 1)
        imagem = request.files.get('imagem')

        cur.execute('select 1 from projeto_ong where lower(nome) = lower(?) and fk_usuario_ong = ?', (nome, id_usuario))
        if cur.fetchone():
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Projeto já cadastrado'
            }})


        if not nome or not str(nome).strip():
            return jsonify({'mensagem': {
                "tipo":"erro",
                'descricao':'Nome obrigatório'}}), 400
        if not descricao or not str(descricao).strip():
            return jsonify({'mensagem': {
                'tipo':'erro',
                'descricao':'Descrição obrigatória'}}), 400
        if meta_doacao is None:
            return jsonify({'mensagem': {
                'tipo':"erro",
                'descricao':'Meta de doação obrigatória'}}), 400
        try:
            meta_doacao = int(meta_doacao)
        except:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Meta deve ser número'
            }}), 400

        if meta_doacao <= 0:
            return jsonify({'mensagem': {
                'tipo':'erro',
                'descricao': 'Meta deve ser maior que zero'
            }}), 400

        try:
            atividade = int(atividade)
        except:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Atividade inválida'
            }}), 400


        cur.execute("""
            INSERT INTO PROJETO_ONG (
                FK_USUARIO_ONG,
                NOME,
                DESCRICAO,
                META_DOACAO,
                ATIVIDADE
            )
            VALUES (?, ?, ?, ?, ?)
            RETURNING ID_PROJETO
        """, (id_usuario, nome.strip(), descricao.strip(), meta_doacao, atividade))

        id_projeto = cur.fetchone()[0]
        con.commit()

        caminho_imagem = None

        if imagem:
            nome_imagem = f"{id_projeto}.jpg"
            caminho_imagem_destino = os.path.join(app.config['UPLOAD_FOLDER'], "Usuarios/Projeto")
            os.makedirs(caminho_imagem_destino, exist_ok=True)
            caminho_imagem = os.path.join(caminho_imagem_destino, nome_imagem)
            imagem.save(caminho_imagem)


        return jsonify({
            'mensagem': {
                'tipo': 'sucesso',
                'descricao': 'Projeto cadastrado com sucesso'
            },
            'id_projeto': id_projeto
        }), 201

    except jwt.ExpiredSignatureError:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token expirado'
        }}), 401

    except jwt.InvalidTokenError:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token invalido'
        }}), 401

    except Exception as e:
        if con:
            con.rollback()
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': f'Erro ao cadastrar projeto: {e}'
        }}), 500

    finally:
        if cur:
            cur.close()

@app.route('/listar_projetos/<int:id_usuario>/<int:pagina>', methods=['GET'])
def listar_projetos(id_usuario, pagina):
    cur = con.cursor()
    try:
        nome = request.args.get('nome', '')
        cur.execute("""select count(id_projeto)
                       from projeto_ong
                       where fk_usuario_ong = ? AND UPPER(nome) LIKE UPPER(?)""", (id_usuario, f"%{nome}%"))
        quantidade = cur.fetchone()[0]

        numeroPaginas = math.ceil(quantidade/quantidadePorPagina)

        minimo = ((pagina - 1) * quantidadePorPagina) + 1
        maximo = pagina * quantidadePorPagina

        cur.execute("""
                    SELECT id_projeto, nome, descricao, atividade
                    FROM projeto_ong
                    WHERE fk_usuario_ong = ?
                      AND UPPER(nome) LIKE UPPER(?)
                    ORDER BY id_projeto desc
                    ROWS ? TO ?
                    """, (id_usuario, f"%{nome}%", minimo, maximo))
        resultado = cur.fetchall()

        projetos = []
        numeroProjeto = 1
        for linha in resultado:
            projetos.append({
                'numero projeto': numeroProjeto,
                'id_projeto': linha[0],
                'nome': linha[1],
                'descricao': linha[2],
                'atividade': linha[3]
            })
            numeroProjeto += 1
            proximaPagina = pagina+1
            if proximaPagina > numeroPaginas:
                proximaPagina = 0
        return jsonify({'projetos': projetos, 'numeroPaginas': numeroPaginas, 'proximaPagina': proximaPagina, 'paginaAnterior': pagina - 1}), 200
    except Exception as e:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': f'Erro ao listar projetos {e}'
        }}), 500
    finally:
        cur.close()


@app.route('/postar/<int:id_usuario>/<int:id_projeto>', methods=['POST'])
def postar(id_usuario, id_projeto):
    token = request.cookies.get("access_token")

    if not token:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token de autenticação necessário'
        }}), 401
    cur = con.cursor()

    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']
        if id_usuario != id_token:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Você não tem permissão'
            }}), 403

        cur.execute(
            'SELECT tipo_de_usuario FROM usuario WHERE id_usuario = ?',
            (id_token,)
        )

        usuario = cur.fetchone()
        if not usuario:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Usuário não encontrado'
            }}), 404
        tipo_usuario = usuario[0]

        #  1 = ONG (ajuste se necessário)
        if tipo_usuario != 1:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Apenas por ONGs podem acessar esta página'
            }}), 403
        cur.execute(
            'SELECT ID_PROJETO FROM PROJETO_ONG WHERE ID_PROJETO = ?', (id_projeto,)
        )

        projeto = cur.fetchone()
        if not projeto:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'O projeto não existe'
            }}), 403

    except Exception as e:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': f'Não foi possível fazer o post {e}'
            }})

    titulo = request.form.get('titulo')
    acao = request.form.get('acao')
    atividade = request.form.get('atividade', 1)
    imagem = request.files.get('imagem')
    cur.execute("""select fk_usuario_ong 
                   from projeto_ong
                   where id_projeto = ?""", (id_projeto,))
    idOngProjeto = cur.fetchone()[0]
    if idOngProjeto != id_usuario:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'O projeto pertence a outra ong'
        }})
    if not titulo or not str(titulo).strip():
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Título obrigatório'
        }}), 400
    if not acao or not str(acao).strip():
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Ação obrigatória'
        }}), 400


    try:
        cur.execute("""
                    INSERT INTO POST_PROJETO (FK_PROJETO,
                                             TITULO,
                                             ACAO,
                                             ATIVIDADE)
                    VALUES (?, ?, ?, ?) RETURNING ID_POST_PROJETO
                    """, (id_projeto, titulo.strip(), acao.strip(), atividade))

        id_post = cur.fetchone()[0]
        con.commit()

        caminho_imagem = None

        if imagem:
            nome_imagem = f"{id_post}.jpg"
            caminho_imagem_destino = os.path.join(app.config['UPLOAD_FOLDER'], "Usuarios/Post_Ong")
            os.makedirs(caminho_imagem_destino, exist_ok=True)
            caminho_imagem = os.path.join(caminho_imagem_destino, nome_imagem)
            imagem.save(caminho_imagem)

        return jsonify({
            'mensagem': {
                'tipo': 'sucesso',
                'descricao': 'Post realizado com sucesso'
            },
            'id_post': id_post
        }), 201

    except Exception as e:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': f'Não foi possível fazer o Post {e}'
        }}), 500

    finally:
        cur.close()



@app.route("/editar_projeto/<int:id_usuario>/<int:id_projeto>", methods=['PUT', 'GET'])
def editar_projeto(id_projeto, id_usuario):

    token = request.cookies.get("access_token")
    if not token:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token de autenticação necessário'
        }}), 401
    cur = con.cursor()
    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']
        cur.execute(
            'SELECT tipo_de_usuario FROM usuario WHERE id_usuario = ?',
            (id_token,)
        )
        tipo_de_usuario = cur.fetchone()[0]
        if not tipo_de_usuario:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Usuário não encontrado'
            }}), 404
        if tipo_de_usuario == 2:
            pass
        elif (tipo_de_usuario == 1 or tipo_de_usuario ==0) and (id_usuario != id_token):
            return jsonify({'mensagem':{
                'tipo': 'erro',
                'descricao': 'Você não tem permissão'
            } }), 403
    except jwt.ExpiredSignatureError:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token expirado'
        }}), 401
    except jwt.InvalidTokenError:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token inválido'
        }}), 401

    if request.method == "GET":
        try:
            if tipo_de_usuario == 1:
                cur.execute(
                    'select nome, meta_doacao, descricao from projeto_ong where id_projeto = ? and fk_usuario_ong = ? ',
                    (id_projeto, id_usuario))
                info_projeto_ong = cur.fetchone()
                if not info_projeto_ong:
                    return jsonify({'mensagem': {
                        'tipo': 'erro',
                        'descricao': 'Projeto não encontrado'
                    }})
                return jsonify({'projeto': {
                    'nome': info_projeto_ong[0],
                    'meta_doacao': info_projeto_ong[1],
                    'descricao': info_projeto_ong[2]
                }})

            if tipo_de_usuario == 2:
                cur.execute('select nome, meta_doacao, descricao from projeto_ong where id_projeto = ?', (id_projeto, ))
                projeto_ong = cur.fetchone()

                if not projeto_ong:
                    return jsonify({'mensagem': {
                        'tipo': 'erro',
                        'descricao': 'Projeto não encontrado'
                    }})
                return jsonify({'projeto': {
                    'nome': projeto_ong[0],
                    'meta_doacao': projeto_ong[1],
                    'descricao': projeto_ong[2]
                }})
        except Exception as e:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': f'Erro ao buscar dados do projeto: {e}'
            }}), 500
        finally:
            cur.close()
    if request.method == "PUT":
        try:
            nome = request.form.get('nome')
            descricao = request.form.get('descricao')
            meta_doacao = request.form.get('meta_doacao')

            imagem = request.files.get('imagem')

            if not nome or not str(nome).strip():
                return jsonify({'mensagem': {
                    "tipo": "erro",
                    "descricao": 'Nome obrigatório'
                }}), 400
            if not descricao or not str(descricao).strip():
                return jsonify({'mensagem': {
                    "tipo": "erro",
                    'descricao': 'Descrição obrigatória'
                }}), 400
            if meta_doacao is None:
                return jsonify({'mensagem': {
                    "tipo": "erro",
                    "descricao": 'Meta de doação obrigatória'}}), 400
            try:
                meta_doacao = int(meta_doacao)
            except:
                return jsonify({'mensagem': {
                    "tipo": "erro",
                    "descricao": 'Meta deve ser número'}}), 400

            if meta_doacao <= 0:
                return jsonify({'mensagem': {
                    "tipo": "erro",
                    "descricao": 'Meta deve ser maior que zero'}}), 400

            cur.execute("""
                        UPDATE PROJETO_ONG
                        SET NOME        =?,
                            DESCRICAO   = ?,
                            META_DOACAO = ?
                        WHERE ID_PROJETO = ?
                          AND FK_USUARIO_ONG = ?

                        """, (nome.strip(), descricao.strip(), meta_doacao, id_projeto, id_usuario))
            con.commit()
            caminhho_imagem = None

            if imagem:
                nome_imagem = f"{id_projeto}.jpg"
                caminho_imagem_destino = os.path.join(app.config['UPLOAD_FOLDER'], "Usuarios/Projeto")
                os.makedirs(caminho_imagem_destino, exist_ok=True)
                caminho_imagem = os.path.join(caminho_imagem_destino, nome_imagem)
                imagem.save(caminho_imagem)

            return jsonify({
                'mensagem': {
                    'tipo': 'sucesso',
                    'descricao': 'Projeto editado com sucesso'
                },
                'id_projeto': id_projeto
            }), 201
        except Exception as e:
            if con:
                con.rollback()
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': f'Erro ao editar projeto: {e}'
            }}), 500
        finally:
            cur.close()


@app.route("/editar_post/<int:id_usuario>/<int:id_projeto>/<int:id_post>", methods=['PUT', "GET"])
def editar_post(id_projeto, id_usuario, id_post):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token de autenticação necessário'
        }}), 401
    cur = None

    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']
        if id_usuario != id_token:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Você não tem permissão'
            }}), 403

        cur = con.cursor()
        cur.execute(
            'SELECT tipo_de_usuario FROM usuario WHERE id_usuario = ?',
            (id_token,)
        )
        usuario = cur.fetchone()
        if not usuario:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Usuário não encontrado'
            }}), 404
        tipo_usuario = usuario[0]

        # 2 = admin | 1 = ONG
        if tipo_usuario not in [1, 2]:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Apenas administradores e ONGs podem acessar esta página'
            }}), 403

        if request.method == "GET":
            cur.execute('select titulo, atividade, acao from post_projeto where fk_projeto = ? and id_post_projeto = ? ',(id_projeto, id_post))
            info_post = cur.fetchone()
            return jsonify({'post':{
                'titulo': info_post[0],
                'atividade': info_post[1],
                'acao': info_post[2]
            }})


        titulo = request.form.get('titulo')
        atividade = request.form.get('atividade', 1)
        acao = request.form.get('acao')
        imagem = request.files.get('imagem')

        if not titulo or not str(titulo).strip():
            return jsonify({'mensagem': {
                "tipo": "erro",
                "descricao": 'Titulo obrigatório'
            }}), 400
        if not acao or not str(acao).strip():
            return jsonify({'mensagem': {
                "tipo": "erro",
                'descricao': 'Descrição obrigatória'
            }}), 400

        try:
            atividade = int(atividade)
        except:
            return jsonify({'mensagem': {
                "tipo": "erro",
                "descricao": 'Atividade inválida'}}), 400

        if tipo_usuario ==1:
            cur.execute('select 1 from projeto_ong where id_projeto = ? and fk_usuario_ong = ?', (id_projeto, id_usuario))
            projeto_ong = cur.fetchone()
            if not projeto_ong:
                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Projeto não encontrado'
                }})

        elif tipo_usuario == 2:
            cur.execute('select 1 from projeto_ong where id_projeto = ? ', (id_projeto,))
            projeto_ong = cur.fetchone()
            if not projeto_ong:
                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Projeto não encontrado'
                }})

        cur.execute("""
                    UPDATE POST_PROJETO
                    SET TITULO   =?,
                        ACAO      = ?,
                        ATIVIDADE      = ?
                    WHERE ID_POST_PROJETO = ? AND FK_PROJETO = ?

                    """, (titulo.strip(), acao.strip(), atividade, id_post ,id_projeto))
        con.commit()
        caminhho_imagem = None

        if imagem:
            nome_imagem = f"{id_post}.jpg"
            caminho_imagem_destino = os.path.join(app.config['UPLOAD_FOLDER'], "Usuarios/Post_Ong")
            os.makedirs(caminho_imagem_destino, exist_ok=True)
            caminho_imagem = os.path.join(caminho_imagem_destino, nome_imagem)
            imagem.save(caminho_imagem)

        return jsonify({
            'mensagem': {
                'tipo': 'sucesso',
                'descricao': 'Post editado com sucesso'
            },
            'id_projeto': id_projeto
        }), 201

    except jwt.ExpiredSignatureError:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token expirado'
        }}), 401

    except jwt.InvalidTokenError:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token inválido'
        }}), 401

    except Exception as e:
        if con:
            con.rollback()
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': f'Erro ao editar POST: {e}'
        }}), 500

    finally:
        if cur:
            cur.close()




@app.route("/ativar_desativar_projeto/<int:id_usuario>/<int:id_projeto>", methods=["PUT"])
def ativar_desativar_projeto(id_usuario, id_projeto):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token de autenticação necessário'
        }}), 401
    cur = con.cursor()


    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']
        if id_usuario != id_token:
            cur.execute("""select tipo_de_usuario from usuario where id_usuario = ?""", (id_token,))
            tipo = cur.fetchone()
            if tipo == 2 or tipo == 1:
                pass
            else:
                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Você não tem permissão'
                }}), 403

        cur.execute(
            'SELECT tipo_de_usuario FROM usuario WHERE id_usuario = ?',(id_token,)
        )
        usuario = cur.fetchone()
        if not usuario:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Usuário não encontrado'
            }}), 404
        tipo_usuario = usuario[0]


        # 2 = admin | 1 = ONG
        if tipo_usuario not in [1, 2]:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Apenas administradores e ONGs podem acessar esta página'
            }}), 403
    except jwt.ExpiredSignatureError:
        return jsonify({'mensagem': {
        'tipo': 'erro',
        'descricao': f'É necessário um token válido para ativar/desativar um post'
    }}), 200

    try:
        if tipo_usuario == 1:
            cur.execute('select 1 from projeto_ong where id_projeto = ? and fk_usuario_ong = ?', (id_projeto, id_usuario))
            projeto_ong = cur.fetchone()
            if not projeto_ong:
                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Projeto não encontrado'
                }})
            cur.execute('select atividade from projeto_ong where id_projeto = ? and fk_usuario_ong = ?', (id_projeto, id_usuario))
            atividade = cur.fetchone()[0]
        if tipo_usuario == 2:
            cur.execute('select 1 from projeto_ong where id_projeto = ?',
                        (id_projeto,))
            projeto_ong = cur.fetchone()

            if not projeto_ong :
                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Projeto não encontrado'
                }})
            cur.execute('select atividade from projeto_ong where id_projeto = ?', (id_projeto,))
            atividade = cur.fetchone()[0]


        nova_atividade = 0 if atividade == 1 else 1

        cur.execute('update projeto_ong set atividade = ? where ID_PROJETO = ?', (nova_atividade, id_projeto))
        con.commit()
        status = 'ativado' if nova_atividade == 1 else 'desativado'
        return jsonify({'mensagem': {
            'tipo': 'sucesso',
            'descricao': f'Projetor {status} com sucesso'
        }})

    except Exception as e:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': f'Erro ao ativar/desativar projeto: {e}'
        }}), 500
    finally:
        cur.close()

@app.route('/excluir_projeto/<int:id_usuario>/<int:id_projeto>', methods=['DELETE'])
def excluir_projeto(id_usuario, id_projeto):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token de autenticação necessário'
        }}), 401
    cur = con.cursor()
    dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
    id_token = dados['id_usuario']
    try:
        if id_usuario != id_token:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Você não tem permissão'
            }}), 403

        cur.execute(
            'SELECT tipo_de_usuario FROM usuario WHERE id_usuario = ?',
            (id_token,)
        )
        usuario = cur.fetchone()
        if not usuario:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Usuário não encontrado'
            }}), 404
        tipo_usuario = usuario[0]

        # 2 = admin | 1 = ONG
        if tipo_usuario == 2:
            pass
        elif tipo_usuario == 1 and (id_usuario != id_token):
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Apenas administradores e ONGs podem acessar esta página'
            }}), 403
    except jwt.ExpiredSignatureError:
        return jsonify({'mensagem': {
            'tipo': 'sucesso',
            'descricao': 'Projeto excluído com sucesso'
        }}), 200
    try:
        cur.execute('select 1 from projeto_ong where id_projeto = ?', (id_projeto,))
        projeto_ong = cur.fetchone()
        if not projeto_ong:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Projeto não encontrado'
            }})

        cur.execute('select 1 from projeto_ong where id_projeto = ?', (id_projeto,))
        atividade = cur.fetchone()

        if atividade == 1:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Não é possível excluir um post de atividade'
            }})

        if tipo_usuario == 2:
            cur.execute('delete from projeto_ong where ik_projeto = ?', (id_projeto, ))
            con.commit()
            return jsonify({'mensagem': {
                'tipo': 'sucesso',
                'descricao': 'Projeto excluído com sucesso'
            }})

        if tipo_usuario == 1 and id_usuario == id_token :
            cur.execute('delete from projeto_ong where ID_PROJETO = ? and fk_usuario_ong = ? )',
                        (id_projeto, id_usuario))
            con.commit()
            return jsonify({'mensagem': {
                'tipo': 'sucesso',
                'descricao': 'Projeto excluído com sucesso'
            }})
        else:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Você não pode excluir esse projeto, pois é de propriedade de outra pessoa.'
            }})
    except Exception as e:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': f'Erro ao excluir projeto: {e}'
        }}), 500
    finally:
        cur.close()


@app.route('/listar_posts/<int:id_projeto>/<int:pagina>', methods=["GET"])
def listar_posts(id_projeto, pagina):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token de autenticação necessário'
        }}), 401
    cur = con.cursor()

    try:

        cur.execute("""select id_post_projeto, acao, titulo, atividade from post_projeto where fk_projeto = ?""", (id_projeto,))
        resultado = cur.fetchall()

        cur.execute("""select count(id_post_projeto)
                       from post_projeto
                       where fk_projeto = ?""", (id_projeto,))
        quantidade = cur.fetchone()[0]

        numeroPaginas = math.ceil(quantidade / quantidadePorPagina)

        minimo = ((pagina - 1) * quantidadePorPagina) + 1
        maximo = pagina * quantidadePorPagina

        cur.execute("""
                    SELECT id_post_projeto, titulo, acao, atividade, data_hora
                    FROM post_projeto
                    WHERE fk_projeto = ?
                    ORDER BY data_hora DESC ROWS ? TO ?
                    """, (id_projeto, minimo, maximo))
        resultado = cur.fetchall()

        posts = []
        numeroPosts = 1
        for linha in resultado:
            if linha[3] == 1:
                fData = linha[4].strftime("%d/%m/%Y %H:%M:%S")
                posts.append({
                    'numero post': numeroPosts,
                    'id_post': linha[0],
                    'titulo': linha[1],
                    'acao': linha[2],
                    'data_hora': fData
                })
            numeroPosts += 1
            proximaPagina = pagina + 1
            if proximaPagina > numeroPaginas:
                proximaPagina = 0
        return jsonify({'posts': posts, 'numeroPaginas': numeroPaginas, 'proximaPagina': proximaPagina, 'paginaAnterior': pagina - 1}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token expirado'
        }}), 401

    except jwt.InvalidTokenError:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token inválido'
        }}), 401

    except Exception as e:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': f'Erro ao listar posts: {e}'
        }}), 500

    finally:
        if cur:
            cur.close()


@app.route('/excluir_post/<int:id_usuario>/<int:id_projeto>/<int:id_post>', methods=['DELETE'])
def excluir_post(id_usuario, id_projeto, id_post):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token de autenticação necessário'
        }}), 401
    cur = con.cursor()
    dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
    id_token = dados['id_usuario']
    try:
        if id_usuario != id_token:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Você não tem permissão'
            }}), 403

        cur.execute(
            'SELECT tipo_de_usuario FROM usuario WHERE id_usuario = ?',
            (id_token,)
        )
        usuario = cur.fetchone()
        if not usuario:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Usuário não encontrado'
            }}), 404
        tipo_usuario = usuario[0]

        # 2 = admin | 1 = ONG
        if tipo_usuario == 2:
            pass
        elif tipo_usuario == 1 and (id_usuario != id_token):
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Apenas administradores e ONGs podem acessar esta página'
            }}), 403
    except jwt.ExpiredSignatureError:
        return jsonify({'mensagem': {
        'tipo': 'sucesso',
        'descricao': 'Post excluído com sucesso'
    }}), 200
    try:
        cur.execute('select 1 from projeto_ong where id_projeto = ?', (id_projeto,))
        projeto_ong = cur.fetchone()
        if not projeto_ong:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Projeto não encontrado'
            }})

        cur.execute('select atividade from post_projeto where ID_POST_PROJETO = ? and fk_projeto = ?', (id_post, id_projeto))
        post_projeto = cur.fetchone()
        cur.execute('select 1 from projeto_ong where fk_usuario_ong = ? and id_projeto = ?', (id_usuario, id_projeto))
        id_projeto_verificado = cur.fetchone()
        if not post_projeto:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Post não encontrado'
            }})
        elif post_projeto == 1:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Não é possível excluir um post de atividade'
            }})
        if tipo_usuario == 2:
            cur.execute('delete from post_projeto where ID_POST_PROJETO = ? and fk_projeto = ?', (id_post, id_projeto))
            con.commit()
            return jsonify({'mensagem': {
                'tipo': 'sucesso',
                'descricao': 'Post excluído com sucesso'
            }})
        elif id_projeto_verificado:
            if tipo_usuario == 1 and id_usuario == id_token :
                cur.execute('delete from post_projeto where ID_POST_PROJETO = ? and fk_projeto = (select id_projeto from projeto_ong where fk_usuario_ong = ? and id_projeto = ?)',
                    (id_post,id_usuario, id_projeto))
                con.commit()
                return jsonify({'mensagem': {
                    'tipo': 'sucesso',
                    'descricao': 'Post excluído com sucesso'
                }})
        else:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Você não pode excluir esse post, pois é de propriedade de outra pessoa.'
            }})
    except Exception as e:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': f'Erro ao excluir post: {e}'
        }}), 500
    finally:
        cur.close()

@app.route('/ativar_desativar_post/<int:id_usuario>/<int:id_projeto>/<int:id_post>', methods=['PUT'])
def ativar_desativar_post(id_usuario, id_projeto, id_post):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token de autenticação necessário'
        }}), 401
    cur = con.cursor()
    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']
        if id_usuario != id_token:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Você não tem permissão'
            }}), 403

        cur.execute(
            'SELECT tipo_de_usuario FROM usuario WHERE id_usuario = ?',
            (id_token,)
        )
        usuario = cur.fetchone()
        if not usuario:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Usuário não encontrado'
            }}), 404
        tipo_usuario = usuario[0]

        # 2 = admin | 1 = ONG
        if tipo_usuario == 2:
            pass
        elif tipo_usuario == 1 and (id_usuario != id_token):
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Apenas administradores e ONGs podem acessar esta página'
            }}), 403
    except jwt.ExpiredSignatureError:
        return jsonify({'mensagem': {
        'tipo': 'erro',
        'descricao': f'É necessário um token válido para ativar/desativar um post'
    }}), 200
    try:
        if tipo_usuario == 1:
            cur.execute('select 1 from projeto_ong where id_projeto = ? and fk_usuario_ong = ?', (id_projeto, id_usuario))
            projeto_ong = cur.fetchone()[0]
            if not projeto_ong:
                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Projeto não encontrado'
                }})

        elif tipo_usuario == 2:
            cur.execute('select 1 from projeto_ong where id_projeto = ?', (id_projeto, ))
            projeto_ong = cur.fetchone()[0]
            if not projeto_ong:
                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Projeto não encontrado'
                }})

        cur.execute('select atividade from post_projeto where ID_POST_PROJETO = ? and fk_projeto = ?', (id_post, id_projeto))
        post_projeto = cur.fetchone()
        if not post_projeto:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Post não encontrado'
            }})


        nova_atividade = 0 if post_projeto[0] == 1 else 1
        cur.execute('update post_projeto set atividade = ? where ID_POST_PROJETO = ? and fk_projeto = ?', (nova_atividade, id_post, id_projeto))
        con.commit()
        status = 'ativado' if nova_atividade == 1 else 'desativado'
        return jsonify({'mensagem': {
            'tipo': 'sucesso',
            'descricao': f'Post {status} com sucesso'
        }})
    except Exception as e:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': f'Erro ao ativar/desativar post: {e}'
        }}), 500
    finally:
        cur.close()


# @app.route('/li/<int:pagina>/<int:filtro>', methods=['GET'])
# def listar_ong_adm_paginado(pagina, filtro):
#     token = request.cookies.get('access_token')
#     if not token:
#         return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Token de autenticação necessário'}}), 401
#
#     cur = con.cursor()
#     try:
#         dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
#         id_token = dados['id_usuario']
#         cur.execute('select tipo_de_usuario from usuario where id_usuario = ?', (id_token,))
#         usuario = cur.fetchone()
#         if not usuario or usuario[0] != 2:
#             return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Apenas administradores podem acessar esta página'}}), 403
#
#         where_filtro = 'and situacao in (0, 4)' if filtro == 0 else 'and situacao not in (0, 4)'
#         cur.execute(f"""select count(id_usuario)
#                         from usuario
#                         where tipo_de_usuario = 1 {where_filtro}""")
#         quantidade = cur.fetchone()[0]
#         numeroPaginas = math.ceil(quantidade / quantidadePorPagina) if quantidade else 0
#         if pagina < 1:
#             pagina = 1
#         if numeroPaginas and pagina > numeroPaginas:
#             pagina = numeroPaginas
#
#         minimo = ((pagina - 1) * quantidadePorPagina) + 1
#         maximo = pagina * quantidadePorPagina
#         nome = request.args.get('nome', '')
#
#         cur.execute(f"""select id_usuario, nome, descricao_causa, situacao, cpf_cnpj, telefone, data_hora_registro
#                         from usuario
#                         where tipo_de_usuario = 1 {where_filtro}
#                         AND UPPER(nome) LIKE
#                         order by data_hora_registro desc rows ? to ?""", (minimo, maximo))
#         resultado = cur.fetchall()
#         ongs_lista = []
#         for ong in resultado:
#             ongs_lista.append({
#                 'id_usuario': ong[0],
#                 'nome': ong[1],
#                 'descricao_causa': ong[2],
#                 'situacao': ong[3],
#                 'cpf_cnpj': ong[4],
#                 'telefone': ong[5],
#                 'data_hora_registro': ong[6].strftime('%d/%m/%Y %H:%M') if ong[6] else ''
#             })
#
#         proximaPagina = pagina + 1
#         if proximaPagina > numeroPaginas:
#             proximaPagina = 0
#         return jsonify({'mensagem': 'Lista de Ongs', 'ongs': ongs_lista, 'numeroPaginas': numeroPaginas, 'proximaPagina': proximaPagina, 'paginaAnterior': pagina - 1}), 200
#     except Exception as e:
#         return jsonify({'mensagem': {'tipo': 'erro', 'descricao': f'Erro ao listar ONGs: {e}'}}), 500
#     finally:
#         cur.close()


@app.route('/buscar_ong/<int:id_ong>/<int:pagina>', methods=['GET'])
def buscar_ong(id_ong, pagina):
    cur = con.cursor()
    try:

        cur.execute("""select id_usuario, nome, tipo_ong, descricao_causa, cpf_cnpj, telefone, cidade_ong
                       from usuario
                       where id_usuario = ? and tipo_de_usuario = 1""", (id_ong,))
        usuario = cur.fetchone()
        if not usuario:
            return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'ONG não encontrada'}}), 404

        cur.execute("""select count(id_projeto)
                       from projeto_ong
                       where fk_usuario_ong = ?""", (id_ong,))
        quantidade = cur.fetchone()[0]

        numeroPaginas = math.ceil(quantidade / quantidadePorPagina) if quantidade else 0

        minimo = ((pagina - 1) * quantidadePorPagina) + 1
        maximo = pagina * quantidadePorPagina

        cur.execute("""select id_projeto, nome, descricao, atividade
                               from projeto_ong
                               where fk_usuario_ong = ?
                               ORDER BY id_projeto DESC ROWS ? TO ?""", (id_ong, minimo, maximo))
        resultado = cur.fetchall()

        projetos = []
        numeroProjeto = 1
        for linha in resultado:
            projetos.append({
                'numero projeto': numeroProjeto,
                'id_projeto': linha[0],
                'nome': linha[1],
                'descricao': linha[2],
                'atividade': linha[3],
                'imagem': f'/uploads/Usuarios/Projeto/{linha[0]}.jpg'
            })
            numeroProjeto += 1
            
        proximaPagina = pagina + 1
        if proximaPagina > numeroPaginas:
            proximaPagina = 0


        return jsonify({'ong': {
            'id_usuario': usuario[0],
            'nome': usuario[1],
            'instituicao': usuario[2],
            'descricao_causa': usuario[3],
            'cpf_cnpj': usuario[4],
            'telefone': usuario[5],
            'cidade_ong': usuario[6],
            'imagem': f'/uploads/Usuarios/Baner_Ong/{usuario[0]}_banner.jpg',
            'logoInstituicao': f'/uploads/Usuarios/Icone_Perfil/{usuario[0]}.jpg',
            'projetos': projetos,

        },
            'numeroPaginas': numeroPaginas,
            'proximaPagina': proximaPagina,
            'paginaAnterior': pagina - 1
        }), 200
    except Exception as e:
        return jsonify({'mensagem': {'tipo': 'erro', 'descricao': f'Erro ao buscar ONG: {e}'}}), 500
    finally:
        cur.close()


@app.route('/detalhar_projeto/<int:id_projeto>/<int:pagina>', methods=['GET'])
def detalhar_projeto(id_projeto, pagina):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Token de autenticação necessário'}}), 401

    cur = con.cursor()
    try:
        cur.execute("""select p.id_projeto, p.nome, p.descricao, p.meta_doacao, p.atividade,
                              u.id_usuario, u.nome, u.descricao_causa
                       from projeto_ong p
                       join usuario u on u.id_usuario = p.fk_usuario_ong
                       where p.id_projeto = ?""", (id_projeto,))
        info = cur.fetchone()
        if not info:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Projeto não encontrado'
            }}), 404

        cur.execute('select count(id_post_projeto) from post_projeto where fk_projeto = ?', (id_projeto,))
        quantidade = cur.fetchone()[0]
        numeroPaginas = math.ceil(quantidade / quantidadePorPagina) if quantidade else 0
        minimo = ((pagina - 1) * quantidadePorPagina) + 1
        maximo = pagina * quantidadePorPagina

        cur.execute("""select id_post_projeto, titulo, acao, atividade, data_hora
                       from post_projeto
                       where fk_projeto = ?
                       order by data_hora desc rows ? to ?""", (id_projeto, minimo, maximo))
        atualizacoes = []
        for post in cur.fetchall():
            data = post[4]
            atualizacoes.append({
                'id_post': post[0],
                'titulo': post[1],
                'descricao': post[2],
                'acao': post[2],
                'atividade': post[3],
                'data': data.strftime('%d/%m/%Y') if data else '',
                'hora': data.strftime('%H:%M') if data else '',
                'imagem': f'/uploads/Usuarios/Post_Ong/{post[0]}.jpg'
            })

        proximaPagina = pagina + 1
        if proximaPagina > numeroPaginas:
            proximaPagina = 0

        return jsonify({'projeto': {
            'id_projeto': info[0],
            'nome': info[1],
            'descricao_causa': info[2],
            'descricao': info[2],
            'meta_doacao': info[3],
            'atividade': info[4],
            'id_ong': info[5],
            'instituicao': info[6],
            'imagem': f'/uploads/Usuarios/Projeto/{info[0]}.jpg',
            'logoInstituicao': f'/uploads/Usuarios/Icone_Perfil/{info[5]}.jpg',
            'atualizacoes': atualizacoes
        }, 'numeroPaginas': numeroPaginas, 'proximaPagina': proximaPagina, 'paginaAnterior': pagina - 1, 'quantidade':quantidade}), 200
    except Exception as e:
        return jsonify({'mensagem': {'tipo': 'erro', 'descricao': f'Erro ao detalhar projeto: {e}'}}), 500
    finally:
        cur.close()

@app.route('/verificar_token', methods=['GET'])
def verificar_token():
    token = request.cookies.get("access_token")

    if not token:
        return jsonify({
            "mensagem": {
                "tipo": "erro",
                "descricao": "Token não encontrado"
            }
        }), 401

    try:
        info = jwt.decode(
            token,
            senha_secreta,
            algorithms=['HS256']
        )

        return jsonify({
            "mensagem": {
                "tipo": "sucesso",
                "descricao": "Token válido"
            },
            "id_usuario": info["id_usuario"]
        }), 200

    except jwt.ExpiredSignatureError:
        return jsonify({
            "mensagem": {
                "tipo": "erro",
                "descricao": "Token expirado"
            }
        }), 401

    except Exception as e:
        return jsonify({
            "mensagem": {
                "tipo": "erro",
                "descricao": f"Erro ao verificar token: {str(e)}"
            }
        }), 500

@app.route('/permitir_recusar_ong/<int:id_usuario>/<int:id_ong>', methods=['PUT'])
def permitir_recusar_ong(id_usuario, id_ong):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Token de autenticação necessário'}}), 401

    cur = con.cursor()
    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']
        if id_usuario != id_token:
            return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Você não tem permissão'}}), 403

        cur.execute('select tipo_de_usuario from usuario where id_usuario = ?', (id_token,))
        admin = cur.fetchone()
        if not admin or admin[0] != 2:
            return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Você não tem permissão'}}), 403

        data = request.get_json() or {}
        acao = int(data.get('acao')) if data.get('acao') is not None else None
        assunto = data.get('assunto') or 'Análise do cadastro da ONG'
        mensagem = data.get('mensagem') or ''

        cur.execute('select email, situacao, nome from usuario where id_usuario = ? and tipo_de_usuario = 1', (id_ong,))
        ong = cur.fetchone()
        if not ong:
            return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'ONG não encontrada'}}), 404

        email, status_atual, nome_ong = ong
        if status_atual not in (0, 4):
            return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'ONG já foi analisada'}}), 400

        if acao == 1:
            cur.execute('update usuario set situacao = 1 where id_usuario = ?', (id_ong,))
            con.commit()
            try:
                enviando_email(email, 'ONG aprovada', 'Sua ONG foi aprovada. Você já pode utilizar o sistema.', '', nome_ong)
            except Exception:
                pass
            return jsonify({'mensagem': {'tipo': 'sucesso', 'descricao': 'ONG aprovada com sucesso'}}), 200

        if acao == 0:
            if not assunto or not mensagem:
                return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Assunto e motivo são obrigatórios'}}), 400
            cur.execute('update usuario set situacao = 5 where id_usuario = ?', (id_ong,))
            con.commit()
            try:
                enviando_email(email, assunto, mensagem, '', nome_ong)
            except Exception:
                pass
            return jsonify({'mensagem': {'tipo': 'sucesso', 'descricao': 'ONG recusada e email enviado'}}), 200

        return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Ação inválida'}}), 400
    except jwt.ExpiredSignatureError:
        return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Token expirado'}}), 401
    except Exception as e:
        if con:
            con.rollback()
        return jsonify({'mensagem': {'tipo': 'erro', 'descricao': f'Erro ao analisar ONG: {e}'}}), 500
    finally:
        cur.close()

@app.route('/excluir_usuario/<int:id_usuario>/<int:id_ong>', methods=['DELETE'])
def excluir_usuario(id_usuario, id_ong):
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Token de autenticação necessário'}}), 401

    cur = con.cursor()
    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']
        if id_usuario != id_token:
            return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Você não tem permissão'}}), 403

        cur.execute('select tipo_de_usuario from usuario where id_usuario = ?', (id_token,))
        admin = cur.fetchone()
        if not admin or admin[0] != 2:
            return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Você não tem permissão'}}), 403

        cur.execute('select situacao from usuario where id_usuario = ?', (id_ong,))
        situacao = cur.fetchone()[0]

        cur.execute('select id_usuario from usuario where id_usuario = ?', (id_ong,))
        existe = cur.fetchone()

        if not existe:
            return jsonify({
                'mensagem':{
                    'tipo':"erro",
                    "descricao":"Essa Ong não foi encontrada"
                }
            })
        
        if situacao not in [5,2,3]:
            return  jsonify({
                'mensagem':{
                    'tipo':"erro",
                    "descricao":"Essa Ong não pode ser excluida pois não foi recusada ou bloqueada"
                }
            })
        else:
            cur.execute('select id_projeto from projeto_ong where fk_usuario_ong = ?',(id_ong,))
            id_projetos = cur.fetchall()
            if id_projetos:
                for (id_proj,) in id_projetos:
                    cur.execute('delete from post_projeto where fk_projeto = ?', (id_proj,))
                    con.commit()
                    cur.execute('delete from projeto_ong where id_projeto = ?', (id_proj,))
                    con.commit()
                cur.execute('delete from usuario where id_usuario =?', (id_ong,))
                con.commit()
            else:
                cur.execute('delete from usuario where id_usuario =?', (id_ong,))
                con.commit()

            return jsonify({'mensagem': {
                "tipo": "sucesso",
                "descricao": "Ong excluida com sucesso"
            }})

    except Exception as e:
        if con:
            con.rollback()
        return jsonify({'mensagem': {'tipo': 'erro', 'descricao': f'Erro ao Excluir ONG: {e}'}}), 500
    finally:
        cur.close()
