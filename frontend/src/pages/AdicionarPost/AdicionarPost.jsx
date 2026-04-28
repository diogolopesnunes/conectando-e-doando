import Form from "../../components/Form/Form.jsx";
import Input from "../../components/Input/Input.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import { useState, useRef, useEffect } from "react";

import css from "./AdicionarPost.module.css";
import Alerts from "../../components/Alerts/Alerts.jsx";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../../components/Nav/Nav.jsx";

export default function PaginaPost({ api }) {
    const { id_projeto, id_post } = useParams();
    const [loading, setLoading] = useState(false);
    const [id_usuario, setIdUsuario] = useState(localStorage.getItem("id_usuario") || "");
    const [titulo, setTitulo] = useState('');
    const [acao, setAcao] = useState('');
    const [atividade, setAtividade] = useState(1);
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const inputImagemRef = useRef();
    const navigate = useNavigate();
    const editando = Boolean(id_post);

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
            navigate('/login');
        } else {
            setIdUsuario(localStorage.getItem("id_usuario"));
        }
    }, [navigate]);

    useEffect(() => {
        async function buscarPost() {
            if (!editando || !id_usuario) return;
            const resposta = await fetch(`${api}/editar_post/${id_usuario}/${id_projeto}/${id_post}`, {
                method: "GET",
                credentials: "include"
            });
            const retorno = await resposta.json();
            if (retorno.post) {
                setTitulo(retorno.post.titulo || '');
                setAcao(retorno.post.acao || '');
                setAtividade(retorno.post.atividade ?? 1);
            } else if (retorno.mensagem) {
                setMensagem(retorno.mensagem.descricao);
                setTipoMensagem(retorno.mensagem.tipo);
            }
        }
        buscarPost();
    }, [editando, id_usuario, id_projeto, id_post]);

    useEffect(() => {
        if (mensagem) {
            const timer = setTimeout(() => setMensagem(''), 10000);
            return () => clearTimeout(timer);
        }
    }, [mensagem]);

    function colocarImagem(e) {
        const file = e.target.files[0];
        if (file) {
            setImagem(file);
            setPreview(URL.createObjectURL(file));
        }
    }

    async function publicar(e) {
        e.preventDefault();
        if (loading) return;

        if (!editando && !imagem) {
            setMensagem("Por favor, selecione uma imagem para o post.");
            setTipoMensagem("erro");
            return;
        }

        if (!titulo || !acao) {
            setMensagem("Título e Ação são campos obrigatórios.");
            setTipoMensagem("erro");
            return;
        }

        setLoading(true);
        const form = new FormData();
        form.append("titulo", titulo);
        form.append("acao", acao);
        form.append("atividade", atividade);
        if (imagem) form.append("imagem", imagem);

        const url = editando
            ? `${api}/editar_post/${id_usuario}/${id_projeto}/${id_post}`
            : `${api}/postar/${id_usuario}/${id_projeto}`;

        let resposta = await fetch(url, {
            method: editando ? "PUT" : "POST",
            credentials: "include",
            body: form
        });

        resposta = await resposta.json();
        setLoading(false);
        if (resposta.mensagem) {
            setMensagem(resposta.mensagem.descricao);
            setTipoMensagem(resposta.mensagem.tipo);
            if (resposta.mensagem.tipo === 'sucesso') {
                setTimeout(() => navigate(`/projeto/${id_projeto}`), 1200);
            }
        }
    }

    return (
        <>
            <Nav />
            <div className="container m-auto">
                <div className="row">
                    <div className="col">
                        {mensagem && <Alerts tipo={tipoMensagem} imagem={`/${tipoMensagem}.png`} duracao={'10000'} descricao={mensagem} />}
                        <div className={'m-auto '}>
                            <Form largura="maior" titulo={editando ? "Editar Post" : "Adicionar Post"} onSubmit={publicar}>
                                <Input htmlFor="titulo" label="Título do Post:" tipoInp="text" placeholder="Digite o título do Post" value={titulo} funcao={(e) => setTitulo(e.target.value)} />
                                <Input htmlFor="acao" label="Ação:" tipoInp="textarea" placeholder="Descreva a publicação" value={acao} funcao={(e) => setAcao(e.target.value)} />
                                <div className="w-100 flex-column d-flex justify-content-center align-items-center mb-4">
                                    <label className="mb-3 fw-bold">Imagem Post</label>
                                    <input ref={inputImagemRef} type="file" onChange={colocarImagem} className={css.botao} />
                                    {preview && (
                                        <>
                                            <img className={"mt-3 " + css.preview} src={preview} alt="Preview" />
                                            <Buton texto="Remover" background={'vermelho'} tamanho={'pequeno'} tipo="button" onClick={() => { inputImagemRef.current.value = null; setPreview(null); setImagem(null); }} />
                                        </>
                                    )}
                                </div>
                                <Buton texto={loading ? 'Publicando...' : (editando ? 'Salvar' : 'Adicionar')} background={'laranja'} tamanho={'medio'} tipo="submit" disabled={loading} />
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
