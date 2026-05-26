import Form from "../../components/Form/Form.jsx";
import Input from "../../components/Input/Input.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import { useState, useRef, useEffect } from "react";
import css from "./EdicaoAdm.module.css";
import Alerts from "../../components/Alerts/Alerts.jsx";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../../components/Nav/Nav.jsx";

export default function EdicaoAdm({ api }) {

    const navigate = useNavigate();
    const inputImagemRef = useRef();

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [cpfCnpj, setCpfCnpj] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);

    const { id_usuario } = useParams();
    const [idUsuario, setIdUsuario] = useState(id_usuario || localStorage.getItem("id_usuario"));

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
            navigate('/login');
        } else {
            setIdUsuario(id_usuario || localStorage.getItem("id_usuario"));
        }
    }, []);

    useEffect(() => {
        async function buscarAdm() {
            let resposta = await fetch(`${api}/editar_usuario/${idUsuario}`, {
                method: "GET",
                credentials: "include"
            });

            let res = await resposta.json();

            if (res.usuario) {
                setNome(res.usuario.nome);
                setEmail(res.usuario.email);
                setCpfCnpj(res.usuario.cpf_cnpj);
                setTelefone(res.usuario.telefone);
            } else if (res.mensagem) {
                setMensagem(res.mensagem.descricao);
                setTipoMensagem(res.mensagem.tipo);
            }
        }

        buscarAdm();
    }, [idUsuario]);

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

    async function editar(e) {
        e.preventDefault();

        if (senha && senha !== confirmarSenha) {
            setMensagem("As senhas não coincidem");
            setTipoMensagem("erro");
            return;
        }

        const form = new FormData();
        form.append("nome", nome);
        form.append("email", email);
        form.append("cpf_cnpj", cpfCnpj);
        form.append("telefone", telefone);

        if (senha) form.append("senha", senha);
        console.log(confirmarSenha)
        if (confirmarSenha) form.append("confirmar_senha", confirmarSenha);
        if (imagem) form.append("imagem", imagem);

        let res = await fetch(`${api}/editar_usuario/${idUsuario}`, {
            method: "PUT",
            body: form,
            credentials: "include"
        });

        res = await res.json();

        if (res.mensagem) {
            setMensagem(res.mensagem.descricao);
            setTipoMensagem(res.mensagem.tipo);

            if (res.mensagem.tipo === 'sucesso') {
                if (localStorage.getItem('id_usuario') == idUsuario){
                    localStorage.setItem('nome', nome);
                    localStorage.setItem('email', email);
                }
                setTimeout(() => {
                    navigate(localStorage.getItem("tipo_usuario") == 2 ? "/dashboard_adm_adm" : "/feed")
                }, 1500);
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
                                imagem={`/public/${tipoMensagem}.png`}
                                duracao={'10000'}
                                descricao={mensagem}
                            />
                        )}

                        <Form largura="maior" titulo={"Edição do Adm"} onSubmit={editar}>

                            <Input label="Nome" tipoInp="text"
                                   obrigatorio={"Sim"}
                                   value={nome}
                                   funcao={(e)=>setNome(e.target.value)}
                            />

                            <Input label="Email" tipoInp="email"
                                   obrigatorio={"Sim"}
                                   value={email}
                                   funcao={(e)=>setEmail(e.target.value)}
                            />

                            <Input label="CPF" obrigatorio={"Sim"}
                                   tipoInp="text"
                                   value={cpfCnpj}
                                   funcao={(e)=>setCpfCnpj(e.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric"
                                   maxLength={14}
                                   minLength={14}
                                   mask={"cpf"}

                            />

                            <Input label="Telefone" obrigatorio={"Sim"}
                                   tipoInp="text"
                                   value={telefone}
                                   funcao={(e)=>setTelefone(e.target.value)}
                                   inputMode="numeric"
                                   maxLength={15}
                                   minLength={15}
                                   mask={"telefone"}
                            />

                            <div className={"w-75 m-auto d-flex justify-content-between " + css.senha}>
                                <Input
                                    label="Senha"
                                    tipoInp="password"
                                    classe="metade"
                                    value={senha}
                                    required={false}
                                    funcao={(e)=>setSenha(e.target.value)}
                                />

                                <Input
                                    label="Confirmar Senha"
                                    tipoInp="password"
                                    classe="metade"
                                    value={confirmarSenha}
                                    required={false}
                                    funcao={(e)=>setConfirmarSenha(e.target.value)}
                                />
                            </div>

                            <div className="w-100 flex-column d-flex justify-content-center align-items-center mb-4">
                                <label className="mb-3 fw-bold">Imagem de Perfil</label>

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

                            <Buton
                                texto={'Salvar Alterações'}
                                background={'laranja'}
                                tamanho={'medio'}
                                tipo={"submit"}
                            />

                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}