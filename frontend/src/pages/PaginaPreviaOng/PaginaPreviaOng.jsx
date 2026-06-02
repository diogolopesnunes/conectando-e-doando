import Nav from "../../components/Nav/Nav.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "./PaginaPreviaOng.module.css";
import InfoOng from "../../components/InfoOng/InfoOng.jsx";
import SecaoProjetos from "../../components/SecaoProjetos/SecaoProjetos.jsx";
import Titulo from "../../components/Titulo/Titulo.jsx";
import Swal from "sweetalert2";
import Alerts from "../../components/Alerts/Alerts.jsx";

export function PaginaPreviaOng({api}) {
    const {id} = useParams();
    const navigate = useNavigate();
    const [tipoUsuario, setTipoUsuario] = useState("");
    const [ong, setOng] = useState(null);
    const [pagina, setPagina] = useState(1);
    const [proximaPagina, setProximaPagina] = useState(2);
    const [paginaAnterior, setPaginaAnterior] = useState(0);
    const [quantidade, setQuantidade] = useState(0);
    const [mensagem, setMensagem] = useState(null)
    const [idOng, setIdOng] = useState('');
    const [seguindo, setSeguindo] = useState(false);

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
        const resposta = await fetch(`${api}/buscar_ong/${idOng}/${pagina}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
        });
        if (resposta.ok) {
            const retorno = await resposta.json();
            setOng(retorno.ong);
            setPaginaAnterior(retorno.paginaAnterior);
            setQuantidade(retorno.numeroPaginas);
            setProximaPagina(retorno.proximaPagina);
            setIdOng(retorno.ong.id_usuario)
            setSeguindo(retorno.ong.seguindo);
        }
    }

    async function alternarStatusProjeto(idProjeto) {
        const idUsuarioLogado = localStorage.getItem("id_usuario");
        const resposta = await fetch(`${api}/ativar_desativar_projeto/${idUsuarioLogado}/${idProjeto}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
        });
        const retorno = await resposta.json();

        if (retorno.mensagem) {
            setMensagem({
                id: Date.now(),
                texto: retorno.mensagem.descricao,
                tipo: retorno.mensagem.tipo
            });
        }
        ;

        if (retorno.mensagem.tipo === 'sucesso') buscarOng();
    }

    async function excluirProjeto(idProjeto) {
        const idOng = id || localStorage.getItem("id_usuario");
        const result = await Swal.fire({
            title: "Você tem certeza?",
            text: "Esta ação é irreversível!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim, deletar!",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            const resposta = await fetch(`${api}/excluir_projeto/${idOng}/${idProjeto}`, {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
                credentials: "include"
            });
            const retorno = await resposta.json();
            if (retorno.mensagem) {
                setMensagem({
                    id: Date.now(),
                    texto: retorno.mensagem.descricao,
                    tipo: retorno.mensagem.tipo
                });
                buscarOng()
            }
            ;
        }
    }

    useEffect(() => {
        buscarOng();
    }, [id, pagina]);

    return (
        <div className={"m-auto formataAltura " + css.containerPrincipal}>
            <Nav/>
            <div className={css.envoltorioConteudo}>
                <div className={css.acoesCabecalho}>
                    <Buton background="rosa" tamanho="pequeno" texto="Voltar" onClick={() => navigate(-1)}/>
                </div>
                {mensagem && (
                    <Alerts
                        key={mensagem.id}
                        tipo={mensagem.tipo}
                        imagem={`/public/${mensagem.tipo}.png`}
                        duracao={10000}
                        descricao={mensagem.texto}
                    />
                )}
                {!ong ? (
                    <p className="text-center">Carregando ONG...</p>
                ) : (
                    <>
                        <InfoOng
                            rota={'/pagamento'}
                            nomeOng={ong.nome}
                            info={ong}
                            texto={"Doar Agora"}
                            api={api}
                            atualizarSeguimento={(novoValor) => {
                                setOng((prev) => ({
                                    ...prev,
                                    seguindo: novoValor
                                }));
                            }}
                            seguindo={seguindo}
                        />
                        <SecaoProjetos
                            idOng={idOng}
                            projetos={ong.projetos}
                            api={api}
                            excluir={excluirProjeto}
                            alternarStatus={alternarStatusProjeto}
                            idUsuario={id || localStorage.getItem("id_usuario")}
                        />
                    </>
                )}
                {quantidade >= 1 ? (
                    <div className={'col-10 col-sm-3 m-auto d-flex justify-content-between paginas'}>
                        {paginaAnterior !== 0 && (
                            <>
                                <Buton texto={"<"} onClick={() => setPagina(paginaAnterior)} classe={'pagina'}/>
                                <Buton texto={paginaAnterior} onClick={() => setPagina(paginaAnterior)}
                                       classe={'pagina'}/>
                            </>
                        )}

                        {quantidade === 1 ? (
                            <div className={'m-auto'}>
                                <Buton texto={pagina} classe={'paginaSelecionada'} />
                            </div>
                        ) : (
                            <Buton texto={pagina} classe={'paginaSelecionada'} />
                        )}
                        {proximaPagina !== 0 && (
                            <>
                                <Buton texto={proximaPagina} onClick={() => setPagina(proximaPagina)}
                                       classe={'pagina'}/>
                                <Buton texto={">"} onClick={() => setPagina(proximaPagina)} classe={'pagina'}/>
                            </>
                        )}
                    </div>
                ) : (
                    <div className={'m-auto text-center my-5'}><Titulo texto={'Não há projetos cadastrados'}/></div>
                )}
            </div>
        </div>
    );
}