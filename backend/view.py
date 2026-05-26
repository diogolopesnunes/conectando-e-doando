import os.path
from enum import nonmember
from pix import gerar_qrcode_pix

from flask import Flask, jsonify, request, send_file, Response, make_response, send_from_directory
import jwt
from flask_bcrypt import check_password_hash, bcrypt
import math
from funcoes import validar_senha, criptografar, checar_senha, enviando_email, gerar_token, verificar_codigo, email_verificacao, valida_nova_senha, validaCpfCnpj
from main import app, con
from datetime import datetime
import emoji
from fpdf import FPDF

senha_secreta = app.config['SECRET_KEY']

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

quantidadePorPagina = 15

# Se precisar validar uma rota utilizando token no backend
# é preciso rodar o projeto com o link com IP não o localhost
# Se rodar com o localhost NÃO FUNCIONA, o back não pega o token de maneira nenhuma

@app.route('/uploads/<path:filename>')
def arquivos_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/cadastro', methods=['POST', 'GET'])
def cadastro():
    try:
        cur = con.cursor()
        if request.method == 'GET':

            cur.execute("""
                        SELECT id_tipo_ong, nome
                        FROM tipo_ong
                        """)

            tipos = cur.fetchall()

            lista_tipos = []

            for tipo in tipos:
                lista_tipos.append({
                    'id_tipo_ong': tipo[0],
                    'tipo_ong': tipo[1]
                })

            return jsonify(lista_tipos), 200
        else:
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
            chave_pix = request.form.get('chave_pix')
            email_usuario = email
            if not nome or not email or not senha or not cpf_cnpj or not telefone:
                return jsonify({
                    'mensagem': {
                        'tipo': 'erro',
                        'descricao': 'Todos os campos obrigatórios (Nome, Email, Senha, CPF/CNPJ, Telefone) devem ser preenchidos.'
                    }
                }), 400
            if int(tipo_de_usuario) == 0 or int(tipo_de_usuario) == 2:
                cpfValido = validaCpfCnpj(cpf_cnpj)
                if not cpfValido:
                    return jsonify({
                        'mensagem': {
                            'tipo': 'erro',
                            'descricao': 'Insira um cpf valido'
                        }
                    })
            elif int(tipo_de_usuario) == 1:
                cnpjValido = validaCpfCnpj(cpf_cnpj)
                if not cnpjValido:
                    return jsonify({
                        'mensagem': {
                            'tipo': 'erro',
                            'descricao': 'Insira um cnpj valido'
                        }
                    })
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
                                                    telefone, senha_antiga_2, senha_antiga_3, chave_pix)
                               values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null, null, ?) RETURNING id_usuario """,
                            (nome, email, senha_cript, tipo_de_usuario, cpf_cnpj,
                             tipo_ong, descricao_causa, banco_ong, agencia_ong,
                             conta_ong, cidade_ong, telefone, chave_pix))
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



@app.route('/listar_adm_adm/<int:pagina>/<int:aprovacao>', methods=['GET'])
def listar_adm_adm(pagina, aprovacao):
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
                           where tipo_de_usuario = 0
                            and situacao in (0, 4)
                            AND UPPER(nome) LIKE UPPER(?)
                        """, (f"%{nome}%",))
        elif aprovacao == 1:
            cur.execute("""select count(id_usuario)
                           from usuario
                           where tipo_de_usuario = 0 
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
                        SELECT id_usuario, nome, situacao, cpf_cnpj, telefone, data_hora_registro
                        FROM usuario
                        WHERE tipo_de_usuario = 2
                          AND situacao IN (0, 4)
                                  AND UPPER(nome) LIKE UPPER(?)
                        ORDER BY id_usuario DESC ROWS ? TO ?
                        """, (f"%{nome}%", minimo, maximo))
        elif aprovacao == 1:
            cur.execute("""
                        SELECT id_usuario, nome, situacao, cpf_cnpj, telefone, data_hora_registro
                        FROM usuario
                        WHERE tipo_de_usuario = 2
                          AND situacao NOT IN (0, 4)
                          AND UPPER(nome) LIKE UPPER(?)
                        ORDER BY id_usuario DESC ROWS ? TO ?
                        """, (f"%{nome}%", minimo, maximo))
        else:
            return jsonify({'mensagem': {
                "tipo": "erro",
                "descricao": "Filtro de aprovação inválido"
            }}), 400

        adms = cur.fetchall()
        adms_lista = []

        numeroAdm = 1
        for adm in adms:
            adms_lista.append({
                'id_usuario': adm[0],
                'nome': adm[1].upper(),
                'situacao': adm[2],
                'cpf_cnpj': adm[3],
                'telefone': adm[4],
                'data_hora_registro': adm[5].strftime("%d/%m/%Y %H:%M")
            })
            numeroAdm += 1

        proximaPagina = pagina + 1
        if proximaPagina > numeroPaginas:
            proximaPagina = 0

        return jsonify({
            'mensagem':'Lista de Doadores',
            'adms':adms_lista,
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
                    mensagem_secundaria = "Recebemos sua solicitação com sucesso"

                    email_verificacao(destinatario, assunto, mensagem, mensagem_secundaria)

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
                token = gerar_token(id_usuario,)

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
                cur.execute("""select nome, email, telefone, cpf_cnpj, tipo_ong, descricao_causa, banco_ong, agencia_ong, conta_ong, cidade_ong, chave_pix
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
                        'cidade_ong': usuario[9],
                        'chave_pix': usuario[10]
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
            confirmar_senha = request.form.get('confirmar_senha')
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

                mensagem_validacao = validar_senha(senha, confirmar_senha)
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


@app.route('/ativar_desativar_usuario/<int:id_usuario_doador>', methods=['PUT'])
def ativar_desativar_usuario(id_usuario_doador):
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

        data = request.get_json(silent=True) or {}
        mensagem = data.get('mensagem') or ''
        mensagem_secundaria = data.get('mensagem_secundaria') or ''

    except Exception as e:
        return jsonify({'mensagem': {
            "tipo":"erro",
            "descricao":f'Erro ao verificar token {e}'}}), 401

    try:
        cur = con.cursor()

        cur.execute('select id_usuario from usuario where id_usuario= ?', (id_usuario_doador,))

        if not cur.fetchone():
            return jsonify({"mensagem": {
                "tipo":"erro",
                "mensagem":"Usuário não encontrado"}}), 404

        cur.execute('select situacao from usuario where id_usuario =?',(id_usuario_doador,))
        situacao = cur.fetchone()[0]

        cur.execute('select tipo_de_usuario, email, nome  from usuario where id_usuario =?', (id_usuario_doador,))
        info_usuario = cur.fetchone()
        tipo_usuario_select = info_usuario[0]
        email = info_usuario[1]
        nome = info_usuario[2]



        if situacao == 1:
            assunto = 'Conta Bloqueada'

            cur.execute("""update usuario set situacao = 3 where id_usuario = ?""", (id_usuario_doador,))
            con.commit()

            if tipo_usuario_select == 0:
                enviando_email(email,assunto, mensagem, "", nome, "")

            return jsonify({"mensagem": {
                "tipo":"sucesso",
                "descricao":"Usuário desativado com sucesso",
                'id_usuario':id_usuario_doador}})

        if situacao == 3 or situacao == 2:
            assunto = 'Conta Desbloqueada'
            mensagem_email = 'Sua conta foi reativada e pode ser usada novamente'

            cur.execute("""update usuario set situacao = 1 where id_usuario = ?""", (id_usuario_doador,))
            con.commit()
            enviando_email(email,assunto, mensagem_email, "", nome, "")
            return jsonify({"mensagem": {
                "tipo":"sucesso",
                "descricao":"Usuário Ativado com sucesso",
                'id_usuario':id_usuario_doador}})

    except Exception as e:
        return jsonify({'mensagem': {
            "tipo":"erro",
            "descricao":f'Erro ao ativar/desativar usuário {e}'}}), 500
    finally:
        cur.close()


@app.route('/esqueci_minha_senha', methods=['POST'])
def esqueci_minha_senha():
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
                'nome': ong[1].upper(),
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


@app.route('/listar_doador_adm/<int:pagina>/<int:aprovacao>', methods=['GET'])
def listar_doador_adm(pagina, aprovacao):
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
                           where tipo_de_usuario = 0
                            and situacao in (0, 4)
                            AND UPPER(nome) LIKE UPPER(?)
                        """, (f"%{nome}%",))
        elif aprovacao == 1:
            cur.execute("""select count(id_usuario)
                           from usuario
                           where tipo_de_usuario = 0 
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
                        SELECT id_usuario, nome, situacao, cpf_cnpj, telefone, data_hora_registro
                        FROM usuario
                        WHERE tipo_de_usuario = 0
                          AND situacao IN (0, 4)
                                  AND UPPER(nome) LIKE UPPER(?)
                        ORDER BY id_usuario DESC ROWS ? TO ?
                        """, (f"%{nome}%", minimo, maximo))
        elif aprovacao == 1:
            cur.execute("""
                        SELECT id_usuario, nome, situacao, cpf_cnpj, telefone, data_hora_registro
                        FROM usuario
                        WHERE tipo_de_usuario = 0
                          AND situacao NOT IN (0, 4)
                          AND UPPER(nome) LIKE UPPER(?)
                        ORDER BY id_usuario DESC ROWS ? TO ?
                        """, (f"%{nome}%", minimo, maximo))
        else:
            return jsonify({'mensagem': {
                "tipo": "erro",
                "descricao": "Filtro de aprovação inválido"
            }}), 400

        doadores = cur.fetchall()
        doadores_lista = []

        numeroDoador = 1
        for doador in doadores:
            doadores_lista.append({
                'id_usuario': doador[0],
                'nome': doador[1].upper(),
                'situacao': doador[2],
                'cpf_cnpj': doador[3],
                'telefone': doador[4],
                'data_hora_registro': doador[5].strftime("%d/%m/%Y %H:%M")
            })
            numeroDoador += 1

        proximaPagina = pagina + 1
        if proximaPagina > numeroPaginas:
            proximaPagina = 0

        return jsonify({
            'mensagem':'Lista de Doadores',
            'doadores':doadores_lista,
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

        if tipo_usuario == 2:
            pass

        elif id_usuario != id_token:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao':'Você não tem permissão'}}), 403

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
            print(meta_doacao)
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

        if tipo_usuario == 2:
            pass
        elif tipo_usuario == 1 and id_token != id_usuario:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Você não tem permissão'
            }}), 403
        #  1 = ONG (ajuste se necessário)
        if tipo_usuario not in (1, 2):
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Apenas por ONGs ou ADMs podem acessar esta página'
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
    try:
        titulo = request.form.get('titulo')
        acao = request.form.get('acao')
        atividade = request.form.get('atividade', 1)
        imagem = request.files.get('imagem')
        cur.execute("""select fk_usuario_ong 
                       from projeto_ong
                       where id_projeto = ?""", (id_projeto,))
        idOngProjeto = cur.fetchone()[0]

        if usuario[0] == 1:
            if idOngProjeto != id_token:
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
            if tipo_de_usuario == 2:
                cur.execute("""
                            UPDATE PROJETO_ONG
                            SET NOME        =?,
                                DESCRICAO   = ?,
                                META_DOACAO = ?
                            WHERE ID_PROJETO = ?

                            """, (nome.strip(), descricao.strip(), meta_doacao, id_projeto))
            elif tipo_de_usuario == 1:
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

        cur.execute('select atividade from post_projeto where fk_projeto =  ?', (id_projeto,))
        atividade_post = cur.fetchone()
        if atividade_post:
            if atividade_post[0] == 1:
                cur.execute('update post_projeto set atividade = 2 where fk_PROJETO = ? and atividade = 1', (id_projeto,))
            else:
                cur.execute('update post_projeto set atividade = 1 where fk_PROJETO = ? and atividade = 2', (id_projeto,))
        cur.execute('update projeto_ong set atividade = ? where ID_PROJETO = ?', (nova_atividade, id_projeto))
        con.commit()

        status = 'ativado' if nova_atividade == 1 else 'desativado'
        return jsonify({'mensagem': {
            'tipo': 'sucesso',
            'descricao': f'Projeto {status} com sucesso'
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
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Token necessário'
            }
        }), 401

    cur = con.cursor()
    try:
        # Decodifica o token
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados['id_usuario']

        # Verifica o tipo do usuário logado
        cur.execute(
            'SELECT tipo_de_usuario FROM usuario WHERE id_usuario = ?',
            (id_token,)
        )
        tipo = cur.fetchone()
        tipo_usuario_logado = tipo[0] if tipo else None

        # Permissões
        e_dono = (id_token == id_usuario)
        e_admin = (tipo_usuario_logado == 2)

        if not (e_dono or e_admin):
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Sem permissão'
                }
            }), 403

        # Verifica se o projeto existe
        cur.execute(
            'SELECT 1 FROM projeto_ong WHERE id_projeto = ?',
            (id_projeto,)
        )
        if not cur.fetchone():
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Projeto não encontrado'
                }
            }), 404

        # Busca todos os posts vinculados ao projeto
        cur.execute(
            'SELECT id_post_projeto FROM post_projeto WHERE fk_projeto = ?',
            (id_projeto,)
        )
        posts = cur.fetchall()

        # Exclui mensagens e curtidas de todos os posts do projeto
        for post in posts:
            id_post = post[0]

            cur.execute(
                'DELETE FROM mensagens_postagem WHERE fk_post = ?',
                (id_post,)
            )
            cur.execute(
                'DELETE FROM curtidas_postagem WHERE fk_post = ?',
                (id_post,)
            )

        # Exclui os posts do projeto
        cur.execute(
            'DELETE FROM post_projeto WHERE fk_projeto = ?',
            (id_projeto,)
        )

        # Exclui o projeto
        if e_admin:
            cur.execute(
                'DELETE FROM projeto_ong WHERE id_projeto = ?',
                (id_projeto,)
            )
        else:
            cur.execute(
                'DELETE FROM projeto_ong '
                'WHERE id_projeto = ? AND fk_usuario_ong = ?',
                (id_projeto, id_token)
            )

        con.commit()

        return jsonify({
            'mensagem': {
                'tipo': 'sucesso',
                'descricao': 'Projeto excluído com sucesso'
            }
        }), 200

    except Exception as e:
        con.rollback()
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': f'Erro: {e}'
            }
        }), 500

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
        elif post_projeto[0] == 1:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Não é possível excluir um post ativo'
            }})
        if tipo_usuario == 2:
            cur.execute('delete from mensagens_postagem where fk_post =?', (id_post,))
            cur.execute('delete from curtidas_postagem where fk_post =?', (id_post,))
            cur.execute('delete from post_projeto where ID_POST_PROJETO = ? and fk_projeto = ?', (id_post, id_projeto))
            con.commit()
            return jsonify({'mensagem': {
                'tipo': 'sucesso',
                'descricao': 'Post excluído com sucesso'
            }})
        elif id_projeto_verificado:
            if tipo_usuario == 1 and id_usuario == id_token :
                cur.execute('delete from mensagens_postagem where id_post_projeto =?',(id_post,))
                cur.execute('delete from curtidas_postagem where id_post_projeto =?',(id_post,))
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
        elif tipo_usuario == 0:
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

