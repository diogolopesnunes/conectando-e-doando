import css from "./DashboardAdmOng.module.css";
import { useState, useEffect } from "react";
import Buton from "../../components/Buton/Buton.jsx";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/Nav/Nav.jsx";
import IMask from "imask";
import CardOngAdm from "../../components/CardOngAdm/CardOngAdm.jsx";
import Titulo from "../../components/Titulo/Titulo.jsx";
import Alerts from "../../components/Alerts/Alerts.jsx";

export default function DashboardAdmOng({ api }) {
    const [id, setId] = useState(localStorage.getItem("id_usuario"));
    const [ongs, setOngs] = useState([]);
    const [aprovacao, setAprovacao] = useState(1);
    const [pagina, setPagina] = useState(1);
    const [proximaPagina, setProximaPagina] = useState(0);
    const [paginaAnterior, setPaginaAnterior] = useState(0);
    const [quantidade, setQuantidade] = useState(0);
    const navigate = useNavigate();

    function formatarCNPJ(valor = "") {
        const mask = IMask.createMask({ mask: "00.000.000/0000-00" });
        mask.resolve(String(valor || ""));
        return mask.value;
    }

    function formatarTelefone(valor = "") {
        const mask = IMask.createMask({ mask: "(00) 00000-0000" });
        mask.resolve(String(valor || ""));
        return mask.value;
    }

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("id_usuario") || localStorage.getItem("tipo_usuario") != 2) {
            navigate('/login');
        } else {
            setId(localStorage.getItem("id_usuario"));
        }
    }, [navigate]);

    async function listarOngs() {
        const resposta = await fetch(`${api}/listar_ong_adm/${pagina}/${aprovacao}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });
        const retorno = await resposta.json();
        if (retorno.ongs) {
            setOngs(retorno.ongs);
            setProximaPagina(retorno.proximaPagina);
            setPaginaAnterior(retorno.paginaAnterior);
            setQuantidade(retorno.numeroPaginas);
        }
    }

    useEffect(() => {
        listarOngs();
    }, [pagina, aprovacao]);

    function trocarFiltro(valor) {
        setAprovacao(valor);
        setPagina(1);
    }

    const [mensagem, setMensagem] = useState(null);

    function mostrarMensagem(msg) {
        setMensagem({
            id: Date.now(),
            texto: msg.descricao,
            tipo: msg.tipo
        });
    }

    return (
        <section className={'container m-auto'}>
            <div className={'row'}>
                <div className={'col-12'}><Nav /></div>
                <div className={'d-flex justify-content-center align-items-center m-auto'}>
                    {aprovacao == 1 ? (
                        <div>
                            <div className={'d-none d-sm-flex gap-3'}>
                                <Buton texto={'Ongs para aprovação'} background={'branco'} tamanho={'medio'} onClick={() => trocarFiltro(0)} />
                                <Buton texto={'Ongs aprovadas/recusadas'} background={'rosa'} tamanho={'medio'} onClick={() => trocarFiltro(1)} />
                            </div>
                            <div className={'d-block d-sm-none'}>
                                <Buton texto={'Aprovação'} background={'branco'} tamanho={'medio'} onClick={() => trocarFiltro(0)} />
                                <Buton texto={'Recusadas'} background={'rosa'} tamanho={'medio'} onClick={() => trocarFiltro(1)} />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className={'d-none d-sm-flex gap-3'}>
                                <Buton texto={'Ongs para aprovação'} background={'rosa'} tamanho={'medio'} onClick={() => trocarFiltro(0)} />
                                <Buton texto={'Ongs aprovadas/recusadas'} background={'branco'} tamanho={'medio'} onClick={() => trocarFiltro(1)} />
                            </div>
                            <div className={'d-block d-sm-none'}>
                                <Buton texto={'Aprovação'} background={'rosa'} tamanho={'medio'} onClick={() => trocarFiltro(0)} />
                                <Buton texto={'Recusadas'} background={'branco'} tamanho={'medio'} onClick={() => trocarFiltro(1)} />
                            </div>
                        </div>
                    )}
                </div>

                <div className={"formataAltura m-auto col-12 " + css.containerPrevia}>
                    <div className={"row d-flex justify-content-center align-items-center gap-3"}>
                        {ongs.map((ong) => (
                            <div key={ong.id_usuario} className={"row m-auto d-flex " + css.cardBonito}>
                                <CardOngAdm
                                    id={ong.id_usuario}
                                    cnpj={formatarCNPJ(ong.cpf_cnpj)}
                                    telefone={formatarTelefone(ong.telefone)}
                                    nomeOng={ong.nome}
                                    registro={ong.data_hora_registro}
                                    descricao={ong.descricao_causa}
                                    situacao={ong.situacao}
                                    api={api}
                                    idAdm={id}
                                    onAtualizar={listarOngs}
                                    onMensagem={mostrarMensagem}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {quantidade >= 1 ? (
                    <div className={'col-10 col-sm-3 m-auto d-flex justify-content-between paginas'}>
                        {paginaAnterior !== 0 && (
                            <>
                                <Buton texto={"<"} onClick={() => setPagina(paginaAnterior)} classe={'pagina'} />
                                <Buton texto={paginaAnterior} onClick={() => setPagina(paginaAnterior)} classe={'pagina'} />
                            </>
                        )}
                        <Buton texto={pagina} classe={'paginaSelecionada'} />
                        {proximaPagina !== 0 && (
                            <>
                                <Buton texto={proximaPagina} onClick={() => setPagina(proximaPagina)} classe={'pagina'} />
                                <Buton texto={">"} onClick={() => setPagina(proximaPagina)} classe={'pagina'} />
                            </>
                        )}
                    </div>
                ) : (
                    <div className={'m-auto text-center my-5'}><Titulo texto={'Não há ongs cadastradas'} /></div>
                )}
            </div>
        </section>
    );
}
