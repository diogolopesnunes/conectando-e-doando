import css from "./DashboardAdmOng.module.css";
import { useState, useEffect } from "react";
import Buton from "../../components/Buton/Buton.jsx";
import {Link, useNavigate} from "react-router-dom";
import Nav from "../../components/Nav/Nav.jsx";
import IMask from "imask";
import CardOngAdm from "../../components/CardOngAdm/CardOngAdm.jsx";
import Titulo from "../../components/Titulo/Titulo.jsx";
import Alerts from "../../components/Alerts/Alerts.jsx";
import Input from "../../components/Input/Input.jsx";

export default function DashboardAdmOng({ api }) {
    const [id, setId] = useState(localStorage.getItem("id_usuario"));
    const [ongs, setOngs] = useState([]);
    const [aprovacao, setAprovacao] = useState(1);
    const [pagina, setPagina] = useState(1);
    const [proximaPagina, setProximaPagina] = useState(0);
    const [paginaAnterior, setPaginaAnterior] = useState(0);
    const [quantidade, setQuantidade] = useState(0);
    const navigate = useNavigate();
    const [filtro, setFiltro] = useState('');

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
        const resposta = await fetch(`${api}/listar_ong_adm/${pagina}/${aprovacao}?nome=${filtro}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });
        const retorno = await resposta.json();
        console.log(retorno)
        if (retorno.ongs) {
            setOngs(retorno.ongs);
            setProximaPagina(retorno.proximaPagina);
            setPaginaAnterior(retorno.paginaAnterior);
            setQuantidade(retorno.numeroPaginas);
        }
    }



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

    useEffect(() => {
        if (mensagem) {
            const timer = setTimeout(() => {
                setMensagem(null);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [mensagem]);

    useEffect(() => {
        listarOngs();
    }, [pagina, aprovacao, filtro, mensagem]);

    return (
        <section className={'container m-auto'}>
            <div className={'row'}>
                <div className={'col-12'}><Nav />
                    {mensagem && (
                        <Alerts
                            key={mensagem.id}
                            tipo={mensagem.tipo}
                            imagem={`/public/${mensagem.tipo}.png`}
                            duracao={10000}
                            descricao={mensagem.texto}
                        />
                    )}
                </div>
                <div className={'d-flex justify-content-center gap-4 align-items-center'}>
                    {aprovacao == 1 ? (
                        <div>
                            <div className={'d-none d-sm-flex gap-3'}>
                                <Buton texto={'Ongs para aprovação'} background={'branco'} tamanho={'medio'} onClick={() => trocarFiltro(0)} />
                                <Buton texto={'Ongs aprovadas/recusadas'} background={'rosa'} tamanho={'medio'} onClick={() => trocarFiltro(1)} />
                            </div>
                            <div className={'d-block d-sm-none'}>
                                <Buton texto={'Aprovação'} background={'branco'} tamanho={'medio'} onClick={() => trocarFiltro(0)} />
                                <Buton texto={'Aprovadas'} background={'rosa'} tamanho={'medio'} onClick={() => trocarFiltro(1)} />
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
                                <Buton texto={'Aprovadas'} background={'branco'} tamanho={'medio'} onClick={() => trocarFiltro(1)} />
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <Input
                        tipoInp={'text'}
                        htmlFor={'projetos'}
                        placeholder={'Digite o nome para o filtro'}
                        value={filtro}
                        funcao={(e) => {
                            setFiltro(e.target.value);
                            setPagina(1);
                        }}

                    />
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
                    {quantidade >= 1 ? (
                        <div className={'col-10 col-sm-3 m-auto d-flex justify-content-between paginas'}>
                            {paginaAnterior !== 0 && (
                                <>
                                    <Buton texto={"<"} onClick={() => setPagina(paginaAnterior)} classe={'pagina'} />
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
                                    <Buton texto={">"} onClick={() => setPagina(proximaPagina)} classe={'pagina'} />
                                </>
                            )}
                        </div>
                    ) : (
                        aprovacao == 1 ?(
                            <div className={'m-auto text-center mt-5 pt-5'}><Titulo texto={'Não há ongs cadastradas'} /></div>
                        ):(
                            <div className={'m-auto text-center mt-5 pt-5'}><Titulo texto={'Não há ongs para analise'} /></div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}