@app.route('/buscar_ong/<int:id_ong>/<int:pagina>', methods=['GET'])
def buscar_ong(id_ong, pagina):
    cur = con.cursor()

    try:
        token = request.cookies.get('access_token')
        id_usuario_logado = None

        if token:
            try:
                dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
                id_usuario_logado = dados['id_usuario']
            except Exception:
                id_usuario_logado = None

        cur.execute("""
            SELECT id_usuario,
                   nome,
                   tipo_ong,
                   descricao_causa,
                   cpf_cnpj,
                   telefone,
                   cidade_ong
            FROM usuario
            WHERE id_usuario = ?
              AND tipo_de_usuario = 1
        """, (id_ong,))

        usuario = cur.fetchone()

        if not usuario:
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'ONG não encontrada'
                }
            }), 404

        cur.execute("""select nome from tipo_ong where id_tipo_ong = ?""", (usuario[2],))
        tipo_ong = cur.fetchone()[0]

        # Verifica se o usuário logado segue a ONG
        seguindo = False
        if id_usuario_logado:
            cur.execute("""
                SELECT id_seguidores
                FROM seguidores
                WHERE fk_usuario_ong = ?
                  AND fk_usuario_doador = ?
            """, (id_ong, id_usuario_logado))

            segue = cur.fetchone()

            seguindo = True if segue else False

        # Quantidade de projetos
        cur.execute("""
            SELECT COUNT(id_projeto)
            FROM projeto_ong
            WHERE fk_usuario_ong = ?
        """, (id_ong,))

        quantidade = cur.fetchone()[0]

        numeroPaginas = (
            math.ceil(quantidade / quantidadePorPagina)
            if quantidade else 0
        )

        minimo = ((pagina - 1) * quantidadePorPagina) + 1
        maximo = pagina * quantidadePorPagina

        # Busca projetos
        cur.execute("""
            SELECT id_projeto,
                   nome,
                   descricao,
                   atividade
            FROM projeto_ong
            WHERE fk_usuario_ong = ?
            ORDER BY id_projeto DESC
            ROWS ? TO ?
        """, (id_ong, minimo, maximo))

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
        return jsonify({
            'ong': {
                'id_ong': usuario[0],
                'id_usuario': usuario[0],
                'nome': usuario[1],
                'instituicao': tipo_ong.capitalize(),
                'descricao_causa': usuario[3],
                'cpf_cnpj': usuario[4],
                'telefone': usuario[5],
                'cidade_ong': usuario[6],

                # IMPORTANTE
                'seguindo': seguindo,

                'imagem': f'/uploads/Usuarios/Baner_Ong/{usuario[0]}_banner.jpg',

                'logoInstituicao': f'/uploads/Usuarios/Icone_Perfil/{usuario[0]}.jpg',

                'projetos': projetos,
            },

            'numeroPaginas': numeroPaginas,
            'proximaPagina': proximaPagina,
            'paginaAnterior': pagina - 1
        }), 200

    except Exception as e:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': f'Erro ao buscar ONG: {e}'
            }
        }), 500

    finally:
        cur.close()


