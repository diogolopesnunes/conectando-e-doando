import { useEffect, useState } from "react";
import Nav from "../../components/Nav/Nav.jsx";
import css from "./EstatisticasAdm.module.css";
import CardEstatistica from "../../components/CardEstatistica/CardEstatistica.jsx";
import Alerts from "../../components/Alerts/Alerts.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import Input from "../../components/Input/Input.jsx";
import CardOngAdm from "../../components/CardOngAdm/CardOngAdm.jsx";
import Titulo from "../../components/Titulo/Titulo.jsx";

export default function EstatisticaAdm({api}) {

    const [estatisticas, setEstatisticas] = useState({
        valor_total_doacoes: 0,
        novos_doadores: 0,
        novas_ongs: 0
    });

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
            }

        } catch (erro) {

            console.log(erro);
        }
    }

    return (
        <>
            <Nav />

            <div className={"row justify-content-center align-items-center m-auto flex-md-row flex-column "}>
                <section className={"col-4 d-flex justify-content-center align-items-center flex-column " + css.containerEstatisticas}>

                    <CardEstatistica texto={"Total de doações do ano"} valor={Number(estatisticas.valor_total_doacoes).toFixed(2).replace(".", ",")} />

                    <CardEstatistica texto={"Número de doadores novos no ano"} valor={estatisticas.novos_doadores} />

                    <CardEstatistica texto={"Número de ONGs novas no ano"} valor={estatisticas.novas_ongs} />

                </section>

                <div className={"col-8 d-flex justify-content-center align-items-center m-auto" }>
                    <div>
                        <img src={"https://observatorio3setor.org.br/wp-content/uploads/2016/07/grafico-ongs-1.png"}></img>
                    </div>
                {/* Remover o style e colocar o gráfico na div */}
                </div>
            </div>
        </>
    );
}