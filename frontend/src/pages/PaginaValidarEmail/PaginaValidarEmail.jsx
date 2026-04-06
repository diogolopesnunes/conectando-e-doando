import Form from "../../components/Form/Form.jsx";
import Input from "../../components/Input/Input.jsx";
import {useEffect, useState} from "react";
import Buton from "../../components/Buton/Buton.jsx";
import {useNavigate} from "react-router-dom";
import Alerts from "../../components/Alerts/Alerts.jsx";

export default function PaginaValidarEmail() {

    const [email, setEmail] = useState(localStorage.getItem("email"));
    const [codigo, setCodigo] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");

    const navegate = useNavigate()

    useEffect(()=>{
        if (mensagem) {
            const timer = setTimeout(() => {
                setMensagem('');
            }, 2000);

            return () => clearTimeout(timer);
        }
    },[mensagem])

    async function validarEmail(e){
        e.preventDefault();

        let response = await fetch(`http://10.92.3.118:5000/validar_conta`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email: email,
                codigo: codigo
            })
        });

        // if (!response.ok) {
        //     console.log("Erro HTTP:", response.status);
        //     return;
        // }


        let retorno = await response.json();
        console.log(retorno);
        setTimeout(function () {
            navegate('/login')
        }, 2000)

        if (retorno.mensagem){
            setMensagem(retorno.mensagem.descricao)
            setTipoMensagem(retorno.mensagem.tipo)
        }
    }

    return (
        <div className="container m-auto">
            <div className="row">
                <div className="col-12">
                    {mensagem && <Alerts tipo={tipoMensagem} imagem={`./public/${tipoMensagem}.png`} duracao={'8000'} descricao={mensagem} />}
                    <Form largura={'maior'} titulo={'Validar email'} onSubmit={validarEmail}>
                        <Input type={'email'} label={'Email:'} value={email} funcao={(e) => setEmail(e.target.value)} placeholder={"Digite seu email"} />
                        <Input
                            label={'Código:'}
                            placeholder={"Digite o Código"}
                            type={"text"}
                            value={codigo}
                            funcao={(e) => setCodigo(e.target.value)}
                        />

                        <Buton texto={"Validar"} tamanho={"medio"} background={"laranja"} tipo={'submit'}/>

                    </Form>
                </div>
            </div>
        </div>
    );
}