@app.route('/detalhar_projeto/<int:id_projeto>/<int:pagina>', methods=['GET'])
def detalhar_projeto(id_projeto, pagina):

    token = request.cookies.get('access_token')

    if not token:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Token de autenticação necessário'
            }
        }), 401

    cur = con.cursor()

    try:
        id_usuario_logado = None
        try:

            payload = jwt.decode(
                token,
                senha_secreta,
                algorithms=["HS256"]
            )

            id_usuario_logado = payload.get('id_usuario')

        except Exception:

            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Token inválido'
                }
            }), 401

        cur.execute("""
            SELECT p.id_projeto,
                   p.nome,
                   p.descricao,
                   p.meta_doacao,
                   p.atividade,
                   p.fk_usuario_ong,
                   u.nome,
                   u.descricao_causa
            FROM projeto_ong p
            JOIN usuario u
                ON u.id_usuario = p.fk_usuario_ong
            WHERE p.id_projeto = ?
        """, (id_projeto,))

        info = cur.fetchone()

        if not info:

            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Projeto não encontrado'
                }
            }), 404

        seguindo = False

        if id_usuario_logado:

            cur.execute("""
                SELECT id_seguidores
                FROM seguidores
                WHERE fk_usuario_doador = ?
                  AND fk_usuario_ong = ?
            """, (id_usuario_logado, info[5]))

            segue = cur.fetchone()

            seguindo = True if segue else False

        cur.execute("""
            SELECT COUNT(id_post_projeto)
            FROM post_projeto
            WHERE fk_projeto = ?
        """, (id_projeto,))

        quantidade = cur.fetchone()[0]

        numeroPaginas = (math.ceil(quantidade / quantidadePorPagina)if quantidade else 0)

        minimo = (((pagina - 1) * quantidadePorPagina) + 1)

        maximo = pagina * quantidadePorPagina

        cur.execute("""
            SELECT id_post_projeto,
                   titulo,
                   acao,
                   atividade,
                   data_hora
            FROM post_projeto
            WHERE fk_projeto = ?
            ORDER BY data_hora DESC
            ROWS ? TO ?
        """, (id_projeto, minimo, maximo))

        atualizacoes = []

        posts = cur.fetchall()

        for post in posts:
            data = post[4]

            # quantidade de curtidas
            cur.execute("""
                        SELECT COUNT(id_curtidas)
                        FROM curtidas_postagem
                        WHERE fk_post = ?
                          AND situacao_curtida = 1
                        """, (post[0],))

            quantidade_curtidas = cur.fetchone()[0]

            # verifica se usuário curtiu
            cur.execute("""
                        SELECT id_curtidas
                        FROM curtidas_postagem
                        WHERE fk_post = ?
                          AND fk_usuario_doador = ?
                          AND situacao_curtida = 1
                        """, (post[0], id_usuario_logado))

            curtido = True if cur.fetchone() else False

            atualizacoes.append({
                'id_post': post[0],
                'titulo': post[1],
                'descricao': post[2],
                'acao': post[2],
                'atividade': post[3],
                'quantidade': quantidade_curtidas,
                'curtido': curtido,
                'data': data.strftime('%d/%m/%Y') if data else '',
                'hora': data.strftime('%H:%M') if data else '',
                'imagem': f'/uploads/Usuarios/Post_Ong/{post[0]}.jpg'
            })

        proximaPagina = pagina + 1
        if proximaPagina > numeroPaginas:
            proximaPagina = 0

        cur.execute("""
                    SELECT CAST(COALESCE(SUM(valor_doador), 0) AS DOUBLE PRECISION)
                    FROM doacoes
                    WHERE fk_projeto = ?
                    """, (id_projeto,))

        resultado = cur.fetchone()

        total_doado = 0

        if resultado and resultado[0] is not None:
            total_doado = float(resultado[0])

        return jsonify({
            'projeto': {
                'id_projeto': info[0],
                'nome': info[1],
                'descricao_causa': info[2],
                'descricao': info[2],
                'meta_doacao': info[3],
                'valor_arrecadado': total_doado,
                'atividade': info[4],
                'id_ong': info[5],
                'instituicao': info[6],
                'seguindo': seguindo,
                'imagem': (f'/uploads/Usuarios/Projeto/{info[0]}.jpg'),
                'logoInstituicao': (f'/uploads/Usuarios/Icone_Perfil/{info[5]}.jpg'),
                'atualizacoes': atualizacoes
            },
            'numeroPaginas': numeroPaginas,
            'proximaPagina': proximaPagina,
            'paginaAnterior': pagina - 1,
            'quantidade': quantidade
        }), 200

    except Exception as e:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': (
                    f'Erro ao detalhar projeto: {e}'
                )
            }

        }), 500

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
                enviando_email(email, 'ONG aprovada', 'Sua ONG foi aprovada. Você já pode utilizar o sistema.', '', nome_ong, '')
            except Exception:
                pass
            return jsonify({'mensagem': {'tipo': 'sucesso', 'descricao': 'ONG aprovada com sucesso'}}), 200

        if acao == 0:
            cur.execute('update usuario set situacao = 5 where id_usuario = ?', (id_ong,))
            con.commit()
            try:
                enviando_email(email, "Sua Ong foi recusada", mensagem, '', nome_ong, '')
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


@app.route('/excluir_usuario/<int:id_usuario>/<int:id_excluir>', methods=['DELETE'])
def excluir_usuario(id_usuario, id_excluir):
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

        cur.execute('select id_usuario from usuario where id_usuario = ?', (id_excluir,))
        existe = cur.fetchone()

        if not existe:
            return jsonify({
                'mensagem':{
                    'tipo':"erro",
                    "descricao":"Esse Usuario não foi encontrada"
                }
            })

        cur.execute('select situacao from usuario where id_usuario = ?', (id_excluir,))
        situacao = cur.fetchone()[0]

        cur.execute('select TIPO_DE_USUARIO from usuario where id_usuario = ?',(id_excluir,))
        tipo_excluir = cur.fetchone()[0]

        if tipo_excluir == 1:
            if situacao not in [5,2,3]:
                return  jsonify({
                    'mensagem':{
                        'tipo':"erro",
                        "descricao":"Essa Ong não pode ser excluida pois não foi recusada ou bloqueada"
                    }
                })

            cur.execute('delete from usuario where id_usuario =?', (id_excluir,))
            con.commit()

            return jsonify({'mensagem': {
                "tipo": "sucesso",
                "descricao": "Ong excluida com sucesso"
            }})
        else:
            if situacao not in [2,3]:
                return jsonify({
                    'mensagem': {
                        'tipo': "erro",
                        "descricao": "Esse Doador não pode ser excluida pois não foi bloqueado"
                    }
                })
            else:
                cur.execute('delete from usuario where id_usuario =?', (id_excluir,))
                con.commit()

                return jsonify({'mensagem': {
                    "tipo":"sucesso",
                    "descricao":'Doador deletado com sucesso'
                }})

    except Exception as e:
        con.rollback()

        erro_texto = str(e)

        if (
                'FK_SEG_ONG' in erro_texto
                or 'SEGUIDORES' in erro_texto
                or 'FOREIGN KEY' in erro_texto
                or '-530' in erro_texto
                or '335544466' in erro_texto
        ):
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Não é possível excluir esse usuário, pois ele está vinculado a outros registros do sistema.'
                }
            }), 400

        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': f'Ocorreu um erro ao tentar excluir: {e}'
            }
        }), 500

    finally:
        cur.close()

