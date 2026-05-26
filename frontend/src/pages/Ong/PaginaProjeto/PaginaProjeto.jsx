import Nav from "../../../components/Nav/Nav.jsx";
import Buton from "../../../components/Buton/Buton.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "./PaginaProjeto.module.css";
import InfoOng from "../../../components/InfoOng/InfoOng.jsx";
import SecaoAtualizacoes from "../../../components/SecaoAtualizacoes/SecaoAtualizacoes.jsx";
import Alerts from "../../../components/Alerts/Alerts.jsx";
import Titulo from "../../../components/Titulo/Titulo.jsx";
import Input from "../../../components/Input/Input.jsx";
import Swal from "sweetalert2";

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
    const [quantidadePost, setQuantidadePost] = useState(0)
    const [idOng, setIdOng] = useState('')
    const [seguindo, setSeguindo] = useState(false);
    const [porcentagem, setPorcentagem] = useState(0)


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
            setIdOng(retorno.projeto.id_ong)
            setSeguindo(retorno.projeto.seguindo);

            const valorArrecadado = retorno.projeto.valor_arrecadado
            const meta = retorno.projeto.meta_doacao
            if (meta > 0){
                setPorcentagem(Number(((valorArrecadado / meta) * 100).toFixed(1)))
            }
            else{
                setPorcentagem(0);
            }
        } else if (retorno.mensagem) {
            alert(retorno.mensagem.descricao || retorno.mensagem.mensagem);
        }
    }

    async function confirmarExclusao() {
        const result = await Swal.fire({
            title: "Você tem certeza?",
            text: "Você não poderá refazer a ação!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim, deletar!",
            cancelButtonText: "Cancelar",
        });

        return result.isConfirmed;
    }

    async function excluirPost(idPost) {
        const confirmou = await confirmarExclusao();
        if (!confirmou) return;

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

    function formatarDinheiro(valor) {
        const numero = Number(valor || 0);

        return numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    return (
        <div className={"m-auto container " + css.containerPrincipal}>
            <Nav />
            <div className={'row'}>
                <div className={'col  px-sm-0'}>
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

                        <div className={css.botaoVoltar}>
                            <Buton onClick={() => navigate(-1)} background="rosa" tamanho="pequeno" texto="Voltar" />
                        </div>

                        {!projeto ? (
                            <p className="text-center">Carregando projeto...</p>
                        ) : (
                            <>
                                <InfoOng
                                    info={projeto}
                                    texto={"Doar Agora"}
                                    api={api}
                                    seguindo={seguindo}
                                    atualizarSeguimento={(novoValor) => {
                                        setSeguindo(novoValor);
                                    }}
                                    rota={"/pagamento"}
                                />
                                <div className={css.containerProgresso}>
                                    <div className={css.valoresMeta}>
                                        <span>
                                            <strong>Valor Arrecadado:</strong>
                                            <span className={css.valorLaranja}>{` R$${formatarDinheiro(projeto.valor_arrecadado)}`}</span>
                                        </span>
                                        <span>
                                            <strong>Meta de Doações:</strong>
                                            <span className={css.valorLaranja}>{` R$${formatarDinheiro(projeto.meta_doacao)}`}</span>
                                        </span>
                                    </div>

                                    <div className={css.barraProgressoContainer}>
                                        <span className={css.porcentagemTexto}>{porcentagem}%</span>
                                            <progress className={`${css.barraFundo} ${porcentagem >= 100 ? css.barraCheia : ""}`} value={Math.min(porcentagem, 100)} max={100}></progress>
                                    </div>
                                </div>


                                <SecaoAtualizacoes
                                    atualizacoes={projeto.atualizacoes || []}
                                    instituicao={projeto.instituicao}
                                    idProjeto={id_projeto}
                                    idOng={idOng}
                                    onExcluir={excluirPost}
                                    onAtivarDesativar={ativarDesativarPost}
                                    quantidade={quantidadePost}
                                    api={api}
                                    logoOng={projeto.logoInstituicao}
                                />

                                {quantidade >= 1 ? (
                                    <div className={'col-12 col-sm-12 m-auto d-flex justify-content-center gap-4 paginas'}>
                                        {paginaAnterior !== 0 && (
                                            <>
                                                <Buton texto={"<"} onClick={() => setPagina(paginaAnterior)} classe={'pagina'} />
                                                {pagina === quantidade && paginaAnterior - 1 !== 0 && <Buton texto={paginaAnterior - 1} onClick={() => setPagina(paginaAnterior - 1)} classe={'pagina'} />}
                                                <Buton texto={paginaAnterior} onClick={() => setPagina(paginaAnterior)} classe={'pagina'} />
                                            </>
                                        )}
                                        {quantidade === 1 ? <div className={'m-auto'}><Buton texto={pagina} classe={'paginaSelecionada'} /></div> : <Buton texto={pagina} classe={'paginaSelecionada'} />}
                                        {proximaPagina !== 0 && (
                                            <>
                                                <Buton texto={proximaPagina} onClick={() => setPagina(proximaPagina)} classe={'pagina'} />
                                                {proximaPagina + 1 <= quantidade && pagina === 1 && <Buton texto={proximaPagina + 1} onClick={() => setPagina(proximaPagina + 1)} classe={'pagina'} />}
                                                <Buton texto={">"} onClick={() => setPagina(proximaPagina)} classe={'pagina'} />
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className={'m-auto text-center my-5'}><Titulo texto={'Não há projetos cadastrados'} /></div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
