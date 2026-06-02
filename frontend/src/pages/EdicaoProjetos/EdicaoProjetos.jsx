import Form from "../../components/Form/Form.jsx";
import Input from "../../components/Input/Input.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import { useState, useRef, useEffect } from "react";
import css from "./EdicaoProjetos.module.css";
import Alerts from "../../components/Alerts/Alerts.jsx";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../../components/Nav/Nav.jsx";

export default function EditarProjeto({ api }) {

    const { id_projeto } = useParams();

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [meta, setMeta] = useState('');
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);

    const [mensagem, setMensagem] = useState('');

    const inputImagemRef = useRef();
    const navigate = useNavigate();

    const [idUsuario, setIdUsuario] = useState(localStorage.getItem("id_usuario"));

    const navegate=useNavigate();


    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
            navigate('/login')
        } else{
            setIdUsuario(localStorage.getItem("id_usuario"));
        }
    }, [])

    useEffect(() => {
        async function buscarProjeto() {
            let resposta = await fetch(`${api}/editar_projeto/${idUsuario}/${id_projeto}`, {
                method: "GET",
                credentials: "include"
            });
            resposta = await resposta.json();
            if (resposta.projeto) {
                setNome(resposta.projeto.nome);
                setDescricao(resposta.projeto.descricao);
                setMeta(resposta.projeto.meta_doacao);
                setPreview(resposta.projeto.imagem);
                if (resposta.mensagem.tipo == 'sucesso'){
                    setTimeout(function () {
                        if (localStorage.getItem("tipo_usuario") == 2) {
                            navegate("/dashboard_adm_ong")
                        } else if (localStorage.getItem("tipo_usuario") == 1){
                            navegate("/projetos_ong")
                        }
                    }, 1500)
                }
            }
        }

        buscarProjeto();
    }, [id_projeto]);


    useEffect(() => {
        if (mensagem) {
            const timer = setTimeout(() => {
                setMensagem('');
            }, 10000);

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


    async function editar(e) {
        e.preventDefault();

        const form = new FormData();
        form.append("nome", nome);
        form.append("descricao", descricao);
        form.append("meta_doacao", meta);

        if (imagem) {
            form.append("imagem", imagem);
        }

        let resposta = await fetch(`${api}/editar_projeto/${idUsuario}/${id_projeto}`, {
            method: "PUT",
            credentials: "include",
            body: form
        });

        resposta = await resposta.json();

        if (resposta.mensagem.tipo === "sucesso") {
            setMensagem({
                descricao: "Projeto atualizado com sucesso!",
                tipo: "sucesso",
                id: Date.now()
            });
            if (resposta.mensagem.tipo == 'sucesso'){
                setTimeout(function () {
                    if (localStorage.getItem("tipo_usuario") == 2) {
                        navegate("/dashboard_adm_ong")
                    } else if (localStorage.getItem("tipo_usuario") == 1){
                        navegate("/projetos_ong")
                    }
                }, 1500)
            }

        } else {
            setMensagem({
                descricao:"Erro ao atualizar projeto",
                tipo:"erro",
                id: Date.now()
            });
        }
    }

    return (
        <>
            <Nav />
            <div className="container m-auto">
                <div className="row">
                    <div className="col">

                        {mensagem && (
                            <Alerts
                                key={mensagem.id}
                                tipo={mensagem.tipo}
                                imagem={`/public/${mensagem.tipo}.png`}
                                duracao={'10000'}
                                descricao={mensagem.descricao}
                            />
                        )}

                        <div className="m-auto">
                            <Form largura="maior" titulo={"Editar Projeto"} onSubmit={editar}>

                                <Input obrigatorio={"Sim"}
                                    htmlFor="nome"
                                    label="Nome do Projeto"
                                    tipoInp="text"
                                    value={nome}
                                    funcao={(e) => setNome(e.target.value)}
                                />

                                <Input obrigatorio={"Sim"}
                                    htmlFor="descricao"
                                    label="Descrição"
                                    tipoInp="textarea"
                                    value={descricao}
                                    funcao={(e) => setDescricao(e.target.value)}
                                />

                                <Input obrigatorio={"Sim"}
                                    htmlFor="meta"
                                    label="Meta (R$)"
                                    tipoInp="text"
                                    value={meta}
                                    funcao={(e) => setMeta(e.target.value.replace(/\D/g, ""))}
                                    mask={'cash'}
                                />

                                <div className="w-100 flex-column d-flex justify-content-center align-items-center mb-5">
                                    <label className="mb-3 fw-bold">Imagem do Projeto</label>

                                    <input
                                        ref={inputImagemRef}
                                        type="file"
                                        onChange={colocarImagem}
                                        className={css.botao}
                                    />

                                    {preview && (
                                        <>
                                            <img
                                                className={"mt-3 " + css.preview}
                                                src={preview}
                                                alt="Preview"
                                            />

                                            <Buton
                                                tipo="button"
                                                texto="Remover"
                                                background="vermelho"
                                                tamanho="pequeno"
                                                onClick={() => {
                                                    inputImagemRef.current.value = null;
                                                    setPreview(null);
                                                    setImagem(null);
                                                }}
                                            />
                                        </>
                                    )}
                                </div>


                                <div className={"d-flex flex-column align-items-center justify-content-center gap-2"}>
                                    <Buton
                                        texto={'Salvar Alterações'}
                                        background={'laranja'}
                                        tamanho={'medio'}
                                        tipo={"submit"}
                                    />
                                    <Buton
                                        texto={'Cancelar'}
                                        background={'roxo'}
                                        tamanho={'pequeno'}
                                        onClick={() => {navigate(-1)}}
                                    />
                                </div>


                            </Form>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
