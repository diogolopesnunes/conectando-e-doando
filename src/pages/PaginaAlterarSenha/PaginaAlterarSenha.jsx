import Form from "../../components/Form/Form.jsx";
import Input from "../../components/Input/Input.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import Alerts from "../../components/Alerts/Alerts.jsx";

export default function PaginaAlterarSenha({api}) {

    const [codigo, setCodigo] = useState("");
    const [novaSenha, setNovaSenha] = useState();
    const [confirmarSenha, setConfirmarSenha] = useState();
    const [email, setEmail] = useState("");
    const [mensagem, setMensagem] = useState("");
    const navigate = useNavigate();
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [sucessos, setSucessos] = useState(0);

    useEffect(() => {
        setEmail(localStorage.getItem("email"));
    }, []);

    useEffect(()=>{
        if (mensagem) {
            const timer = setTimeout(() => {
                setMensagem('');
            }, 10000);

            return () => clearTimeout(timer);
        }
    },[mensagem])

    async function alterarSenha(e){
        e.preventDefault();


        if (!email) {
            console.log("Email não encontrado no localStorage");
            return;
        }

        // if (novaSenha !== confirmarSenha) {
        //     console.log("As senhas não coincidem");
        //     return;
        // }

        let response = await fetch(`${api}/alterar_senha`, {
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
        // if (!response.ok) {
        //     console.log("Erro HTTP:", response.status);
        //     return;
        // }

        let retorno = await response.json();
        console.log(retorno);

        if (retorno.mensagem){
            setMensagem(retorno.mensagem.descricao)
            setTipoMensagem(retorno.mensagem.tipo)
            if (retorno.mensagem.tipo == 'redirecionamento'){
                setTimeout(() => {
                    navigate("/validar");
                }, 1500);
            }
            else if (retorno.mensagem.tipo != 'erro' && sucessos == 0){
                setSucessos(1)
            }
            else if (retorno.mensagem.tipo != 'erro' && sucessos == 1) {
                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            }
        }
    }

    return (
        <div className="container m-auto">
            <div className="row">
                <div className="col-12">
                    {mensagem && <Alerts tipo={tipoMensagem} imagem={`./public/${tipoMensagem}.png`} duracao={'10000'} descricao={mensagem} />}
                    <Form largura={'maior'} titulo={'Alterar senha'} onSubmit={alterarSenha}>
                        <Input
                            placeholder={'Digite o email'}
                            type={"email"}
                            value={email}
                            funcao={(e) => setEmail(e.target.value)}
                            label={'Email:'}
                            // se sucessos foi igual a 0 o disabled vai ser true senão vai ser false
                            disabled={sucessos == 1 ? true : false}
                        />

                        <Input
                            placeholder={"Digite o Código"}
                            type={"text"}
                            value={codigo}
                            funcao={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            label={'Código:'}
                            // se sucessos foi igual a 0 o disabled vai ser true senão vai ser false
                            disabled={sucessos == 1 ? true : false}
                        />

                        <Input
                            tipoInp={"password"}
                            placeholder={"Nova Senha"}
                            type={"password"}
                            value={novaSenha}
                            funcao={(e) => setNovaSenha(e.target.value)}
                            label={'Nova senha:'}
                             // se sucessos foi igual a 0 o disabled vai ser true senão vai ser false
                            disabled={sucessos == 0 ? true : false}
                        />

                        <Input
                            tipoInp={"password"}
                            placeholder={"Confirmar senha"}
                            type={"password"}
                            value={confirmarSenha}
                            funcao={(e) => setConfirmarSenha(e.target.value)}
                            label={'Confirmar nova senha:'}
                             // se sucessos foi igual a 0 o disabled vai ser true senão vai ser false
                            disabled={sucessos == 0 ? true : false}
                        />
                        {sucessos == 1 ? (
                            <Buton
                                texto={"Alterar senha"}
                                tamanho={"medio"}
                                background={"laranja"}
                                tipo={'submit'}
                            />
                        ) : (
                            <Buton
                                texto={"Validar código"}
                                tamanho={"medio"}
                                background={"laranja"}
                                tipo={'submit'}
                            />
                        )}


                    </Form>
                </div>
            </div>
        </div>
    )
}