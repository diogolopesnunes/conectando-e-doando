import Form from "../../components/Form/Form.jsx";
import Input from "../../components/Input/Input.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import { useState } from "react";

export default function PaginaAlterarSenha() {

    const [codigo, setCodigo] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    async function alterarSenha(e){
        e.preventDefault();

        const email = localStorage.getItem("email");

        if (!email) {
            console.log("Email não encontrado no localStorage");
            return;
        }

        if (novaSenha !== confirmarSenha) {
            console.log("As senhas não coincidem");
            return;
        }

        let response = await fetch(`http://10.92.3.230:5000/alterar_senha`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email: email,
                codigo: codigo,
                nova_senha: novaSenha
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
                    <Form titulo={'Alterar senha'} onSubmit={alterarSenha}>

                        <Input
                            placeholder={"Digite o Código"}
                            type={"text"}
                            value={codigo}
                            funcao={(e) => setCodigo(e.target.value)}
                        />

                        <Input
                            tipoInp={"password"}
                            placeholder={"Nova Senha"}
                            type={"password"}
                            value={novaSenha}
                            funcao={(e) => setNovaSenha(e.target.value)}
                        />

                        <Input
                            tipoInp={"password"}
                            placeholder={"Confirmar senha"}
                            type={"password"}
                            value={confirmarSenha}
                            funcao={(e) => setConfirmarSenha(e.target.value)}
                        />

                        <Buton
                            texto={"Alterar senha"}
                            tamanho={"medio"}
                            background={"laranja"}
                            tipo={'submit'}
                        />

                    </Form>
                </div>
            </div>
        </div>
    )
}