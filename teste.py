import os.path
from flask import Flask, jsonify, request, send_file, Response, make_response
from main import app, con
from funcao import validar_senha, criptografar, checar_senha, enviando_email, gerar_token, remover_bearer
from fpdf import FPDF
import pygal
import threading
import jwt
import datetime

senha_secreta = app.config['SECRET_KEY']

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/grafico')
def grafico():
    try:
        cur = con.cursor()
        cur.execute("""
            select ano_publicado, count(*)
            from livros
            group by ano_publicado
            order by ano_publicado
        """)
        resultado = cur.fetchall()

        grafico = pygal.Bar()
        grafico.title = "Quantidade de livros publicados por ano"

        for linha in resultado:
            grafico.add(str(linha[0]), linha[1])

        return Response(grafico.render(), mimetype='image/svg+xml')

    except Exception as e:
        return jsonify({'message': f'Erro ao consultar banco de dados: {e}'}), 500
    finally:
        cur.close()

@app.route('/listar_livro', methods=['GET'])
def listar_livro():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"mensagem": "Token de autenticação necessário"})

    token = remover_bearer(token)

    try:
        payload = jwt.decode(token, senha_secreta, algorithms=['HS256'])
        id_usuario = payload['id_usuario']
    except jwt.ExpiredSignatureError:
        return jsonify({"mensagem": "Token Expirado"})
    except jwt.InvalidTokenError:
        return jsonify({"mensagem": "Token Inválido"})


    try:
        cur = con.cursor()

        cur.execute('select id_livro, titulo, autor, ano_publicado from livros')
        livros = cur.fetchall()
        livros_lista = []
        for livro in livros:
            livros_lista.append({
                'id_livro': livro[0],
                'titulo': livro[1],
                'autor': livro[2],
                'ano_publicado': livro[3]
            })

        return jsonify(mensagem='Lista de Livros', livros=livros_lista)

    except Exception as e:
        return jsonify({'message': f'Erro ao consultar banco de dados: {e}'}), 500
    finally:
        cur.close()


@app.route('/criar_livro', methods=['POST'])
def criar_livro():
    try:
        cur = con.cursor()

        titulo = request.form.get('titulo')
        autor = request.form.get('autor')
        ano_publicado = request.form.get('ano_publicado')
        imagem = request.files.get('imagem')

        cur = con.cursor()

        cur.execute('select 1 from livros where titulo = ?', (titulo,))
        if cur.fetchone():
            return jsonify({'erro': 'Livro já cadastrado'}), 400

        cur.execute("""insert into livros (titulo, autor, ano_publicado)
                        values (?, ?, ?) RETURNING id_livro""", (titulo, autor, ano_publicado))

        codigo_livro = cur.fetchone()[0]

        con.commit()

        caminho_imagem = None

        if imagem:
            nome_imagem = f"livro_{codigo_livro}.jpg"
            caminho_imagem_destino = os.path.join(app.config['UPLOAD_FOLDER'], "Livros")
            os.makedirs(caminho_imagem_destino, exist_ok=True)
            caminho_imagem = os.path.join(caminho_imagem_destino, nome_imagem)
            imagem.save(caminho_imagem)

        return jsonify({'mensagem': 'Livro cadastrado com suuuuceeeeeeeeeeeesso',
                         'livro': {
                        'titulo': titulo,
                        'autor': autor,
                        'ano_publicado': ano_publicado
        }
        }), 201

    except Exception as e:
        return jsonify({'message': 'Erro ao cadastrar livro'}), 500
    finally:
        cur.close()


@app.route('/deletar_livro/<int:id_livro>', methods=['DELETE'])
def deletar_livro(id_livro):
    cur = con.cursor()

    cur.execute('select 1 from livros where id_livro = ?', (id_livro,))
    if not cur.fetchone():
        cur.close()
        return jsonify({'error': 'Livro não encontrado'}), 404

    cur.execute('delete from livros where id_livro = ?', (id_livro,))
    con.commit()
    cur.close()

    return jsonify({'mensagem': 'Livro deletado com suuuuceeeeeeeeeeeesso',
                    'id_livro':id_livro}), 201


@app.route('/editar_livro/<int:id_livro>', methods=['PUT'])
def editar_livro(id_livro):
    cur = con.cursor()
    cur.execute("""select id_livro, titulo, autor, ano_publicado
                    from livros
                    where id_livro = ?""", (id_livro,))
    tem_livro = cur.fetchone()

    if not tem_livro:
        cur.close()
        return jsonify({'error': 'Livro não encontrado'}), 404

    dados = request.get_json()
    titulo = dados.get('titulo')
    autor = dados.get('autor')
    ano_publicado = dados.get('ano_publicado')

    cur.execute(""" update livros set titulo = ?, autor = ?, ano_publicado = ?
                    where id_livro = ?""", (titulo, autor, ano_publicado, id_livro))

    con.commit()
    cur.close()

    return jsonify({'mensagem': 'Livro editado com suuuuceeeeeeeeeeeesso',
                    'livro': {
                        'id_livro': id_livro,
                        'titulo': titulo,
                        'autor': autor,
                        'ano_publicado': ano_publicado
                    }
    }), 201


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

