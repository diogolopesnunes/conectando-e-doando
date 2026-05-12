import Input from "../../components/Input/Input.jsx";
import Titulo from "../../components/Titulo/Titulo.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import { Link, useNavigate } from "react-router-dom";
import css from "./PaginaLogin.module.css";
import Form from "../../components/Form/Form.jsx";
import { useEffect, useState } from "react";
import Alerts from "../../components/Alerts/Alerts.jsx";

export default function Login({ setLogado, api }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const [mensagem, setMensagem] = useState(null);

    const navegate = useNavigate();

    useEffect(() => {
        if (mensagem) {
            const timer = setTimeout(() => {
                setMensagem(null);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [mensagem]);

    async function login(e) {
        e.preventDefault();

        let retorno = await fetch(`${api}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email, senha
            })
        });

        retorno = await retorno.json();
        console.log(retorno);

        if (!retorno) {
            console.log("Erro do servidor:", retorno);
            return;
        }

        if (retorno.mensagem) {
            setMensagem({
                id: Date.now(),
                texto: retorno.mensagem.descricao,
                tipo: retorno.mensagem.tipo
            });

            setLogado(true);
            
            if (retorno.mensagem.descricao === 'Sua conta está inativa') {
                localStorage.setItem("email", email);
                navegate('/validar');
            }
        }

        if (retorno.usuario) {
            localStorage.setItem('nome', retorno.usuario.nome);
            localStorage.setItem('email', retorno.usuario.email);
            localStorage.setItem('id_usuario', retorno.usuario.id_usuario);
            localStorage.setItem('tipo_usuario', retorno.usuario.tipoUsuario);

            setTimeout(() => {
                if (localStorage.getItem('tipo_usuario') == 0) {
                    navegate('/feed');
                } else if (localStorage.getItem('tipo_usuario') == 1){
                    navegate('/previa_ong');
                } else if(localStorage.getItem('tipo_usuario') == 2){
                    navegate('/dashboard_adm_ong');
                }
            }, 1500);
        }
    }

    return (
        <div className="container m-auto formataAltura">
            <div className={'row'}>
                <div className="col align-self-center">

                    {mensagem && (
                        <Alerts
                            key={mensagem.id}
                            tipo={mensagem.tipo}
                            imagem={`./public/${mensagem.tipo}.png`}
                            duracao={10000}
                            descricao={mensagem.texto}
                        />
                    )}

                    <Form largura="maior" onSubmit={login} titulo={'Login'}>

                        <Input
                            tipoInp={"email"}
                            label={"Email:"}
                            htmlFor={"email"}
                            placeholder={"Digite seu email"}
                            value={email}
                            funcao={(e) => setEmail(e.target.value)}
                        />

                        <Input
                            tipoInp={"password"}
                            label={"Senha:"}
                            htmlFor={"senha"}
                            placeholder={"Digite sua senha"}
                            value={senha}
                            funcao={(e) => setSenha(e.target.value)}
                        />

                        <div className="my-3">
                            <Buton texto={"Login"} tamanho={"medio"} background={"laranja"} tipo={'submit'} />
                        </div>

                        <div className={'row'}>
                            <div className="col-sm col-12 mb-sm-0 mb-2 text-center d-flex align-items-center justify-content-center">
                                <Link to={"/cadastro"} className={"text-decoration-none " + css.frase}>
                                    Não tem uma conta?
                                    <span className={"d-block " + css.fraseLaranja}>Cadastre-se!</span>
                                </Link>
                            </div>

                            <div className="col-sm col-12 text-center d-flex align-items-center justify-content-center">
                                <Link to={"/esqueciminhasenha"} className={"text-decoration-none " + css.frase}>
                                    Esqueci minha senha!
                                </Link>
                            </div>
                        </div>

                    </Form>
                </div>
            </div>
        </div>
    );
}