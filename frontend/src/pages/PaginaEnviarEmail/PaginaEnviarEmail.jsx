import Alerts from "../../components/Alerts/Alerts.jsx";
import Form from "../../components/Form/Form.jsx";
import Input from "../../components/Input/Input.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import Nav from "../../components/Nav/Nav.jsx";
import { useNavigate, useParams, useMatch } from "react-router-dom";
import { useEffect, useState } from "react";


export default function PaginaEnviarEmail({ api }) {
    const [loading, setLoading] = useState(false);
    const { id_ong } = useParams();
    const navigate = useNavigate();
    const [assunto, setAssunto] = useState(null);
    const [mensagemEmail, setMensagemEmail] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const idAdm = localStorage.getItem("id_usuario");
    const rotaReprovar = useMatch("/enviar_email/:id_ong");
    let resposta;

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("id_usuario") || localStorage.getItem("tipo_usuario") != 2) {
            navigate('/login');
        }
        // if(local.pathname.includes('/enviar_email_bloquear/')){
        //     setBloquear(true)
        // }
    }, [navigate]);

    async function enviar(e) {
        e.preventDefault();
        if (!mensagemEmail.trim()) {
            setMensagem("Por favor, preencha o assunto e a mensagem.");
            setTipoMensagem("erro");
            return;
        }
        setLoading(true);
        if (!rotaReprovar) {
            resposta = await fetch(`${api}/ativar_desativar_usuario/${id_ong}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({acao: 0, assunto, mensagem: mensagemEmail})
            });
        } else {
            resposta = await fetch(`${api}/permitir_recusar_ong/${idAdm}/${id_ong}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({acao: 0, assunto, mensagem: mensagemEmail})
            });
        }
        const retorno = await resposta.json();
        const msg = retorno.mensagem;
        if (msg) {
            setMensagem(msg.descricao || msg.mensagem);
            setTipoMensagem(msg.tipo);
            if (msg.tipo === "sucesso" && rotaReprovar) setTimeout(() => navigate("/dashboard_adm_ong"), 1200);
            else if (msg.tipo === "sucesso" && !rotaReprovar) setTimeout(() => navigate("/dashboard_adm_doador"), 1200);
        }
        setLoading(false);
    }

    return (
        <>
            <Nav />
            <div className="container m-auto formataAltura">
                <div className={'row'}>
                    <div className="col align-self-center">
                        {mensagem && <Alerts tipo={tipoMensagem} imagem={`/public/${tipoMensagem}.png`} duracao={10000} descricao={mensagem} />}
                        <Form largura="maior" titulo={rotaReprovar ? 'Motivo da reprova' : 'Motivo do bloqueio'} onSubmit={enviar}>
                            <Input tipoInp={"textarea"} label={"Mensagem:"} htmlFor={"mensagem"} placeholder={"Digite a mensagem"} value={mensagemEmail} funcao={(e) => setMensagemEmail(e.target.value)} />
                            <div className="my-3">
                                <Buton texto={loading ? "Enviando..." : "Enviar"} tamanho={"medio"} background={"laranja"} tipo={"submit"} disabled={loading} />
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}