@app.route('/criar_usuario', methods=['POST'])
def criar_usuario():
    try:
        cur = con.cursor()
        dados = request.get_json(silent=True)

        usuario = dados.get('usuario')
        senha = dados.get('senha')

        if not dados:
            return jsonify({'erro': 'Nenhum dado fornecido'}), 400

        if not usuario or not senha:
            return jsonify({'erro': 'Insira Usuário e Senha'}), 400

        mensagem_validacao = validar_senha(senha)
        if mensagem_validacao:
            return jsonify({'erro': mensagem_validacao}), 400
        senha_cript = criptografar(senha)

        cur.execute('select 1 from usuarios where usuario = ?', (usuario,))
        if cur.fetchone():
            return jsonify({'erro': 'Usuário já cadastrado'}), 400
        cur.execute("""insert into usuarios (usuario, senha)
                        values (?, ?)""", (usuario, senha_cript))

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


@app.route('/deletar_usuario/<int:id_usuario>', methods=['DELETE'])
def deletar_usuario(id_usuario):
    cur = con.cursor()

    cur.execute('select 1 from usuarios where id_usuario = ?', (id_usuario,))
    if not cur.fetchone():
        cur.close()
        return jsonify({'error': 'Usuário não encontrado'}), 404

    cur.execute('delete from usuarios where id_usuario = ?', (id_usuario,))
    con.commit()
    cur.close()

    return jsonify({'mensagem': 'Usuário deletado com suuuuceeeeeeeeeeeesso',
                    'id_usuario': id_usuario}), 201

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


@app.route('/login_usuario', methods=['POST'])
def login_usuario():
    cur = con.cursor()
    dados = request.get_json(silent=True)

    if not dados:
        return jsonify({'erro': 'Nenhum dado fornecido'}), 400
    usuario = dados.get('usuario')
    senha = dados.get('senha')

    if not usuario or not senha:
        return jsonify({'erro': 'Insira Usuário e Senha'}), 400

    senha_cript = criptografar(senha)
    cur.execute('select senha from usuarios where usuario = ?', (usuario,))
    resultado = cur.fetchone()
    if not resultado:
        return jsonify({'erro': 'Usuário não encontrado'}), 404
    senha_banco = resultado[0]

    cur.close()

    if checar_senha(senha, senha_banco):
        token = gerar_token(usuario)

        resp = make_response(jsonify({'mensagem': 'Logado com suuuuceeeeeeeeeeeesso!'}), 200)
        resp.set_cookie('access_token', token,
                        httponly=True,
                        secure=False,
                        samesite="Lax",
                        path="/",
                        max_age=3600)

        return resp, 200
    else:
        return jsonify({'erro': 'Senha incorreta'}), 401


@app.route('/lista_usuarios_pdf', methods=['GET'])
def lista_usuarios_pdf():
    try:
        cur = con.cursor()

        cur.execute('select id_usuario, usuario from usuarios')
        usuarios = cur.fetchall()
        usuarios_lista = []
        for usuario in usuarios:
            usuarios_lista.append({
                'id_usuario': usuario[0],
                'usuario': usuario[1]
            })

        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()
        pdf.set_font("Arial", style='B', size=16)
        pdf.cell(200, 10, "Lista de Usuários", ln=True, align='C')
        pdf.ln(5)  # Espaço entre o título e a linha
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())  # Linha abaixo do título
        pdf.ln(5)  # Espaço após a linha
        pdf.set_font("Arial", size=12)
        for usuario in usuarios:
            pdf.cell(200, 10, f"ID: {usuario[0]} - {usuario[1]}", ln=True)
        contador_usuarios = len(usuarios)
        pdf.ln(10)  # Espaço antes do contador
        pdf.set_font("Arial", style='B', size=12)
        pdf.cell(200, 10, f"Total de usuários cadastrados: {contador_usuarios}", ln=True, align='C')
        pdf_path = "lista_usuarios.pdf"
        pdf.output(pdf_path)
        return send_file(pdf_path, as_attachment=True, mimetype='application/pdf')

    except Exception as e:
        return jsonify({'message': f'Erro ao consultar banco de dados: {e}'}), 500
    finally:
        cur.close()


@app.route("/enviar_email", methods=['POST'])
def enviar_email():
    dados = request.json
    assunto = dados.get('subject')
    mensagem = dados.get('message')
    destinatario = dados.get('to')

    thread = threading.Thread(target=enviando_email, args=(destinatario, assunto, mensagem))

    thread.start()

    return jsonify({"mensagem": "Email enviado com suuuuceeeeeeeeeeeesso!"}), 200