@app.route('/pagina_feed/<int:pagina>', methods=['GET'])
def pagina_feed(pagina):
    token = request.cookies.get('access_token')
    cur = con.cursor()

    id_usuario = None

    if token:
        try:
            dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
            id_usuario = dados['id_usuario']
        except jwt.InvalidTokenError:

            id_usuario = None

    try:
        nome = request.args.get('nome', '')
        ong = request.args.get('ong', '')
        tema = request.args.get('tema', '')
        data = request.args.get('data', '')
        ordem = request.args.get('ordem', 'desc').lower()

        if ordem not in ['asc', 'desc']:
            ordem = 'desc'

        limite = 4
        minimo = ((pagina - 1) * limite) + 1
        maximo = pagina * limite
        if maximo == 0:
            maximo = 1


        id_usuario_consulta = id_usuario if id_usuario is not None else 0

        selectBase = """
                     SELECT
                         p.id_post_projeto,
                         p.titulo,
                         p.acao,
                         p.data_hora,
                         u.nome,
                         pr.id_projeto,
                         u.tipo_ong,
                         u.id_usuario,
                         COALESCE(c.SITUACAO_CURTIDA, 0) AS curtido,
                         CASE
                             WHEN EXISTS (
                                 SELECT 1
                                 FROM seguidores s
                                 WHERE s.FK_USUARIO_DOADOR = ?
                                   AND s.FK_USUARIO_ONG = u.id_usuario
                             ) THEN 1
                             ELSE 0
                             END AS seguindo
                     FROM post_projeto p
                              JOIN projeto_ong pr ON p.fk_projeto = pr.id_projeto
                              JOIN usuario u ON pr.FK_USUARIO_ONG = u.id_usuario
                              LEFT JOIN CURTIDAS_POSTAGEM c
                                        ON c.FK_POST = p.id_post_projeto
                                            AND c.FK_USUARIO_DOADOR = ?
                     WHERE p.atividade = 1 \
                     """

        filtros = [id_usuario_consulta, id_usuario_consulta]

        if nome:
            selectBase += " AND UPPER(p.titulo) LIKE UPPER(?)"
            filtros.append(f"%{nome}%")

        if ong:
            selectBase += " AND UPPER(u.nome) LIKE UPPER(?)"
            filtros.append(f"%{ong}%")

        if tema:
            selectBase += " AND u.tipo_ong = ?"
            filtros.append(tema)

        if data:
            selectBase += " AND CAST(p.data_hora AS DATE) = ?"
            filtros.append(data)

        selectBase += f"""
            ORDER BY p.data_hora {ordem}, p.id_post_projeto {ordem}
            ROWS {minimo} TO {maximo}
        """

        cur.execute(selectBase, tuple(filtros))
        posts_db = cur.fetchall()

        posts = []
        for p in posts_db:
            cur.execute("""
                        SELECT COUNT(*)
                        FROM curtidas_postagem
                        WHERE FK_POST = ? AND SITUACAO_CURTIDA = 1
                        """, (p[0],))
            total_curtidas = cur.fetchone()[0]

            # Total de comentários
            cur.execute("""
                        SELECT COUNT(*)
                        FROM mensagens_postagem
                        WHERE FK_POST = ?
                        """, (p[0],))
            total_comentarios = cur.fetchone()[0]

            posts.append({
                'id_post': p[0],
                'titulo': p[1],
                'acao': p[2],
                'data_hora': p[3].strftime("%d/%m/%Y %H:%M"),
                'ong_nome': p[4],
                'id_projeto': p[5],
                'tema': p[6],
                'id_ong': p[7],
                'curtido': bool(p[8]),       # False se não estiver logado
                'seguindo': bool(p[9]),      # False se não estiver logado
                'total_curtidas': total_curtidas,
                'total_comentarios': total_comentarios,
                'imagem_icone_ong': f'/uploads/Usuarios/Icone_Perfil/{p[7]}.jpg',
                'imagem_icone_post': f'/uploads/Usuarios/Post_Ong/{p[0]}.jpg'
            })

        # Se não estiver logado, não retorna listas personalizadas
        ongs_seguidas = []
        novas_ongs = []

        if id_usuario is not None:
            cur.execute("""
                        SELECT u.id_usuario, u.nome, u.tipo_ong
                        FROM seguidores s
                                 JOIN usuario u ON s.FK_USUARIO_ONG = u.id_usuario
                        WHERE s.FK_USUARIO_DOADOR = ?
                        """, (id_usuario,))

            ongs_seguidas = [{
                'id': o[0],
                'nome': o[1],
                'tema': o[2],
                'imagem': f'/uploads/Usuarios/Icone_Perfil/{o[0]}.jpg'
            } for o in cur.fetchall()]

        pagina_novas_ongs = int(request.args.get('paginaNovasOngs', 1))
        quantidadePorPaginaNovasOngs = 3

        addSelect = """"""
        parametros = []
        if id_usuario:
            addSelect += """ AND id_usuario NOT IN (SELECT FK_USUARIO_ONG
                                                 FROM seguidores
                                                 WHERE FK_USUARIO_DOADOR = ?)"""
            parametros.append(id_usuario)
        if nome:
            addSelect += """ AND UPPER(nome) LIKE '%' || UPPER(?) || '%'"""
            parametros.append(nome)
        if tema:
            addSelect += " AND tipo_ong = ?"
            parametros.append(tema)


        cur.execute(f"""SELECT COUNT(id_usuario)
                        FROM usuario
                        WHERE tipo_de_usuario = 1
                          AND situacao = 1
                          {addSelect}
                    """, tuple(parametros))
        quantidade = cur.fetchone()
        if quantidade:
            quantidade = quantidade[0]
        else:
            quantidade = 0

        numeroPaginasNovasOngs = math.ceil(
            quantidade / quantidadePorPaginaNovasOngs
        )

        minimoNovasOngs = ((pagina_novas_ongs - 1) * quantidadePorPaginaNovasOngs) + 1
        maximoNovasOngs = pagina_novas_ongs * quantidadePorPaginaNovasOngs
        if maximoNovasOngs == 0:
            maximoNovasOngs = 1


        addSelect = """"""
        parametros = []
        if id_usuario:
            addSelect += """ AND id_usuario NOT IN (SELECT FK_USUARIO_ONG
                                                     FROM seguidores
                                                     WHERE FK_USUARIO_DOADOR = ?)"""
            parametros.append(id_usuario)
        if nome:
            addSelect += """ AND UPPER(nome) LIKE '%' || UPPER(?) || '%'"""
            parametros.append(nome)
        if tema:
            addSelect += " AND tipo_ong = ?"
            parametros.append(tema)
        addSelect += f""" ORDER BY data_hora_registro {ordem}"""

        parametros.append(minimoNovasOngs)
        parametros.append(maximoNovasOngs)


        cur.execute(f"""
                    SELECT id_usuario, nome, tipo_ong, descricao_causa
                    FROM usuario
                    WHERE tipo_de_usuario = 1
                      AND situacao = 1
                        {addSelect}
                    ROWS ? TO ?
                    """, tuple(parametros))

        novas_ongs = [{
            'id': o[0],
            'nome': o[1],
            'tema': o[2],
            'imagemPerfilOng': f'/uploads/Usuarios/Icone_Perfil/{o[0]}.jpg',
            'bannerOng': f'/uploads/Usuarios/Baner_ong/{o[0]}_banner.jpg',
            'descricao': o[3]
        } for o in cur.fetchall()]

        proximaPaginaNovasOngs = pagina_novas_ongs + 1 if pagina_novas_ongs+1 <= numeroPaginasNovasOngs else 0
        paginaAnteriorNovasOngs = pagina_novas_ongs - 1 if pagina_novas_ongs > 1 else 0

        proximaPagina = pagina + 1 if len(posts) > 0 else 0
        paginaAnterior = pagina - 1 if pagina > 1 else 0

        return jsonify({
            'posts': posts,
            'ongs_seguidas': ongs_seguidas,
            'novas_ongs': novas_ongs,
            'proximaPagina': proximaPagina,
            'paginaAnterior': paginaAnterior,
            'quantidadeNovasOngs': quantidade,
            'numeroPaginasNovasOngs': numeroPaginasNovasOngs,
            'proximaPaginaNovasOngs': proximaPaginaNovasOngs,
            'paginaAnteriorNovasOngs': paginaAnteriorNovasOngs,
            'logado': id_usuario is not None
        }), 200

    except Exception as e:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': f'Erro no feed: {e}'
            }
        }), 500

    finally:
        if cur:
            cur.close()


