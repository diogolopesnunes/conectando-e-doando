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

export default function EstatisticaAdm({api}) {
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

    useEffect(() => {
        buscarEstatisticas();
    }, []);

    async function buscarEstatisticas() {

        try {

            const resposta = await fetch(
                `${api}/estatisticas_admin`,
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
                setValorDoacoes(`${valorTotal} ${monetario[quantidade]}`)
                console.log(`${valorTotal} ${monetario[quantidade]}`)
                setListaAnos(retorno.estatisticas.anos)
                console.log(retorno.estatisticas.anos)
            }

        } catch (erro) {
            console.log(erro);
        }
    }

    async function baixarRelatorio() {
        try {
            const resposta = await fetch(`${api}/gerar_relatorio`, {
                method: "GET",
                credentials: "include"
            });

            if (!resposta.ok) {
                const retorno = await resposta.json();
                alert(retorno.mensagem.descricao);
                return;
            }

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

            <div className={"row justify-content-center align-items-center m-auto flex-md-row flex-column "}>
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

                <div className={"col-8 d-flex justify-content-center align-items-center m-auto flex-column" }>
                    <select className={"w-50 m-auto px-2 mt-3"} onChange={(e) => setAno(Number(e.target.value))}>
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