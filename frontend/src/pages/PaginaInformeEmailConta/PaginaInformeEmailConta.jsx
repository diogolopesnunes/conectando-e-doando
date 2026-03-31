// import css from "./PaginaEsqueciMinhaSenha.module.css";
import Buton from "../../components/Buton/Buton.jsx";
import Input from "../../components/Input/Input.jsx";
import Form from "../../components/Form/Form.jsx";
import {useState} from "react";


export default function PaginaInformeEmailConta(){
    const [email, setEmail] = useState('')
    const [mensagem, setMensagem] = useState()
    // const navegate = useNavigate();

    async function validarConta(e) {
        e.preventDefault();
        let retorno = await fetch(`http://10.92.3.230:5000/esqueci_minha_senha`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email: email
            })
        })
        retorno = await retorno.json()
        console.log(retorno)
        if (!retorno) {
            console.log("Erro do servidor:", retorno);
            return;
        }
        if (retorno.mensagem){
            setMensagem(retorno.mensagem)
        }
    }
    return(
        <div className={"container m-auto"}>
            <div className={"row"}>
                <div className={"col"}>
                    {mensagem &&
                        <div>
                            <p>{mensagem}</p>
                        </div>
                    }
                    <Form titulo={'Ativar conta'} onSubmit={validarConta} >
                        <Input tipoInp={'email'} label={"Insira seu E-Mail:"} htmlFor={"email"} value={email} placeholder={"Digite seu email aqui"} funcao={(e) => setEmail(e.target.value)} />
                        <Buton texto={"CONFIRMAR"} background={"laranja"} tamanho={"medio"} tipo={"input"}/>
                    </Form>
                </div>
            </div>
        </div>
    )
}