import css from "./DashboardAdmOng.module.css"
import {useState, useEffect} from "react";
import Buton from "../../components/Buton/Buton.jsx";
import {useNavigate} from "react-router-dom";
import Nav from "../../components/Nav/Nav.jsx";
import IMask from "imask";
import CardOngAdm from "../../components/CardOngAdm/CardOngAdm.jsx";
import Titulo from "../../components/Titulo/Titulo.jsx";



export default function DashboardAdmOng({api}) {
    const [email, setEmail] = useState("");
    const [nome, setNome] = useState("");
    const [id, setId] = useState("");
    const [ongs, setOngs] = useState([]);
    const [aprovacao, setAprovacao] = useState(1);
    // const [pagina, setPagina] = useState(1)
    // const [proximaPagina, setProximaPagina] = useState(2)
    // const [paginaAnterior, setPaginaAnterior] = useState(0)
    // const [quantidade, setQuantidade] = useState(0)

    const navigate = useNavigate();

    const ongsNaoAprovadas = ongs.filter((ong) => Number(ong.situacao) === 4 || Number(ong.situacao) === 0);
    const ongsAprovadasEReprovadas = ongs.filter((ong) => Number(ong.situacao) !== 4 && Number(ong.situacao) !== 0);

    function formatarCNPJ(valor) {
        const mask = IMask.createMask({
            mask: "00.000.000-0000-00"
        });

        mask.resolve(String(valor));
        return mask.value;
    }

    function formatarTelefone(valor){
        const mask = IMask.createMask({
            mask: "(00) 00000-0000"
        });

        mask.resolve(String(valor));
        return mask.value;
    }

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
            navigate('/login')
        } else{
            setNome(localStorage.getItem("nome"));
            setEmail(localStorage.getItem("email"));
            setId(localStorage.getItem("id_usuario"));
        }
    }, [])

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("id_usuario") || localStorage.getItem("tipo_usuario") != 2) {
            navigate('/login')
        }
    }, [])

    async function listarOngs() {
        let listagemOngs = await fetch(`${api}/listar_ong_adm`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        })

        let listaOngs = await listagemOngs.json();

        console.log(listaOngs)
        console.log(listaOngs.mensagem)

        let ongsFormatado = listaOngs.ongs

        setOngs(ongsFormatado)
    }

    useEffect(() => {
        listarOngs();
    }, []);


    useEffect(() => {
        console.log(ongsNaoAprovadas);
    }, [ongsNaoAprovadas])
    return (
        <section className={'container m-auto'}>
            <div className={'row'}>
                <div className={'col-12'}>
                    <Nav/>
                </div>
                <div className={'d-flex justify-content-center align-items-center m-auto'}>
                    {aprovacao == 1 ? (
                        <div>
                            <div className={'d-none d-sm-flex gap-3'}>
                                <Buton texto={'Ongs para aprovação'} background={'branco'} tamanho={'medio'} onClick={() => setAprovacao(0)}/>
                                <Buton texto={'Ongs aprovadas/recusadas'} background={'rosa'} tamanho={'medio'} onClick={() => setAprovacao(1)}/>
                            </div>
                            <div className={'d-block d-sm-none'}>
                                <Buton texto={'Aprovação'} background={'branco'} tamanho={'medio'} onClick={() => setAprovacao(0)}/>
                                <Buton texto={'Recusadas'} background={'rosa'} tamanho={'medio'} onClick={() => setAprovacao(1)}/>
                            </div>
                        </div>
                    ):(
                        <div>
                            <div className={'d-none d-sm-flex gap-3'}>
                                <Buton texto={'Ongs para aprovação'} background={'rosa'} tamanho={'medio'} onClick={() => setAprovacao(0)}/>
                                <Buton texto={'Ongs aprovadas/recusadas'} background={'branco'} tamanho={'medio'} onClick={() => setAprovacao(1)}/>
                            </div>
                            <div className={'d-block d-sm-none'}>
                                <Buton texto={'Aprovação'} background={'rosa'} tamanho={'medio'} onClick={() => setAprovacao(0)}/>
                                <Buton texto={'Recusadas'} background={'branco'} tamanho={'medio'} onClick={() => setAprovacao(1)}/>
                            </div>
                        </div>
                    )}

                </div>
                <div className={"formataAltura m-auto col-12 " + css.containerPrevia}>
                    {aprovacao == 0 ? (
                        <div className={"row d-flex justify-content-center align-items-center gap-3"}>
                            {ongsNaoAprovadas.map((ong) => (
                                <div key={ong.id} className={"row m-auto d-flex " + css.cardBonito}>
                                    <CardOngAdm id={ong.id_usuario} cnpj={formatarCNPJ(ong.cpf_cpnj)} telefone={formatarTelefone(ong.telefone)} nomeOng={ong.nome} registro={ong.data_hora_registro} descricao={ong.descricao_causa} situacao={ong.situacao}/>
                                </div>
                            ))}
                        </div>
                    ):(

                        <div className={"row d-flex justify-content-center align-items-center gap-3"}>
                            {ongsAprovadasEReprovadas.map((ong) => (
                                <div key={ong.id} className={"row m-auto d-flex " + css.cardBonito}>
                                    <CardOngAdm id={ong.id_usuario} cnpj={formatarCNPJ(ong.cpf_cpnj)} telefone={formatarTelefone(ong.telefone)} nomeOng={ong.nome} registro={ong.data_hora_registro} descricao={ong.descricao_causa} situacao={ong.situacao}/>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/*{quantidade >= 1 ?(*/}
                {/*    <div className={'col-10 col-sm-3 m-auto d-flex justify-content-between paginas'}>*/}

                {/*        {paginaAnterior !== 0 && (*/}
                {/*            <>*/}
                {/*                <Buton texto={"<"} onClick={() => setPagina(paginaAnterior)} classe={'pagina'} />*/}
                {/*                {pagina == quantidade && paginaAnterior-1 !== 0 && (*/}
                {/*                    <Buton texto={paginaAnterior-1} onClick={() => setPagina(paginaAnterior-1)} classe={'pagina'} />*/}
                {/*                )}*/}
                {/*                <Buton texto={paginaAnterior} onClick={() => setPagina(paginaAnterior)} classe={'pagina'} />*/}
                {/*            </>*/}
                {/*        )}*/}
                {/*        {quantidade == 1 ? (*/}
                {/*            <div className={'m-auto'}><Buton texto={pagina} classe={'paginaSelecionada'}/></div>*/}
                {/*        ) : (*/}
                {/*            <Buton texto={pagina} classe={'paginaSelecionada'}/>*/}
                {/*        )}*/}

                {/*        {proximaPagina !== 0 && (*/}
                {/*            <>*/}
                {/*                <Buton texto={proximaPagina} onClick={() => setPagina(proximaPagina)} classe={'pagina'}/>*/}
                {/*                {proximaPagina+1 <= quantidade && pagina == 1 && (*/}
                {/*                    <Buton texto={proximaPagina+1} onClick={() => setPagina(proximaPagina+1)} classe={'pagina'}/>*/}
                {/*                )}*/}
                {/*            </>*/}
                {/*        )}*/}

                {/*        {proximaPagina !== 0 && (*/}
                {/*            <Buton texto={">"} onClick={() => setPagina(proximaPagina)} classe={'pagina'} />*/}
                {/*        )}*/}
                {/*    </div>*/}
                {/*) : (*/}
                {/*    <div className={'m-auto text-center my-5'}>*/}
                {/*        <Titulo texto={'Não há ongs cadastradas'}/>*/}
                {/*    </div>*/}
                {/*)}*/}
            </div>

        </section>
    )
}