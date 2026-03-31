import Form from "../../components/Form/Form.jsx";
import Input from "../../components/Input/Input.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import {useEffect, useState} from "react";
import Alerts from "../../components/Alerts/Alerts.jsx";

export default function PaginaAlterarSenha() {

    const [codigo, setCodigo] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [email, setEmail] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState('');

    useEffect(() => {
        setEmail(localStorage.getItem("email"));
    }, []);

    useEffect(()=>{
        if (mensagem) {
            const timer = setTimeout(() => {
                setMensagem('');
            }, 2000);

            return () => clearTimeout(timer);
        }
    },[mensagem])

    async function alterarSenha(e){
        e.preventDefault();


        if (!email) {
            console.log("Email não encontrado no localStorage");
            return;
        }

        if (novaSenha !== confirmarSenha) {
            console.log("As senhas não coincidem");
            return;
        }

        let response = await fetch(`http://10.92.3.150:5000/alterar_senha`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email: email,
                codigo: codigo,
                nova_senha: novaSenha,
                confirmar_nova_senha: confirmarSenha
            })
        });

        if (!response.ok) {
            console.log("Erro HTTP:", response.status);
            return;
        }

        let retorno = await response.json();
        console.log(retorno);

        if (retorno.mensagem){
            setMensagem(retorno.mensagem.descricao)
            setTipoMensagem(retorno.mensagem.tipo)
        }
    }

    return (
        <div className="container m-auto">
            <div className="row">
                <div className="col-12">
                    {mensagem && <Alerts tipo={tipoMensagem} imagem={tipoMensagem} duracao={'2000'} descricao={mensagem} />}
                    <Form largura={'maior'} titulo={'Alterar senha'} onSubmit={alterarSenha}>

                        {mensagem &&
                            <Alerts tipo={'erro'} descricao={mensagem} duracao={'3000'} imagem={'alerta_erro.png'} />
                        }

                        <Input
                            placeholder={'Digite o email'}
                            type={"email"}
                            value={email}
                            funcao={(e) => setEmail(e.target.value)}
                            label={'Email:'}
                        />

                        <Input
                            placeholder={"Digite o Código"}
                            type={"text"}
                            value={codigo}
                            funcao={(e) => setCodigo(e.target.value)}
                            label={'Codigo:'}
                        />

                        <Input
                            tipoInp={"password"}
                            placeholder={"Nova Senha"}
                            type={"password"}
                            value={novaSenha}
                            funcao={(e) => setNovaSenha(e.target.value)}
                            label={'Nova senha:'}
                        />

                        <Input
                            tipoInp={"password"}
                            placeholder={"Confirmar senha"}
                            type={"password"}
                            value={confirmarSenha}
                            funcao={(e) => setConfirmarSenha(e.target.value)}
                            label={'Confirmar nova senha:'}
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