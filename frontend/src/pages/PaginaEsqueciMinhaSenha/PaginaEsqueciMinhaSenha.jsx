import Buton from "../../components/Buton/Buton.jsx";
import Input from "../../components/Input/Input.jsx";
import Form from "../../components/Form/Form.jsx";
import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import Alerts from "../../components/Alerts/Alerts.jsx";

export default function PaginaEsqueciMinhaSenha({api}){

    const [email, setEmail] = useState('');
    const [mensagem, setMensagem] = useState('');
    const navigate = useNavigate();
    const [tipoMensagem, setTipoMensagem] = useState('');

    useEffect(()=>{
        if (mensagem) {
            const timer = setTimeout(() => {
                setMensagem('');
            }, 10000);

            return () => clearTimeout(timer);
        }
    },[mensagem])

    async function esqueciMinhaSenha(e) {
        e.preventDefault();

        try {
            let response = await fetch(`${api}/esqueci_minha_senha`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    email: email
                })
            });

            // if (!response.ok) {
            //     console.log("Erro HTTP:", response.status);
            //     return;
            // }

            let retorno = await response.json();
            console.log(retorno);

            if (retorno.mensagem){
                setMensagem(retorno.mensagem.descricao);
                setTipoMensagem(retorno.mensagem.tipo);

                localStorage.setItem("email", email);
                if (retorno.mensagem.tipo == 'redirecionamento'){
                    setTimeout(() => {
                        navigate("/validar");
                    }, 1500);
                }
                else if (retorno.mensagem.tipo != 'erro') {
                    setTimeout(() => {
                        navigate("/alterar_senha");
                    }, 1500);
                }

            }
        } catch (erro) {
            console.log("Erro na requisição:", erro);
        }
    }

    return(
        <div className="container m-auto">
            <div className="row formataAltura d-flex justify-content-center align-items-center">
                <div className="col">
                    {mensagem && <Alerts tipo={tipoMensagem} imagem={`./public/${tipoMensagem}.png`} duracao={'10000'} descricao={mensagem} />}
                    <Form largura={'maior'} titulo={'Esqueci minha senha'} onSubmit={esqueciMinhaSenha} >

                        <Input
                            tipoInp={'email'}
                            label={"Insira seu E-Mail:"}
                            htmlFor={"email"}
                            value={email}
                            placeholder={"Digite seu email aqui"}
                            funcao={(e) => setEmail(e.target.value)}
                        />

                        <Buton
                            texto={"Confirmar"}
                            background={"laranja"}
                            tamanho={"medio"}
                            tipo={"submit"}
                        />

                    </Form>
                </div>
            </div>
        </div>
    )
}