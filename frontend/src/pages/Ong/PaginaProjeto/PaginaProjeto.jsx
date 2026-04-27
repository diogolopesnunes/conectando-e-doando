import Nav from "../../../components/Nav/Nav.jsx";
import Buton from "../../../components/Buton/Buton.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "./PaginaProjeto.module.css";

export default function PaginaProjeto({ api }) {
    const { id_projeto } = useParams();
    const navigate = useNavigate();
    const [idUsuario, setIdUsuario] = useState("");

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
            navigate('/login');
        } else {
            setIdUsuario(localStorage.getItem("id_usuario"));
        }
    }, [navigate]);

    const projeto = {
        nome: "Projeto Ajuda",
        instituicao: "Instituto Ayrton Senna",
        imagem: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&q=80&w=1000",
        logoInstituicao: "/logoSenna.png",
        descricao: [
            "O Projeto Ajuda é uma iniciativa social criada com o propósito de levar apoio, cuidado e esperança para crianças que precisam de ajuda. Nosso objetivo é oferecer oportunidades, assistência e carinho para crianças em situação de vulnerabilidade, contribuindo para um futuro mais digno e cheio de possibilidades.",
            "Através de ações solidárias, doações, atividades educativas e apoio comunitário, o Projeto Ajuda busca transformar vidas, garantindo que cada criança tenha acesso a recursos essenciais, educação, atenção e um ambiente mais acolhedor para crescer.",
            "Acreditamos que pequenas atitudes podem gerar grandes mudanças. Por isso, unimos pessoas, voluntários e parceiros que compartilham do mesmo sonho: construir um mundo melhor, onde nenhuma criança seja esquecida e todas tenham a chance de sorrir, aprender e realizar seus sonhos."
        ],
        valorArrecadado: 768210.00,
        metaDoacoes: 500000.00,
        porcentagem: 153.6,
        atualizacoes: [
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


    const formatarMoeda = (valor) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className={"m-auto " + css.containerPrincipal}>
            <Nav />
            <div className={css.envolverConteudo}>
                <div className={css.acoesCabecalho}>
                    <Buton
                        onClick={() => navigate(-1)}
                        background="rosa"
                        tamanho="pequeno"
                        texto="Voltar"
                    />
                </div>

                <section className={css.secaoInfoProjeto}>
                    <div className={css.envolverImagemProjeto}>
                        <img src={projeto.imagem} alt={projeto.nome} className={css.imagemProjeto} />
                    </div>
                    <div className={css.envolverDetalhesProjeto}>
                        <h1 className={css.nomeProjeto}>{projeto.nome}</h1>
                        <p className={css.nomeInstituicao}>{projeto.instituicao}</p>

                        <div className={css.secaoChamadaAcao}>
                            <img src="/logoSenna.png" alt="Logo Instituição" className={css.logoInstituicao}
                                 onError={(e) => e.target.src = "https://placehold.co/35x35/png"} />
                            <Buton background="laranja" tamanho="medio" texto="Doar para o Projeto" />
                        </div>
                    </div>
                </section>

                <section className={css.secaoDescricao}>
                    {projeto.descricao.map((paragrafo, index) => (
                        <p key={index}>{paragrafo}</p>
                    ))}
                </section>

                <section className={css.secaoProgresso}>
                    <div className={css.valoresProgresso}>
                        <div>
                            <span className={css.rotuloArrecadado}>Valor Arrecadado: </span>
                            <span className={css.valorArrecadado}>{formatarMoeda(projeto.valorArrecadado)}</span>
                        </div>
                        <div>
                            <span className={css.rotuloMeta}>Meta de Doações: </span>
                            <span className={css.valorMeta}>{formatarMoeda(projeto.metaDoacoes)}</span>
                        </div>
                    </div>
                    <div className={css.containerBarraProgresso}>
                        <span className={css.textoPorcentagem}>{projeto.porcentagem}%</span>
                        <div className={css.fundoBarraProgresso}>
                            <div
                                className={css.preenchimentoBarraProgresso}
                                style={{ width: `${Math.min(projeto.porcentagem, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </section>

                <section className={css.secaoAtualizacoes}>
                    <div className={css.cabecalhoAtualizacoes}>
                        <h2 className={css.tituloAtualizacoes}>Atualizações</h2>
                        <div className={css.envolverBotaoAdicionar}>
                            <Buton background="laranja" tamanho="pequeno" texto="Adicionar" />
                        </div>
                    </div>

                    {projeto.atualizacoes.map((update) => (
                        <div key={update.id} className={css.cardAtualizacao}>
                            <div className={css.infoCabecalhoAtualizacao}>
                                <span>{update.hora}</span>
                                <span>{update.data}</span>
                            </div>
                            <div className={css.conteudoAtualizacao}>
                                <img src={update.imagem} alt={update.titulo} className={css.imagemAtualizacao} />
                                <div className={css.textoAtualizacao}>
                                    <div className={css.cabecalhoInstituicaoAtualizacao}>
                                        <img src="/logoSenna.png" alt="Logo" className={css.logoInstituicaoAtualizacao}
                                             onError={(e) => e.target.src = "https://placehold.co/35x35/png"} />
                                        <span className={css.nomeInstituicaoAtualizacao}>{projeto.instituicao}</span>
                                    </div>
                                    <h3 className={css.tituloAtualizacao}>{update.titulo}</h3>
                                    <p className={css.descricaoAtualizacao}>{update.descricao}</p>
                                    <div className={css.acoesAtualizacao}>
                                        <Buton background="rosa" tamanho="pequeno" texto="Excluir" />
                                        <Buton background="laranja" tamanho="pequeno" texto="Editar" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}