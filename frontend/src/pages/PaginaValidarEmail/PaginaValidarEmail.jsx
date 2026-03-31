import Form from "../../components/Form/Form.jsx";
import Input from "../../components/Input/Input.jsx";
import { useState } from "react";
import Buton from "../../components/Buton/Buton.jsx";

export default function PaginaValidarEmail() {

    const [email, setEmail] = useState(localStorage.getItem("email"));
    const [codigo, setCodigo] = useState("");

    async function validarEmail(e){
        e.preventDefault();

        let response = await fetch(`http://10.92.3.230:5000/desbloquear_usuario`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email: email,
                codigo: codigo
            })
        });

        if (!response.ok) {
            console.log("Erro HTTP:", response.status);
            return;
        }

        let retorno = await response.json();
        console.log(retorno);
    }

    return (
        <div className="container m-auto">
            <div className="row">
                <div className="col-12">
                    <Form titulo={'Validar email'} onSubmit={validarEmail}>
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