import Nav from "../../components/Nav/Nav.jsx";
import {useEffect, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import Doacao from "../../components/Doacao/Doacao.jsx";
import Input from "../../components/Input/Input.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import Alerts from "../../components/Alerts/Alerts.jsx";
import GraficoHistoricoOng from "../../components/GraficoHistoricoOng/GraficoHistoricoOng.jsx";
import GraficoHistoricoDoador from "../../components/GraficoHistoricoDoador/GraficoHistoricoDoador.jsx";

export default function Historico({api}){
    const { id_ong } = useParams();
    const { id_doador } = useParams();

    const [tipoUsuario, setTipoUsuario] = useState(localStorage.getItem('tipo_usuario'));
    const [idUsuario,setIdUsuario] = useState('');
    const [historico, setHistorico] = useState(null)
    const navigate = useNavigate()
    const [filtro, setFiltro] = useState('');
    const [pagina,setPagina] = useState(1)
    const [proximaPagina, setProximaPagina] = useState(2);
    const [paginaAnterior, setPaginaAnterior] = useState(0);
    const [quantidade, setQuantidade] = useState(0);
    const [mensagem, setMensagem] = useState(null);
    const [estatisticas, setEstatisticas] = useState([]);
    const [dadosGrafico, setDadosGrafico] = useState([]);
    const [ano, setAno] = useState(new Date().getFullYear());
    const [anoRegistro, setAnoRegistro] = useState('');
    const [listaAnos, setListaAnos] = useState([]);
    const esteAno = new Date().getFullYear()
    const [dadosGraficoDoador, setDadosGraficoDoador] = useState([]);
    const local = useLocation();
    const [filtroso, setFiltroso] = useState('');

    useEffect(() => {

        if (
            !localStorage.getItem("email") ||
            !localStorage.getItem("id_usuario")
        ) {
            navigate("/login");
        } else {
            setIdUsuario(localStorage.getItem("id_usuario"));
        }

    }, [navigate]);

    async function listarHistorico() {
        try {
            var rota=`${api}/historico/${pagina}?nome=${filtro}&filtroso=${filtroso}`
            if(id_ong){
                rota += `&id_usuario=${id_ong}`
            }
            if(id_doador){
                rota += `&id_usuario=${id_doador}`
            }
            const resposta = await fetch(
                `${rota}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                }
            );
            const retorno = await resposta.json();
            if (retorno.historico){
                setHistorico(retorno.historico)
                setQuantidade(retorno.numeroPaginas);
                setProximaPagina(retorno.proximaPagina);
                setPaginaAnterior(retorno.paginaAnterior);
                setAnoRegistro(retorno.data_hora)
                setListaAnos(retorno.anos)
            }
            if (retorno.mensagem){
                setMensagem({
                    ...retorno.mensagem,
                    id: Date.now()
                });
            }
        } catch (erro) {
            console.log(erro);
        }
    }

    useEffect(() => {
        setHistorico([])
        listarHistorico();
        carregarGrafico()
    }, [filtro, pagina])

    useEffect(() => {
        setHistorico([])
        listarHistorico();
    }, [filtroso]);

    useEffect(() => {
        carregarGrafico()
        carregarGraficoDoador()
    }, [ano]);

    async function carregarGrafico(){
        try {
            var rota = `${api}/grafico_ong?ano=${ano}`
            if(id_ong){
                rota += `&id_usuario=${id_ong}`
            }
            const resposta = await fetch(
                `${rota}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                }
            );
            const retorno = await resposta.json();
            if (retorno.estatisticas){
                setEstatisticas(retorno.estatisticas)
                setDadosGrafico(retorno.estatisticas.dados_grafico)
            }
            if (retorno.mensagem){
                setMensagem({
                    ...retorno.mensagem,
                    id: Date.now()
                });
            }
        } catch (erro) {
            console.log(erro);
        }
    }async function carregarGraficoDoador(){
        try {
            var rota = `${api}/grafico_doador?ano=${ano}`
            if(id_doador){
                rota += `&id_usuario=${id_doador}`
            }
            const resposta = await fetch(
                `${rota}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                }
            );
            const retorno = await resposta.json();
            if (retorno.estatisticas){
                setEstatisticas(retorno.estatisticas)
                setDadosGraficoDoador(retorno.estatisticas.dados_grafico)
                console.log(retorno.estatisticas.dados_grafico)
            }
            if (retorno.mensagem){
                setMensagem({
                    ...retorno.mensagem,
                    id: Date.now()
                });
            }
        } catch (erro) {
            console.log(erro);
        }
    }
    async function gerarRelatorio() {
        try {

            let rota = `${api}/gerar_relatorio`;

            if (id_ong) {
                rota += `?id_usuario=${id_ong}`;
            }

            const resposta = await fetch(
                rota,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (!resposta.ok) {

                const erro = await resposta.json();

                setMensagem(erro.mensagem);

                return;
            }

            const blob = await resposta.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;

            link.download = "relatorio.pdf";

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (erro) {

            console.log(erro);
        }
    }

    return (
        <div className={'container m-auto formataAltura'}>
            <div className={'row'}>
                <Nav/>
                {mensagem && (
                    <div className={'col-12'}>
                        <Alerts
                            key={mensagem.id}
                            tipo={mensagem.tipo}
                            imagem={`./public/${mensagem.tipo}.png`}
                            duracao={10000}
                            descricao={mensagem.descricao}
                        />
                    </div>
                )}
                <div className={'col-12 col-sm-9 m-auto d-flex justify-content-center flex-column'}>
                    <select className={"w-75 m-auto px-2"} onChange={(e) => setAno(Number(e.target.value))}>
                        {listaAnos.map((ano) => (
                            ano == esteAno ? (
                                <option selected={true} key={ano} value={ano} >{ano}</option>
                            ) : (
                                <option key={ano} value={ano} >{ano}</option>
                            )
                        ))}
                    </select>

                    {tipoUsuario != 1 && (local.pathname.includes('historico_doador') || local.pathname.includes('Historico_doador')) ? (
                        <GraficoHistoricoDoador dados={dadosGraficoDoador}/>
                    ) : (
                        <GraficoHistoricoOng dados={dadosGrafico}/>
                    )}

                </div>
                <div className={'col-9 m-auto d-flex align-items-center'}>


                    <Input
                        tipoInp={'text'}
                        htmlFor={'projetos'}
                        placeholder={'Digite o nome para o filtro'}
                        value={filtro}
                        funcao={(e) => {
                            setFiltro(e.target.value);
                        }}
                    />
                    <select className={'py-1 px-2'} onChange={(e) => setFiltroso(Number(e.target.value))}>
                        <option value={2}>Geral</option>
                        <option value={0}>Doações para a ONG</option>
                        <option value={1}>Doações para projetos</option>
                    </select>
                </div>
                <Buton
                    texto={"Gerar Relatório"}
                    background={"laranja"}
                    tamanho={"medio"}
                    onClick={gerarRelatorio}
                />
                <div className={'col-10 col-sm-9 m-auto'}>
                    <div className={'row'}>
                        {historico ? (
                            historico.map((info)=>(
                                <Doacao
                                    key={`${info.id_doador}-${info.id_ong}-${info.data}-${info.hora}`}
                                    ong={info.nome_ong}
                                    projeto={info.nome_projeto}
                                    nome={info.nome_doador}
                                    email={info.email_doador}
                                    valor={info.valor}
                                    data={`${info.data} às ${info.hora}`}
                                    idOng={info.id_ong}
                                    idDoador={info.id_doador}
                                    tipoUsuario={tipoUsuario}
                                />
                            ))
                        ) : (
                            <p className={'text-center'}>Não há pagamentos</p>
                        )}
                        {quantidade >= 1 && (
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
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}