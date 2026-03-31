import Buton from "../../components/Buton/Buton.jsx";
import Input from "../../components/Input/Input.jsx";
import Form from "../../components/Form/Form.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alerts from "../../components/Alerts/Alerts.jsx";

export default function PaginaEsqueciMinhaSenha(){

    const [email, setEmail] = useState('');
    const [mensagem, setMensagem] = useState('');
    const navigate = useNavigate();

    async function esqueciMinhaSenha(e) {
        e.preventDefault();

        try {
            let response = await fetch(`http://10.92.3.230:5000/esqueci_minha_senha`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    email: email
                })
            });

            if (!response.ok) {
                console.log("Erro HTTP:", response.status);
                return;
            }

            let retorno = await response.json();
            console.log(retorno);

            if (retorno.mensagem){
                setMensagem(retorno.mensagem);

                localStorage.setItem("email", email);

                setTimeout(() => {
                    navigate("/alterar_senha");
                }, 1500);
            }

        } catch (erro) {
            console.log("Erro na requisição:", erro);
        }
    }

    return(
        <div className="container m-auto">
            <div className="row">
                <div className="col">

                    {mensagem &&
                        <Alerts tipo={'redirecionamento'} descricao={mensagem} duracao={'3000'} imagem={'redirecionamento'} />
                    }


                    <Form titulo={'Alterar Senha'} onSubmit={esqueciMinhaSenha} >

                        <Input
                            tipoInp={'email'}
                            label={"Insira seu E-Mail:"}
                            htmlFor={"email"}
                            value={email}
                            placeholder={"Digite seu email aqui"}
                            funcao={(e) => setEmail(e.target.value)}
                        />

                        <Buton
                            texto={"CONFIRMAR"}
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