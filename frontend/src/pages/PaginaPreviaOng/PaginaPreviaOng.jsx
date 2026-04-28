import Nav from "../../components/Nav/Nav.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "./PaginaPreviaOng.module.css";
import InfoOng from "../../components/InfoOng/InfoOng.jsx";
import SecaoProjetos from "../../components/SecaoProjetos/SecaoProjetos.jsx";

export default function PaginaPreviaOng({ api }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tipoUsuario, setTipoUsuario] = useState("");
    const [ong, setOng] = useState(null);

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
            navigate('/login');
        } else {
            setTipoUsuario(localStorage.getItem("tipo_usuario"));
        }
    }, [navigate]);

    async function buscarOng() {
        const idOng = id || localStorage.getItem("id_usuario");
        if (!idOng) return;

        const resposta = await fetch(`${api}/buscar_ong/${idOng}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        const retorno = await resposta.json();
        if (retorno.ong) setOng(retorno.ong);
        else if (retorno.mensagem) alert(retorno.mensagem.descricao || retorno.mensagem.mensagem);
    }

    useEffect(() => {
        buscarOng();
    }, [id]);

    return (
        <div className={"m-auto " + css.containerPrincipal}>
            <Nav />
            <div className={css.envoltorioConteudo}>
                <div className={css.acoesCabecalho}>
                    <Buton background="rosa" tamanho="pequeno" texto="Voltar" onClick={() => navigate(-1)} />
                </div>

                {!ong ? (
                    <p className="text-center">Carregando ONG...</p>
                ) : (
                    <>
                        <InfoOng info={ong} texto={"Doar Agora"} api={api} />
                        <SecaoProjetos projetos={ong.projetos} api={api} />
                    </>
                )}
            </div>
        </div>
    );
}
