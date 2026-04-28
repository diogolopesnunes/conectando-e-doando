import Form from "../../components/Form/Form.jsx";
import Input from "../../components/Input/Input.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import { useState, useRef, useEffect } from "react";
import css from "./AdicionarProjetos.module.css";
import Alerts from "../../components/Alerts/Alerts.jsx";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/Nav/Nav.jsx";

export default function PaginaProjeto({ api }) {

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [meta_doacao, setMeta] = useState('');
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');

    const inputImagemRef = useRef();
    const [idUsuario, setIdUsuario] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
            navegate('/login')
        } else{
            setIdUsuario(localStorage.getItem("id_usuario"));
        }
    }, [])

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

    async function publicar(e) {
        e.preventDefault();

        const form = new FormData();
        form.append("nome", nome);
        form.append("descricao", descricao);
        form.append("meta_doacao", meta_doacao);

        if (imagem) {
            form.append("imagem", imagem);
        }

        let resposta = await fetch(`${api}/cadastrar_projeto/${idUsuario}`, {
            method: "POST",
            credentials: "include",
            body: form
        });

        resposta = await resposta.json();
        console.log(resposta);

        
        if (resposta.mensagem) {
            setMensagem(resposta.mensagem.descricao);
            setTipoMensagem(resposta.mensagem.tipo);
            if (resposta.mensagem.tipo == 'sucesso') {
                setTimeout(() => {
                    navigate('/projetos_ong');
                }, 2000);
            }
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
                                tipo={tipoMensagem}
                                imagem={`/${tipoMensagem}.png`}
                                duracao={'10000'}
                                descricao={mensagem}
                            />
                        )}

                        <div className={'m-auto '}>
                            <Form largura="maior" titulo={"Cadastro de Projeto"} onSubmit={publicar}>
                                <Input
                                    htmlFor="nome"
                                    label="Nome do Projeto"
                                    tipoInp="text"
                                    placeholder="Digite o nome do projeto"
                                    value={nome}
                                    funcao={(e) => setNome(e.target.value)}
                                />

                                <Input
                                    htmlFor="descricao"
                                    label="Descrição"
                                    tipoInp="textarea"
                                    placeholder="Descreva o projeto"
                                    value={descricao}
                                    funcao={(e) => setDescricao(e.target.value)}
                                />

                                <Input
                                    htmlFor="meta"
                                    label="Meta (R$)"
                                    tipoInp="text"
                                    placeholder="Ex: 1000"
                                    value={meta_doacao}
                                    funcao={(e) => setMeta(e.target.value.replace(/\D/g, ""))}
                                    inputMode="numeric"
                                />
                                <div className="w-100 flex-column d-flex justify-content-center align-items-center mb-4">
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
                                                background={'vermelho'}
                                                tamanho={'pequeno'}
                                                tipo={"submit"}
                                                onClick={() => {
                                                    inputImagemRef.current.value = null;
                                                    setPreview(null);
                                                    setImagem(null);
                                                }}
                                            />
                                        </>
                                    )}
                                </div>


                                <Buton
                                    texto={'Cadastrar'}
                                    background={'laranja'}
                                    tamanho={'medio'}
                                    tipo={"submit"}
                                />

                            </Form>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