@app.route('/pagina_feed_favoritas/<int:pagina>', methods=['GET'])
def pagina_feed_favoritas(pagina):
    token = request.cookies.get('access_token')
    cur = None


    if not token:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Token necessário'
            }
        }), 401

    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_usuario = dados['id_usuario']

        cur = con.cursor()

        nome = request.args.get('nome', '')
        ong = request.args.get('ong', '')
        tema = request.args.get('tema', '')
        data = request.args.get('data', '')
        ordem = request.args.get('ordem', 'desc').lower()

        if ordem == 'asc':
            ordem_sql = 'ASC'
        else:
            ordem_sql = 'DESC'

        limite = 4
        minimo = ((pagina - 1) * limite) + 1
        maximo = pagina * limite

        selectBase = """
            SELECT
                p.id_post_projeto,
                p.titulo,
                p.acao,
                p.data_hora,
                u.nome,
                pr.id_projeto,
                u.tipo_ong,
                u.id_usuario,
                COALESCE(c.SITUACAO_CURTIDA, 0) AS curtido,
                1 AS seguindo
            FROM post_projeto p
                JOIN projeto_ong pr
                    ON p.fk_projeto = pr.id_projeto
                JOIN usuario u
                    ON pr.FK_USUARIO_ONG = u.id_usuario
                JOIN seguidores s
                    ON s.FK_USUARIO_ONG = u.id_usuario
                LEFT JOIN CURTIDAS_POSTAGEM c
                    ON c.FK_POST = p.id_post_projeto
                   AND c.FK_USUARIO_DOADOR = ?
            WHERE p.atividade = 1
              AND s.FK_USUARIO_DOADOR = ?
        """

        filtros = [id_usuario, id_usuario]

        if nome:
            selectBase += " AND UPPER(p.titulo) LIKE UPPER(?)"
            filtros.append(f"%{nome}%")

        if ong:
            selectBase += " AND UPPER(u.nome) LIKE UPPER(?)"
            filtros.append(f"%{ong}%")

        if tema:
            selectBase += " AND u.tipo_ong = ?"
            filtros.append(tema)

        if data:
            selectBase += " AND CAST(p.data_hora AS DATE) = ?"
            filtros.append(data)

        selectBase += f"""
            ORDER BY p.data_hora {ordem_sql}, p.id_post_projeto {ordem_sql}
            ROWS {minimo} TO {maximo}
        """

        cur.execute(selectBase, tuple(filtros))
        posts_db = cur.fetchall()

        posts = []
        for p in posts_db:
            cur.execute("""
                SELECT COUNT(*)
                FROM curtidas_postagem
                WHERE FK_POST = ?
                  AND SITUACAO_CURTIDA = 1
            """, (p[0],))
            total_curtidas = cur.fetchone()[0]

            # Total de comentários
            cur.execute("""
                SELECT COUNT(*)
                FROM mensagens_postagem
                WHERE FK_POST = ?
            """, (p[0],))
            total_comentarios = cur.fetchone()[0]

            posts.append({
                'id_post': p[0],
                'titulo': p[1],
                'acao': p[2],
                'data_hora': p[3].strftime("%d/%m/%Y %H:%M"),
                'ong_nome': p[4],
                'id_projeto': p[5],
                'tema': p[6],
                'id_ong': p[7],
                'curtido': bool(p[8]),
                'seguindo': True,  # sempre True porque este feed mostra apenas ONGs seguidas
                'total_curtidas': total_curtidas,
                'total_comentarios': total_comentarios,
                'imagem_icone_ong': f'/uploads/Usuarios/Icone_Perfil/{p[7]}.jpg',
                'imagem_icone_post': f'/uploads/Usuarios/Post_Ong/{p[0]}.jpg'
            })

        cur.execute("""
            SELECT u.id_usuario, u.nome, u.tipo_ong
            FROM seguidores s
                JOIN usuario u
                    ON s.FK_USUARIO_ONG = u.id_usuario
            WHERE s.FK_USUARIO_DOADOR = ?
        """, (id_usuario,))

        ongs_seguidas = [{
            'id': o[0],
            'nome': o[1],
            'tema': o[2],
            'imagem': f'/uploads/Usuarios/Icone_Perfil/{o[0]}.jpg'
        } for o in cur.fetchall()]

        pagina_novas_ongs = int(request.args.get('paginaNovasOngs', 1))
        quantidadePorPaginaNovasOngs = 3

        addSelect = """ AND id_usuario NOT IN (SELECT FK_USUARIO_ONG
                                                         FROM seguidores
                                                         WHERE FK_USUARIO_DOADOR = ?)"""
        parametros = [id_usuario]
        if nome:
            addSelect += """ AND UPPER(nome) LIKE '%' || UPPER(?) || '%'"""
            parametros.append(nome)
        if tema:
            addSelect += """ AND tipo_ong = ?"""
            parametros.append(tema)

        cur.execute(f"""SELECT COUNT(id_usuario)
                                FROM usuario
                                WHERE tipo_de_usuario = 1
                                  AND situacao = 1
                                  {addSelect}
                            """, tuple(parametros))
        quantidade = cur.fetchone()
        if quantidade:
            quantidade = quantidade[0]
        else:
            quantidade = 0

        numeroPaginasNovasOngs = math.ceil(
            quantidade / quantidadePorPaginaNovasOngs
        )

        minimoNovasOngs = ((pagina_novas_ongs - 1) * quantidadePorPaginaNovasOngs) + 1
        maximoNovasOngs = pagina_novas_ongs * quantidadePorPaginaNovasOngs

        addSelect = """ AND id_usuario NOT IN (SELECT FK_USUARIO_ONG
                                                                 FROM seguidores
                                                                 WHERE FK_USUARIO_DOADOR = ?)"""
        parametros = [id_usuario]
        if nome:
            addSelect += """ AND UPPER(nome) LIKE '%' || UPPER(?) || '%'"""
            parametros.append(nome)
        if tema:
            addSelect += """ AND tipo_ong = ?"""
            parametros.append(tema)
        parametros.append(minimoNovasOngs)
        parametros.append(maximoNovasOngs)

        addSelect += f""" ORDER BY data_hora_registro {ordem}"""

        cur.execute(f"""
                            SELECT id_usuario, nome, tipo_ong, descricao_causa
                            FROM usuario
                            WHERE tipo_de_usuario = 1
                              AND situacao = 1
                                {addSelect}
                            ROWS ? TO ?
                            """, tuple(parametros))

        novas_ongs = [{
            'id': o[0],
            'nome': o[1],
            'tema': o[2],
            'imagemPerfilOng': f'/uploads/Usuarios/Icone_Perfil/{o[0]}.jpg',
            'bannerOng': f'/uploads/Usuarios/Baner_ong/{o[0]}_banner.jpg',
            'descricao': o[3]
        } for o in cur.fetchall()]

        proximaPaginaNovasOngs = pagina_novas_ongs + 1 if pagina_novas_ongs + 1 <= numeroPaginasNovasOngs else 0
        paginaAnteriorNovasOngs = pagina_novas_ongs - 1 if pagina_novas_ongs > 1 else 0


        proximaPagina = pagina + 1 if len(posts) > 0 else 0
        paginaAnterior = pagina - 1 if pagina > 1 else 0

        return jsonify({
            'posts': posts,
            'ongs_seguidas': ongs_seguidas,
            'novas_ongs': novas_ongs,
            'proximaPagina': proximaPagina,
            'paginaAnterior': paginaAnterior,
            'logado': True,
            'favoritadas': True,
            'quantidadeNovasOngs': quantidade,
            'numeroPaginasNovasOngs': numeroPaginasNovasOngs,
            'proximaPaginaNovasOngs': proximaPaginaNovasOngs,
            'paginaAnteriorNovasOngs': paginaAnteriorNovasOngs
        }), 200


    except jwt.ExpiredSignatureError:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Token expirado'
            }
        }), 401

    except jwt.InvalidTokenError:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Token inválido'
            }
        }), 401

    except Exception as e:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': f'Erro no feed de favoritas: {e}'
            }
        }), 500

    finally:
        if cur:
            cur.close()

@app.route('/deseguir_seguir_ong/<int:id_ong>', methods=['POST'])
def deseguir_seguir_ong(id_ong):
    token = request.cookies.get('access_token')

    if not token:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'É necessário estar logado para seguir uma ONG'
            }
        }), 401

    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_usuario = dados['id_usuario']

        cur = con.cursor()

        if id_usuario == id_ong:
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Você não pode seguir a si mesmo'
                }
            }), 400

        cur.execute("""
            SELECT tipo_de_usuario
            FROM usuario
            WHERE id_usuario = ?
        """, (id_ong,))
        resultado = cur.fetchone()

        if not resultado:
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'ONG não encontrada'
                }
            }), 404

        if resultado[0] != 1:
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Só é possível seguir ONGs'
                }
            }), 400

        cur.execute("""
            SELECT ID_SEGUIDORES
            FROM seguidores
            WHERE FK_USUARIO_DOADOR = ? AND FK_USUARIO_ONG = ?
        """, (id_usuario, id_ong))

        ja_segue = cur.fetchone()

        if ja_segue:
            cur.execute("""
                DELETE FROM seguidores
                WHERE FK_USUARIO_DOADOR = ? AND FK_USUARIO_ONG = ?
            """, (id_usuario, id_ong))

            con.commit()

            return jsonify({
                'mensagem': {
                    'tipo': 'sucesso',
                    'descricao': 'Você deixou de seguir a ONG'
                },
                'seguindo': False
            }), 200

        else:
            cur.execute("""
                INSERT INTO seguidores (FK_USUARIO_DOADOR, FK_USUARIO_ONG)
                VALUES (?, ?)
            """, (id_usuario, id_ong))

            con.commit()

            return jsonify({
                'mensagem': {
                    'tipo': 'sucesso',
                    'descricao': 'Agora você segue a ONG'
                },
                'seguindo': True
            }), 201

    except jwt.ExpiredSignatureError:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Sua sessão expirou. Faça login novamente.'
            }
        }), 401

    except jwt.InvalidTokenError:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Token inválido. Faça login novamente.'
            }
        }), 401

    except Exception as e:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': f'Erro: {e}'
            }
        }), 500

    finally:
        if 'cur' in locals():
            cur.close()

@app.route('/descurtir_curtir_post/<int:id_post>', methods=['POST'])
def descurtir_curtir_post(id_post):
    token = request.cookies.get('access_token')

    if not token:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'É necessário estar logado para curtir uma postagem'
            }
        }), 401

    try:
        dados = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_usuario = dados['id_usuario']

        cur = con.cursor()

        cur.execute("""
            SELECT ID_CURTIDAS, SITUACAO_CURTIDA
            FROM curtidas_postagem
            WHERE FK_POST = ? AND FK_USUARIO_DOADOR = ?
        """, (id_post, id_usuario))

        resultado = cur.fetchone()

        if resultado:
            id_curtida, situacao = resultado

            nova_situacao = 0 if situacao == 1 else 1

            cur.execute("""
                        UPDATE curtidas_postagem
                        SET SITUACAO_CURTIDA = ?,
                            DATA_HORA        = CURRENT_TIMESTAMP
                        WHERE ID_CURTIDAS = ?
                        """, (nova_situacao, id_curtida))

            con.commit()

            cur.execute("""
                        SELECT COUNT(ID_CURTIDAS)
                        FROM curtidas_postagem
                        WHERE FK_POST = ?
                          AND SITUACAO_CURTIDA = 1
                        """, (id_post,))

            quantidade_curtidas = cur.fetchone()[0]

            return jsonify({
                'curtido': nova_situacao == 1,
                'quantidade_curtidas': quantidade_curtidas
            }), 200

        else:

            cur.execute("""
                        INSERT INTO curtidas_postagem (FK_POST,
                                                       FK_USUARIO_DOADOR)
                        VALUES (?, ?)
                        """, (id_post, id_usuario))

            con.commit()

            cur.execute("""
                        SELECT COUNT(ID_CURTIDAS)
                        FROM curtidas_postagem
                        WHERE FK_POST = ?
                          AND SITUACAO_CURTIDA = 1
                        """, (id_post,))

            quantidade_curtidas = cur.fetchone()[0]

            return jsonify({
                'curtido': True,
                'quantidade_curtidas': quantidade_curtidas
            }), 201

    except jwt.ExpiredSignatureError:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Sua sessão expirou. Faça login novamente.'
            }
        }), 401

    except jwt.InvalidTokenError:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Token inválido. Faça login novamente.'
            }
        }), 401

    except Exception as e:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': f'Erro ao curtir: {e}'
            }
        }), 500

    finally:
        if 'cur' in locals():
            cur.close()


