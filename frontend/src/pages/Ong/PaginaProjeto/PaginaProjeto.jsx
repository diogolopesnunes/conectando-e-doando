import Nav from "../../../components/Nav/Nav.jsx";
import Buton from "../../../components/Buton/Buton.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "./PaginaProjeto.module.css";
import InfoOng from "../../../components/InfoOng/InfoOng.jsx";
import SecaoAtualizacoes from "../../../components/SecaoAtualizacoes/SecaoAtualizacoes.jsx";
import Alerts from "../../../components/Alerts/Alerts.jsx";

export default function PaginaProjeto({ api, info }) {
    const { id_projeto } = useParams();
    const navigate = useNavigate();
    const [idUsuario, setIdUsuario] = useState(localStorage.getItem("id_usuario"));
    const [projeto, setProjeto] = useState(null);
    const [pagina, setPagina] = useState(1);
    const [proximaPagina, setProximaPagina] = useState(0);
    const [paginaAnterior, setPaginaAnterior] = useState(0);
    const [quantidade, setQuantidade] = useState(0);
    const [loadingExcluir, setLoadingExcluir] = useState(false);
    const [loadingAtivarDesativar, setLoadingAtivarDesativar] = useState(false);
    const [mensagem, setMensagem] = useState(null)
    const[quantidadePost, setQuantidadePost] = useState(0)

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
            navigate('/login');
        } else {
            setIdUsuario(localStorage.getItem("id_usuario"));
        }
    }, [navigate]);

    async function buscarProjeto() {
        const resposta = await fetch(`${api}/detalhar_projeto/${id_projeto}/${pagina}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });
        const retorno = await resposta.json();
        if (retorno.projeto) {
            setProjeto(retorno.projeto);
            setProximaPagina(retorno.proximaPagina);
            setPaginaAnterior(retorno.paginaAnterior);
            setQuantidade(retorno.numeroPaginas);
            setQuantidadePost(retorno.quantidade)
        } else if (retorno.mensagem) {
            alert(retorno.mensagem.descricao || retorno.mensagem.mensagem);
        }
    }

    async function excluirPost(idPost) {

        setLoadingExcluir(true);
        const resposta = await fetch(`${api}/excluir_post/${idUsuario}/${id_projeto}/${idPost}`, {
            method: "DELETE",
            credentials: "include"
        });
        const retorno = await resposta.json();
        if (retorno.mensagem) {
            setMensagem({
                id: Date.now(),
                texto: retorno.mensagem.descricao,
                tipo: retorno.mensagem.tipo
            });
        }
        setLoadingExcluir(false);
        buscarProjeto();
    }

    async function ativarDesativarPost(idPost) {
        setLoadingAtivarDesativar(true);
        const resposta = await fetch(`${api}/ativar_desativar_post/${idUsuario}/${id_projeto}/${idPost}`, {
            method: "PUT",
            credentials: "include"
        });
        const retorno = await resposta.json();
        if (retorno.mensagem) {
            setMensagem({
                id: Date.now(),
                texto: retorno.mensagem.descricao,
                tipo: retorno.mensagem.tipo
            });
        }
        setLoadingAtivarDesativar(false);
        buscarProjeto();
    }

    useEffect(() => {
        if (id_projeto) buscarProjeto();
    }, [id_projeto, pagina]);

    return (
        <div className={"m-auto container " + css.containerPrincipal}>
            <Nav />
            <div className={'row'}>
                <div className={'col px-3 px-sm-0'}>
                    <div className={css.conteudo}>

                        {mensagem && (
                            <Alerts
                                key={mensagem.id}
                                tipo={mensagem.tipo}
                                imagem={`/public/${mensagem.tipo}.png`}
                                duracao={10000}
                                descricao={mensagem.texto}
                            />
                        )}

                        <div className={css.acoesCabecalho}>
                            <Buton onClick={() => navigate(-1)} background="rosa" tamanho="pequeno" texto="Voltar" />
                        </div>

                        {!projeto ? (
                            <p className="text-center">Carregando projeto...</p>
                        ) : (
                            <>
                                <InfoOng info={projeto} texto={'Fazer doação'} api={api} />
                                <SecaoAtualizacoes

                                    atualizacoes={projeto.atualizacoes || []}
                                    instituicao={projeto.instituicao}
                                    idProjeto={id_projeto}
                                    onExcluir={excluirPost}
                                    onAtivarDesativar={ativarDesativarPost}
                                    quantidade={quantidadePost}
                                    api={api}
                                    logoOng={projeto.logoInstituicao}
                                />

                                {quantidade > 1 && (
                                    <div className={'col-10 col-sm-3 m-auto d-flex justify-content-between paginas'}>
                                        {paginaAnterior !== 0 && <Buton texto={"<"} onClick={() => setPagina(paginaAnterior)} classe={'pagina'} />}
                                        <Buton texto={pagina} classe={'paginaSelecionada'} />
                                        {proximaPagina !== 0 && <Buton texto={">"} onClick={() => setPagina(proximaPagina)} classe={'pagina'} />}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
