import Input from "../../components/Input/Input.jsx";
import Titulo from "../../components/Titulo/Titulo.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import {Link} from "react-router-dom";
import css from "./PaginaLogin.module.css";
import Form from "../../components/Form/Form.jsx";
import {useState} from "react";

export default function Login(){
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')

    // const navegate = useNavigate();

    async function login(e) {
        e.preventDefault();
        let retorno = await fetch(`http://10.92.3.235:5000/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        })
        retorno = await retorno.json()
        console.log(retorno)
        if(!retorno){
            console.log("Erro do servidor:", retorno);
            return;
        }
        // if(retoro.resp) {
        //     setAlerta('Login realizado com sucesso!');
        //     localStorage.setItem('token', retorno.token);
        //     localStorage.setItem('nome', retorno.usuario.nome);
        //     localStorage.setItem('email', retorno.usuario.email);
        //     localStorage.setItem('id_usuario', retorno.usuario.id);
        //     setTimeout(function () {
        //         navegate('/dashboard')
        //     }, 500)
        // }
    }
    return(
        <div className="container m-auto">
            <div className={'row'}>
                <div className="col">
                    <Form onSubmit={login}>
                        <div className="text-center">
                            <Titulo texto={"Login"} estilo={"Titulo_Login"}/>
                        </div>
                        <Input tipoInp={"email"} label={"Email:"} htmlFor={"email"} placeholder={"Digite seu email"} value={email} funcao={(e) => setEmail(e.target.value)}/>
                        <Input tipoInp={"password"} label={"Senha:"} htmlFor={"senha"} placeholder={"Digite sua senha"} value={senha} funcao={(e) => setSenha(e.target.value)}/>
                        <Buton texto={"Login"} tamanho={"medio"} background={"laranja"} tipo={'submit'}/>
                        <div className={"text-center d-flex align-items-center gap-5 justify-content-center "}>


                        </div>
                        <div className={'row'}>
                            <div className="col-sm col-12 mb-sm-0 mb-2 text-center d-flex align-items-center justify-content-center">
                                <Link to={"/cadastro"} className={""+ css.frase}>Não tem uma conta?<span className={"d-block " + css.fraseLaranja}>Cadastre-se!</span></Link>
                            </div>
                            <div className="col-sm col-12 text-center d-flex align-items-center justify-content-center">
                                <Link to={"/esqueciminhasenha"} className={""+ css.frase}>Esqueci minha senha!</Link>
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    )
}