@app.route('/postar_comentario/<int:id_usuario>/<int:id_post>', methods=['POST'])
def postar_comentario(id_usuario, id_post):
    token = request.cookies.get('access_token')

    if not token:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token necessário'
        }}), 401

    cur = con.cursor()

    try:
        dados_token = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados_token['id_usuario']

        cur.execute(
            'SELECT tipo_de_usuario FROM usuario WHERE id_usuario = ?',
            (id_token,)
        )
        res_usuario = cur.fetchone()

        if not res_usuario:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Usuário não encontrado'
            }}), 404

        tipo_usuario = res_usuario

        # Captura da mensagem vinda do JSX (React)
        dados_corpo = request.get_json()
        mensagem_front = dados_corpo.get('comentario') if dados_corpo else None

        if not mensagem_front or not str(mensagem_front).strip():
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'comentario obrigatória'
            }}), 400

        # Conversão de Emoji para Shortcode (:rocket:)
        mensagem_banco = emoji.demojize(mensagem_front)

        # Verifica se o post existe na tabela de posts (ajuste o nome da coluna/tabela se necessário)
        cur.execute(
            'SELECT ID_POST_projeto FROM POST_PROJETO WHERE ID_POST_projeto = ?',
            (id_post,)
        )
        if not cur.fetchone():
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'O post não existe'
            }}), 404

        # Inserção da Mensagem (Sintaxe SQL Corrigida)
        cur.execute("""
                    INSERT INTO MENSAGENS_POSTAGEM (FK_POST, FK_USUARIO_DOADOR, MENSAGEM)
                    VALUES (?, ?, ?) RETURNING ID_MENSAGEM
                    """, (id_post, id_token, mensagem_banco.strip()))

        id_mensagem = cur.fetchone()[0]
        con.commit()

        return jsonify({
            'mensagem': {
                'tipo': 'sucesso',
                'descricao': 'comentario realizado com sucesso'
            },
            'id_mensagem': id_mensagem
        }), 201

    except jwt.ExpiredSignatureError:
        return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Token expirado'}}), 401
    except Exception as e:
        con.rollback()
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': f'Erro ao processar comentario: {str(e)}'
        }}), 500
    finally:
        cur.close()


@app.route('/listar_comentario/<int:id_post>', methods=['GET'])
def listar_comentario(id_post):
    token = request.cookies.get('access_token')


    cur = con.cursor()

    try:
        id_usuario = None
        tipo_usuario = None
        if token:
            dados_token = jwt.decode(token, senha_secreta, algorithms=['HS256'])
            id_usuario = dados_token['id_usuario']
            cur.execute("""
                        SELECT tipo_de_usuario
                        FROM usuario
                        WHERE id_usuario = ?
                        """, (id_usuario,))
            tipo_usuario = cur.fetchone()

            if tipo_usuario:
                tipo_usuario = tipo_usuario[0]

        cur.execute("""
                    SELECT m.ID_MENSAGEM,
                           m.MENSAGEM,
                           m.DATA_HORA,
                           u.NOME,
                           m.FK_USUARIO_DOADOR,
                           pr.FK_USUARIO_ONG
                    FROM MENSAGENS_POSTAGEM m
                             JOIN usuario u
                                  ON m.FK_USUARIO_DOADOR = u.ID_USUARIO
                             JOIN POST_PROJETO p
                                  ON m.FK_POST = p.ID_POST_PROJETO
                             JOIN PROJETO_ONG pr
                                  ON p.FK_PROJETO = pr.ID_PROJETO
                    WHERE m.FK_POST = ?
                    ORDER BY m.DATA_HORA DESC
                    """, (id_post,))

        mensagens_db = cur.fetchall()

        mensagens = []

        for m in mensagens_db:
            mensagem = m[1]

            if hasattr(mensagem, 'read'):
                mensagem = mensagem.read()

            if isinstance(mensagem, bytes):
                mensagem = mensagem.decode('utf-8', errors='ignore')

            mensagem = str(mensagem) if mensagem is not None else ""

            mensagens.append({
                'id_comentario': m[0],
                'comentario': emoji.emojize(mensagem, language='en'),
                'data_hora': m[2].strftime("%d/%m/%Y %H:%M") if m[2] else None,
                'usuario': m[3],
                ''
                'acoes': (
                m[4] == id_usuario or
                tipo_usuario == 2 or
                (tipo_usuario == 1 and m[5] == id_usuario)),
                'deletar': (
                    m[4] == id_usuario or
                    tipo_usuario == 2 or
                    (tipo_usuario == 1 and m[5] == id_usuario)),
                'editar': (
                        m[4] == id_usuario or tipo_usuario == 2)
            })

        return jsonify({
            'mensagens': mensagens
        }), 200

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
            'descricao': f'Erro ao listar mensagens: {str(e)}'
        }}), 500

    finally:
        cur.close()
@app.route('/excluir_comentario/<int:id_mensagem>', methods=['DELETE'])
def excluir_comentario(id_mensagem):
    token = request.cookies.get('access_token')

    if not token:
        return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Token necessário'}}), 401

    cur = con.cursor()

    try:
        # Decodificação do Token
        dados_token = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_token = dados_token['id_usuario']

        # Busca tipo de usuário e extrai o valor da tupla [0]
        cur.execute('SELECT tipo_de_usuario FROM usuario WHERE id_usuario = ?', (id_token,))
        res_usuario = cur.fetchone()

        if not res_usuario:
            return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Usuário não encontrado'}}), 404

        tipo_usuario = res_usuario[0] # Agora é um inteiro (0, 1 ou 2)

        cur.execute("""select FK_USUARIO_DOADOR, FK_POST from MENSAGENS_POSTAGEM where ID_MENSAGEM = ?""", (id_mensagem,))
        resultado = cur.fetchone()
        if not resultado:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'comentario não encontrado'
            }}), 404
        # Verificação de existência e permissão em uma única lógica
        if tipo_usuario == 2:
            # ADM: Deleta qualquer mensagem pelo ID
            cur.execute("DELETE FROM MENSAGENS_POSTAGEM WHERE ID_MENSAGEM = ?", (id_mensagem,))
        elif tipo_usuario == 1:
            cur.execute("""select pr.FK_USUARIO_ONG, m.fk_usuario_doador
                           from MENSAGENS_POSTAGEM m
                           join post_projeto p on m.fk_post = p.id_post_projeto
                           join projeto_ong pr on p.fk_projeto = pr.id_projeto
                           where m.ID_MENSAGEM = ?
                           """, (id_mensagem,))
            resultado_ong = cur.fetchone()
            if resultado_ong[1] == id_token:
                cur.execute("DELETE FROM MENSAGENS_POSTAGEM WHERE ID_MENSAGEM = ? and FK_USUARIO_DOADOR = ?", (id_mensagem, resultado_ong[1]))
            elif resultado_ong[0] == id_token:
                cur.execute("DELETE FROM MENSAGENS_POSTAGEM WHERE ID_MENSAGEM = ?", (id_mensagem,))
            else:
                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Você não tem permissão para excluir esse comentario'
                }}), 403
        else:
            # DOADOR: Deleta apenas se a mensagem for dele
            if resultado[0] != id_token:
                return jsonify({'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Você não tem permissão para excluir esse comentario'
                }}), 403
            else:
                cur.execute("""
                            DELETE FROM MENSAGENS_POSTAGEM
                            WHERE ID_MENSAGEM = ? AND FK_USUARIO_DOADOR = ?
                            """, (id_mensagem, id_token))

        con.commit()

        return jsonify({'mensagem': {
            'tipo': 'sucesso',
            'descricao': 'comentario excluído com sucesso'
        }}), 200 # 200 é mais comum para DELETE bem-sucedido que 201

    except jwt.ExpiredSignatureError:
        return jsonify({'mensagem': {'tipo': 'erro', 'descricao': 'Token expirado'}}), 401
    except Exception as e:
        con.rollback()
        return jsonify({'mensagem': {'tipo': 'erro', 'descricao': f'Erro ao excluir: {str(e)}'}}), 500
    finally:
        cur.close()


