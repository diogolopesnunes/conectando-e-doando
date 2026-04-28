import Nav from "../../components/Nav/Nav.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "./PaginaPreviaOng.module.css";
import InfoOng from "../../components/InfoOng/InfoOng.jsx";
import SecaoProjetos from "../../components/SecaoProjetos/SecaoProjetos.jsx";
import Titulo from "../../components/Titulo/Titulo.jsx";

export default function PaginaPreviaOng({ api }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tipoUsuario, setTipoUsuario] = useState("");
    const [ong, setOng] = useState(null);

    const [pagina, setPagina] = useState(1);
    const [proximaPagina, setProximaPagina] = useState(2);
    const [paginaAnterior, setPaginaAnterior] = useState(0);
    const [quantidade, setQuantidade] = useState(0);

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
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!resposta.ok) {
            console.log("Erro na requisição");
            return;
        }

        const retorno = await resposta.json();
        if (retorno.ong) {
            setOng(retorno.ong);
            setPaginaAnterior(retorno.paginaAnterior);
            // setQuantidade(retorno.quantidade);
            setQuantidade(retorno.numeroPaginas)
            setProximaPagina(retorno.proximaPagina)
        }
    }

    useEffect(() => {
        buscarOng();
    }, [id, pagina]);
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
                {quantidade >= 1 ? (
                    <div className={'col-10 col-sm-3 m-auto d-flex justify-content-between paginas'}>
                        {paginaAnterior !== 0 && (
                            <>
                                <Buton texto={"<"} onClick={() => setPagina(paginaAnterior)} classe={'pagina'} />
                                {pagina === quantidade && paginaAnterior - 1 !== 0 && <Buton texto={paginaAnterior - 1} onClick={() => setPagina(paginaAnterior - 1)} classe={'pagina'} />}
                                <Buton texto={paginaAnterior} onClick={() => setPagina(paginaAnterior)} classe={'pagina'} />
                            </>
                        )}
                        {quantidade === 1 ? (
                            <div className={'m-auto'}><Buton texto={pagina} classe={'paginaSelecionada'} /></div>
                        ) : (
                            <Buton texto={pagina} classe={'paginaSelecionada'} />
                        )}
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
            </div>
        </div>
    );
}
