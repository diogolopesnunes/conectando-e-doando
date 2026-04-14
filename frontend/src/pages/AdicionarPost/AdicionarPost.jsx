import Form from "../../components/Form/Form.jsx";
import Input from "../../components/Input/Input.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import { useState, useRef, useEffect } from "react";
import css from "./AdicionarPost.module.css"
import Alerts from "../../components/Alerts/Alerts.jsx";
import {useNavigate, useParams} from "react-router-dom";
import Nav from "../../components/Nav/Nav.jsx";

export default function PaginaPost({ api }) {
    const { id_projeto } = useParams()

    const [titulo, setTitulo] = useState('');
    const [acao, setAcao] = useState('');
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');

    const inputImagemRef = useRef();
    const navigate = useNavigate();


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
        form.append("titulo", titulo);
        form.append("acao", acao);

        if (imagem) {
            form.append("imagem", imagem);
        }


        let resposta = await fetch(`${api}/postar/57/${id_projeto}`, {
            method: "POST",
            credentials: "include",
            body: form
        })

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
                            <Form largura="maior" titulo={"Adicionar Post"} onSubmit={publicar}>
                                <Input
                                    htmlFor="titulo"
                                    label="Título do Post:"
                                    tipoInp="text"
                                    placeholder="Digite o título do Post"
                                    value={titulo}
                                    funcao={(e) => setTitulo(e.target.value)}
                                />

                                <Input
                                    htmlFor="acao"
                                    label="Ação:"
                                    tipoInp="textarea"
                                    placeholder="Descreva a publicação"
                                    value={acao}
                                    funcao={(e) => setAcao(e.target.value)}
                                />


                                <div className="w-100 flex-column d-flex justify-content-center align-items-center mb-4">
                                    <label className="mb-3 fw-bold">Imagem Post</label>

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
                                                // tipo="button"
                                                texto="Remover"
                                                background={'vermelho'}
                                                tamanho={'pequeno   '}
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
                                    texto={'Adicionar'}
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