@app.route('/editar_comentario/<int:id_mensagem>', methods=['PUT'])
def editar_comentario(id_mensagem):
    token = request.cookies.get('access_token')

    if not token:
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': 'Token necessário'
        }}), 401

    cur = con.cursor()

    try:
        dados_token = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_usuario = dados_token['id_usuario']

        # Busca o tipo do usuário logado
        cur.execute("""
                    SELECT tipo_de_usuario
                    FROM usuario
                    WHERE id_usuario = ?
                    """, (id_usuario,))
        tipo_usuario = cur.fetchone()
        if not tipo_usuario:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Usuário não encontrado'
            }}), 404
        tipo_usuario = tipo_usuario[0]

        cur.execute("""
                    SELECT m.FK_USUARIO_DOADOR,
                           pr.FK_USUARIO_ONG
                    FROM MENSAGENS_POSTAGEM m
                             JOIN POST_PROJETO p ON m.FK_POST = p.ID_POST_PROJETO
                             JOIN PROJETO_ONG pr ON p.FK_PROJETO = pr.ID_PROJETO
                    WHERE m.ID_MENSAGEM = ?
                    """, (id_mensagem,))
        resultado = cur.fetchone()

        if not resultado:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'comentario não encontrado'
            }}), 404

        dono_mensagem = resultado[0]
        ong_dona_projeto = resultado[1]


        if not (tipo_usuario == 2 or dono_mensagem == id_usuario or (tipo_usuario == 1 and ong_dona_projeto == id_usuario)):
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Você não tem permissão para editar esse comentário'
            }}), 403


        dados = request.get_json()
        nova_mensagem = dados.get('mensagemEditada') if dados else None
        if not nova_mensagem or not str(nova_mensagem).strip():
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'comentario obrigatório'
            }}), 400

        mensagem_banco = emoji.demojize(nova_mensagem.strip())

        cur.execute("""
            UPDATE MENSAGENS_POSTAGEM
            SET MENSAGEM = ?
            WHERE ID_MENSAGEM = ?
        """, (mensagem_banco, id_mensagem))

        con.commit()

        return jsonify({'mensagem': {
            'tipo': 'sucesso',
            'descricao': 'comentario editada com sucesso'
        }}), 200

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
        con.rollback()
        return jsonify({'mensagem': {
            'tipo': 'erro',
            'descricao': f'Erro ao editar comentario: {str(e)}'
        }}), 500

    finally:
        cur.close()



@app.route('/adicionar_tipo_ong', methods=['POST'])
def adicionar_tipo_ong():
    cur = con.cursor()

    try:
        dados = request.get_json()

        novo_tipo = dados.get('novo_tipo')

        if not novo_tipo or len(novo_tipo.strip()) <= 0:
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Digite um nome válido'
                }
            }), 400

        cur.execute("""
                    INSERT INTO tipo_ong (nome)
                    VALUES (?)
                        RETURNING id_tipo_ong
                    """, (novo_tipo.strip().upper(),))

        id_tipo_ong = cur.fetchone()[0]

        con.commit()

        return jsonify({
            'mensagem': {
                'tipo': 'sucesso',
                'descricao': 'Tipo de ONG adicionado com sucesso'
            },
            'id_tipo_ong': id_tipo_ong
        }), 201

    except Exception as erro:

        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': str(erro)
            }
        }), 500

    finally:
        cur.close()

@app.route("/excluir_tipo_ong/<int:id_tipo_ong>", methods=['DELETE'])
def excluir_tipo_ong(id_tipo_ong):

    token = request.cookies.get('access_token')

    if not token:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Token necessário'
            }
        }), 401

    cur = con.cursor()

    try:

        dados_token = jwt.decode(
            token,
            senha_secreta,
            algorithms=['HS256']
        )

        id_token = dados_token['id_usuario']

        cur.execute(
            'SELECT tipo_de_usuario FROM usuario WHERE id_usuario = ?',
            (id_token,)
        )

        usuario = cur.fetchone()

        if not usuario:
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Usuário não encontrado'
                }
            }), 404

        res_usuario = usuario[0]

        if res_usuario != 2:
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Apenas ADMs podem excluir tipos de ONG'
                }
            }), 403

        cur.execute(
            'SELECT 1 FROM TIPO_ONG WHERE ID_TIPO_ONG = ?',
            (id_tipo_ong,)
        )

        tem = cur.fetchone()

        if not tem:
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Tipo de ONG não localizado'
                }
            }), 404

        cur.execute(
            'DELETE FROM TIPO_ONG WHERE ID_TIPO_ONG = ?',
            (id_tipo_ong,)
        )

        con.commit()

        return jsonify({
            'mensagem': {
                'tipo': 'sucesso',
                'descricao': 'Tipo de ONG excluído com sucesso'
            }
        }), 200

    except Exception as e:

        con.rollback()

        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': f'Erro ao excluir tipo de ONG: {str(e)}'
            }
        }), 500

    finally:
        cur.close()

@app.route('/listar_tipos_ong', methods=['GET'])
def listar_tipos_ong():

    cur = con.cursor()

    try:

        cur.execute("""
                    SELECT id_tipo_ong, nome
                    FROM tipo_ong
                    ORDER BY nome
                    """)

        tipos = cur.fetchall()

        lista_tipos = []

        for tipo in tipos:
            lista_tipos.append({
                'id_tipo_ong': tipo[0],
                'nome': tipo[1]
            })


        return jsonify({'tipos':lista_tipos}), 200

    except Exception as erro:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': str(erro)
            }
        }), 500

    finally:
        cur.close()

@app.route('/relatorio_doacoes', methods=['GET'])
def relatorio_doacoes():
    token = request.cookies.get('access_token')

    if not token:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Token necessário'
            }
        }), 401

    cur = con.cursor()

    try:

        dados_token = jwt.decode(
            token,
            senha_secreta,
            algorithms=['HS256']
        )

        id_token = dados_token['id_usuario']

        cur.execute(
            'SELECT tipo_de_usuario FROM usuario WHERE id_usuario = ?',
            (id_token,)
        )

        usuario = cur.fetchone()

        if not usuario:
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Usuário não encontrado'
                }
            }), 404

        res_usuario = usuario[0]

        if res_usuario != 2:
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Apenas ADMs podem excluir tipos de ONG'
                }
            }), 403

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font('Times', style='B', size=16)
        #        W, H,  txt,                    border,   wrap,    align
        # pdf.cell(0, 10, 'Relatório de doações', border=1, ln=True, align='C')

        # Cor do fundo do header
        # pdf.set_fill_color(189, 13, 89)
        # Desenha o retângulo do header
        # pdf.rect(0, 0, 190, 25, 'F')

        # x=0, y=0, largura=210, altura=25, 'F' = preenchido  # 'D'  só contorno/borda  # 'DF'  borda + preenchimento
        pdf.set_draw_color(189, 13, 89)  # cor da borda
        pdf.set_line_width(0.8)

        pdf.rect(5, 5, 200, 30, 'D')


        pdf.cell(0, 20, 'Relatório de doações', align='C', ln=True)
        cur.execute('select nome from usuario where tipo_de_usuario = 0')
        doadores = cur.fetchall()
        cur.execute('select nome from usuario where tipo_de_usuario = 1')
        ongs = cur.fetchall()
        pdf.add_page()
        pdf.cell(40,10,'Nomes', ln=True)
        pdf.set_font(size=12)
        for doador in doadores:
            pdf.cell(30, 10, f'{doador[0]}', ln=True)
            for ong in ongs:
                pdf.set_x(30)
                pdf.cell(30, 10, f'{ong[0]}', ln=True)

        caminho_pdf = 'relatorio_doacoes.pdf'
        pdf.output(caminho_pdf)

        return send_file(
            caminho_pdf,
            mimetype='application/pdf',
            as_attachment=False,
            download_name='relatorio_doacoes.pdf'
        )


    except Exception as e:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': f'Erro ao gerar relatório {e}'
            }
        })
    finally:
        cur.close()


