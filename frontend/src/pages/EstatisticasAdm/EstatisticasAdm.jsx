import { useEffect, useState } from "react";
import Nav from "../../components/Nav/Nav.jsx";
import css from "./EstatisticasAdm.module.css";
import CardEstatistica from "../../components/CardEstatistica/CardEstatistica.jsx";
import Alerts from "../../components/Alerts/Alerts.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import Input from "../../components/Input/Input.jsx";
import CardOngAdm from "../../components/CardOngAdm/CardOngAdm.jsx";
import Titulo from "../../components/Titulo/Titulo.jsx";
import GraficoEstatisticasAdm from "../../components/GraficoEstatisticasAdm/GraficoEstatisticasAdm.jsx";
import {useNavigate} from "react-router-dom";

export default function EstatisticaAdm({api}) {
    const navigate = useNavigate()
    const [id,setId] = useState("");

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("id_usuario") || localStorage.getItem("tipo_usuario") != 2) {
            navigate('/login');
        } else {
            setId(localStorage.getItem("id_usuario"));
        }
    }, [navigate]);
    const [valorDoacoes, setValorDoacoes] = useState('');
    const monetario = {
        0:'Mil',
        1:'Mi',
        2:'B',
        3:'T'
    }

    const [estatisticas, setEstatisticas] = useState({
        valor_total_doacoes: 0,
        novos_doadores: 0,
        novas_ongs: 0,
        dados_grafico: []
    });

    const [ano, setAno] = useState(new Date().getFullYear());
    const [listaAnos, setListaAnos] = useState([]);
    const esteAno = new Date().getFullYear()
    const [mensagem,setMensagem] = useState('')

    useEffect(() => {
        buscarEstatisticas();
    }, [ano]);

    async function buscarEstatisticas() {
        try {

            const resposta = await fetch(
                `${api}/estatisticas_admin?ano=${ano}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            const retorno = await resposta.json();

            if (resposta.ok) {

                setEstatisticas(retorno.estatisticas);
                var quantidade = -1
                var valorTotal = retorno.estatisticas.valor_total_doacoes
                while (valorTotal >= 1000){
                    if (quantidade == 3){
                        break
                    }
                    valorTotal = (valorTotal/1000).toFixed(3)
                    quantidade++
                }
                if (quantidade == -1){
                    setValorDoacoes(`${valorTotal}`)
                } else {
                    setValorDoacoes(`${valorTotal} ${monetario[quantidade]}`)
                }
                setListaAnos(retorno.estatisticas.anos)
            }

        } catch (erro) {
            console.log(erro);
        }
    }

    async function baixarRelatorio() {
        try {
            const resposta = await fetch(`${api}/gerar_relatorio?${ano}`, {
                method: "GET",
                credentials: "include"
            });

            // const retorno = await resposta.json();
            // const retorno = await resposta.blob();
            // console.log(retorno)
            // if (!resposta.ok) {
            //     return;
            // }
            // if (retorno.mensagem) {
            //     setMensagem({
            //         ...retorno.mensagem,
            //         id: Date.now()
            //     });
            // }

            const blob = await resposta.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "relatorio_admin.pdf";
            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (erro) {
            console.log(erro);
        }
    }

    return (
        <>
            <Nav />

            <div className={"row justify-content-center align-items-center m-auto flex-md-row flex-column formataAltura"}>
                {mensagem && (
                    <div className="col-12">
                        <Alerts
                            key={mensagem.id}
                            tipo={mensagem.tipo}
                            imagem={`/public/${mensagem.tipo}.png`}
                            duracao={10000}
                            descricao={mensagem.descricao}
                        />
                    </div>
                )}
                <section className={"col-4 d-flex justify-content-center align-items-center flex-column " + css.containerEstatisticas}>

                    <CardEstatistica texto={"Total de doações do ano:"} valor={`R$${valorDoacoes.replace(".", ",")}`} />

                    <CardEstatistica texto={"Número de doadores novos no ano:"} valor={estatisticas.novos_doadores} />

                    <CardEstatistica texto={"Número de ONGs novas no ano:"} valor={estatisticas.novas_ongs} />

                    <Buton
                        texto="Gerar relatório"
                        background="laranja"
                        tamanho="medio"
                        onClick={baixarRelatorio}
                    />

                </section>

                <div className={"col-10 col-sm-8 d-flex justify-content-center align-items-center m-auto flex-column" }>
                    <select className={"w-75 m-auto px-2 mt-3"} onChange={(e) => setAno(Number(e.target.value))}>
                        {listaAnos.map((ano) => (
                            ano == esteAno ? (
                                <option selected={true} key={ano} value={ano} >{ano}</option>
                            ) : (
                                <option key={ano} value={ano} >{ano}</option>
                            )
                        ))}
                    </select>
                    <GraficoEstatisticasAdm
                        dados={estatisticas.dados_grafico || []}
                    />
                </div>
            </div>
        </>
    );
}