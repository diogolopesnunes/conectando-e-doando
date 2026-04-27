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

    const [email, setEmail] = useState("");
    const [nome, setNome] = useState("");
    const [tipoUsuario, setTipoUsuario] = useState("");


    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
            navigate('/login')
        } else{
            setNome(localStorage.getItem("nome"));
            setEmail(localStorage.getItem("email"));
            setTipoUsuario(localStorage.getItem("tipo_usuario"));
        }
    }, [])

    async function buscarOng() {
        let resposta = await fetch(`${api}/buscar_ong/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
        });

        let retorno = await resposta.json();

        if (retorno.ong) {
            setOng(retorno.ong);
        }
    }

    useEffect(() => {
        if (id) {
            buscarOng();
        }
    }, [id]);

    const ong = {
        nome: "Projeto Ajuda",
        instituicao: "Instituto Ayrton Senna",
        imagem: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&q=80&w=1000",
        logoInstituicao: "/logoSenna.png",
        descricao: [
            "O Projeto Ajuda é uma iniciativa social criada com o propósito de levar apoio, cuidado e esperança para crianças que precisam de ajuda. Nosso objetivo é oferecer oportunidades, assistência e carinho para crianças em situação de vulnerabilidade, contribuindo para um futuro mais digno e cheio de possibilidades.",
            "Através de ações solidárias, doações, atividades educativas e apoio comunitário, o Projeto Ajuda busca transformar vidas, garantindo que cada criança tenha acesso a recursos essenciais, educação, atenção e um ambiente mais acolhedor para crescer.",
            "Acreditamos que pequenas atitudes podem gerar grandes mudanças. Por isso, unimos pessoas, voluntários e parceiros que compartilham do mesmo sonho: construir um mundo melhor, onde nenhuma criança seja esquecida e todas tenham a chance de sorrir, aprender e realizar seus sonhos."
        ],
        projetos: [
            {
                id: 1,
                titulo: "Distribuição de comida",
                descricao: "Distribuímos R$10.000,00 em comida para escolas na Atlântida para oferecerem lanche e almoço de qualidade.",
                imagem: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=500",
                hora: "13:42",
                data: "12/01/2026"
            },
            {
                id: 2,
                titulo: "Resgate em Wakanda",
                descricao: "Nossa equipe de resgate resgatou 67 crianças brasileiras em Wakanda durante a guerra infinita e os levaram para suas casas.",
                imagem: "https://images.unsplash.com/photo-1504159506876-f8338247a14a?auto=format&fit=crop&q=80&w=501",
                hora: "13:42",
                data: "12/01/2026"
            }
        ]
    };

    return (
        <div className={"m-auto " + css.containerPrincipal}>
            <Nav />

            <div className={css.envoltorioConteudo}>

                <div className={css.acoesCabecalho}>
                    <Buton
                        background="rosa"
                        tamanho="pequeno"
                        texto="Voltar"
                    />
                </div>

                {tipoUsuario == 1 && (
                    <>
                        <InfoOng info={ong} />

                        <SecaoProjetos projetos={ong.projetos} />
                    </>
                )}

            </div>
        </div>
    );
}