@app.route("/enviar_pix", methods=['POST'])
def enviar_pix():
    dados = request.get_json()
    if not dados:
        return jsonify({
            'mensagem': {'tipo': 'erro', 'descricao': 'Corpo da requisição vazio ou inválido'}
        }), 400

    id_projeto = dados.get('id_projeto')
    id_ong = dados.get('id_ong')
    valor_doacao = dados.get('valor')

    token = request.cookies.get('access_token')

    if not token:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Token necessário'
            }
        }), 401

    cur = con.cursor()

    try:
        dados_token = jwt.decode(
            token,
            senha_secreta,
            algorithms=['HS256']
        )

        id_token = dados_token['id_usuario']

        cur.execute(
            'SELECT tipo_de_usuario, nome, email FROM usuario WHERE id_usuario = ?',
            (id_token,)
        )

        usuario = cur.fetchone()

        if not usuario:
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Usuário não encontrado'
                }
            }), 404

        res_usuario = usuario[0]
        
        if res_usuario != 0:
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Apenas Doadores podem realizar um PIX'
                }
            }), 403

        cur.execute('SELECT NOME, CIDADE_ONG, CHAVE_PIX, EMAIL FROM USUARIO WHERE ID_USUARIO = ?', (id_ong,))
        dados_ong = cur.fetchone()

        if not dados_ong:
            return jsonify({
                'mensagem': {'tipo': 'erro', 'descricao': 'ONG não encontrada'}
            }), 404
        
        email_ong = dados_ong[3]
        nome_ong = dados_ong[0]
        cidade_ong = dados_ong[1]
        chave_pix = dados_ong[2]

        nome_projeto = None
        if id_projeto is not None:
            cur.execute('SELECT NOME, FK_USUARIO_ONG FROM PROJETO_ONG WHERE ID_PROJETO = ?', (id_projeto,))
            projeto_row = cur.fetchone()

            if not projeto_row[0]:
                return jsonify({
                    'mensagem': {'tipo': 'erro', 'descricao': 'Projeto não existe'}
                }), 404

            id_projeto_ong = projeto_row[1]

            if int(id_projeto_ong) != int(id_ong):
                return jsonify({
                    'mensagem':{
                        'tipo':'erro',
                        'descricao':'Esse projeto não é dessa ong'
                    }
                })


            else:

                nome_projeto = projeto_row[0]

                cur.execute(
                    'INSERT INTO DOACOES(FK_USUARIO_ONG, FK_USUARIO_DOADOR, FK_PROJETO, VALOR_DOADOR) VALUES (?, ?, ?, ?) RETURNING ID_DOACAO',
                    (id_ong, id_token, id_projeto, valor_doacao)
                )
                id_doacao = cur.fetchone()[0]
    
                arquivo = f"{id_doacao}.png"
    
                con.commit()
        if nome_projeto:
            gerar_qrcode_pix(chave_pix, nome_projeto, cidade_ong, valor_doacao, arquivo)
        
            enviando_email(
                usuario[2],
                f"Pagamento efetuado com sucesso",
                f"Valor enviado de R$:{valor_doacao} para o Projeto {nome_projeto} com sucesso",
                "",
                usuario[1],
                "Obrigado pela doação"
            )
        
            enviando_email(
                email_ong,
                f"Valor recebido de {usuario[2]} para o projeto {nome_projeto}",
                f"Valor recebido de R$:{valor_doacao}, do doador {usuario[1]}.",
                "",
                nome_ong,
                ""
            )

        else:
            gerar_qrcode_pix(chave_pix, nome_ong, cidade_ong, valor_doacao, arquivo)

            enviando_email(
                usuario[2],
                f"Pagamento efetuado com sucesso",
                f"Valor enviado de R$:{valor_doacao} para a ONG {nome_ong} com sucesso",
                "",
                usuario[1],
                "Obrigado pela a doação"
            )

            enviando_email(
                email_ong,
                f"Valor recebido de {usuario[2]}",
                f"Valor recebido de R$:{valor_doacao}, do doador {usuario[1]}.",
                "",
                nome_ong,
                "Gaste o Dinheiro em algum dos seus projeto"
            )

        return jsonify({
            'mensagem': {
                'tipo': 'sucesso',
                'descricao': 'Pix gerado com sucesso'
            }
        }), 200

    except Exception as e:
        con.rollback()
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': f'Erro ao fazer o pix: {str(e)}'
            }
        }), 500

    finally:
        cur.close()
        
@app.route("/historico/<int:pagina>", methods=['GET'])
def historico(pagina):

    token = request.cookies.get('access_token')

    if not token:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Token necessário'
            }
        }), 401

    cur = con.cursor()

    try:
        dados = jwt.decode(
            token,
            senha_secreta,
            algorithms=['HS256']
        )

        id_token = dados['id_usuario']

        cur.execute("""
            SELECT tipo_de_usuario
            FROM usuario
            WHERE id_usuario = ?
        """, (id_token,))

        tipo_usuario = cur.fetchone()[0]

        id_usuario_param = request.args.get('id_usuario')

        if id_usuario_param:
            if tipo_usuario != 2:
                return jsonify({
                    'mensagem': {
                        'tipo': 'erro',
                        'descricao': 'Apenas administradores podem acessar histórico de outro usuário'
                    }
                }), 403

            id_usuario = int(id_usuario_param)

        else:
            id_usuario = id_token
        cur.execute('select tipo_de_usuario from usuario where id_usuario = ?', (id_usuario,))
        tipo_usuario_historico = cur.fetchone()
        if not tipo_usuario_historico:
            return jsonify({'mensagem': {
                'tipo': 'erro',
                'descricao': 'Usuário não encontrado'
            }})
        tipo_usuario_historico = tipo_usuario_historico[0]
        filtro = request.args.get('nome', '')
        
        if tipo_usuario_historico == 0:
            filtro_sql = " UPPER(ong.nome) LIKE UPPER(?)"

        elif tipo_usuario_historico == 1:
            filtro_sql = " UPPER(doador.nome) LIKE UPPER(?)"

        else:
            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Tipo de usuário inválido para histórico'
                }
            }), 400

        
        cur.execute(f"""
            SELECT COUNT(*)
            FROM doacoes d

            LEFT JOIN usuario ong
                ON ong.id_usuario = d.fk_usuario_ong

            LEFT JOIN usuario doador
                ON doador.id_usuario = d.fk_usuario_doador

            WHERE 
                (
                    d.fk_usuario_doador = ?
                    OR d.fk_usuario_ong = ?
                )
                AND {filtro_sql}
        """, (
            id_usuario,
            id_usuario,
            f"%{filtro}%"
        ))

        quantidade = cur.fetchone()[0]

        numeroPaginas = math.ceil(quantidade / quantidadePorPagina)

        minimo = ((pagina - 1) * quantidadePorPagina) + 1
        maximo = pagina * quantidadePorPagina

        proximaPagina = pagina + 1

        if proximaPagina > numeroPaginas:
            proximaPagina = 0

        paginaAnterior = pagina - 1

        if (paginaAnterior <
                1):
            paginaAnterior = 0

        cur.execute(f"""
            SELECT
                ong.nome,
                projeto.nome,
                doador.nome,
                doador.email,
                d.valor_doador,
                d.data_hora,
                d.fk_usuario_doador,
                d.fk_usuario_ong
            FROM doacoes d

            LEFT JOIN usuario ong
                ON ong.id_usuario = d.fk_usuario_ong

            LEFT JOIN projeto_ong projeto
                ON projeto.id_projeto = d.fk_projeto

            LEFT JOIN usuario doador
                ON doador.id_usuario = d.fk_usuario_doador

            WHERE 
                (
                    d.fk_usuario_doador = ?
                    OR d.fk_usuario_ong = ?
                )
                AND {filtro_sql}

            ORDER BY d.data_hora DESC
            ROWS ? TO ?
        """, (
            id_usuario,
            id_usuario,
            f"%{filtro}%",
            minimo,
            maximo
        ))


        resultados = cur.fetchall()

        historico = []

        for doacao in resultados:
            historico.append({
                'nome_ong': doacao[0],
                'nome_projeto': doacao[1],
                'nome_doador': doacao[2],
                'email_doador': doacao[3],
                'valor': float(doacao[4]),
                'data': doacao[5].strftime('%d/%m/%Y'),
                'hora': doacao[5].strftime('%H:%M'),
                'id_doador': doacao[6],
                'id_ong': doacao[7],
                'tipo_historico': 'doacao_feita' if doacao[6] == id_usuario else 'doacao_recebida'
            })

        return jsonify({
            'historico': historico,
            'numeroPaginas': numeroPaginas,
            'proximaPagina': proximaPagina,
            'paginaAnterior': paginaAnterior,
            'quantidade': quantidade
        }), 200

    except jwt.ExpiredSignatureError:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Sessão expirada'
            }
        }), 401

    except jwt.InvalidTokenError:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Token inválido'
            }
        }), 401

    except Exception as e:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': f'Erro ao buscar histórico: {e}'
            }
        }), 500

    finally:
        cur.close()


@app.route('/estatisticas_admin', methods=['GET'])
def estatisticas_admin():

    token = request.cookies.get('access_token')

    if not token:
        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Token necessário'
            }
        }), 401

    cur = con.cursor()

    try:

        dados = jwt.decode(
            token,
            senha_secreta,
            algorithms=['HS256']
        )

        tipo_usuario = dados['tipo_usuario']

        # verifica ADM
        if tipo_usuario != 2:

            return jsonify({
                'mensagem': {
                    'tipo': 'erro',
                    'descricao': 'Acesso negado'
                }
            }), 403

        ano_atual = datetime.now().year

        # TOTAL DOAÇÕES
        cur.execute(f"""
            SELECT COALESCE(SUM(valor_doador), 0)
            FROM doacao
            WHERE EXTRACT(YEAR FROM data_hora) = {ano_atual}
        """)

        valor_total_doacoes = float(cur.fetchone()[0])

        # NOVOS DOADORES
        cur.execute(f"""
            SELECT COUNT(id_usuario)
            FROM usuario
            WHERE tipo_usuario = 0
              AND EXTRACT(YEAR FROM data_cadastro) = {ano_atual}
        """)

        novos_doadores = cur.fetchone()[0]

        # NOVAS ONGS
        cur.execute(f"""
            SELECT COUNT(id_usuario)
            FROM usuario
            WHERE tipo_usuario = 1
              AND EXTRACT(YEAR FROM data_cadastro) = {ano_atual}
        """)

        novas_ongs = cur.fetchone()[0]

        return jsonify({
            'estatisticas': {
                'ano': ano_atual,
                'valor_total_doacoes': valor_total_doacoes,
                'novos_doadores': novos_doadores,
                'novas_ongs': novas_ongs
            }
        }), 200

    except jwt.ExpiredSignatureError:

        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Sessão expirada'
            }
        }), 401

    except jwt.InvalidTokenError:

        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': 'Token inválido'
            }
        }), 401

    except Exception as e:

        return jsonify({
            'mensagem': {
                'tipo': 'erro',
                'descricao': f'Erro ao buscar estatísticas: {e}'
            }
        }), 500

    finally:
        cur.close()