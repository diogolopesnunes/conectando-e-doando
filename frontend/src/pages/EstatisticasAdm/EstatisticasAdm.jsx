import { useEffect, useState } from "react";
import Nav from "../../components/Nav/Nav.jsx";
import css from "./EstatisticasAdm.module.css";

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
                `${api}/estatisticas_admin/`,
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

            <section className={css.containerEstatisticas}>

                <div className={css.cardEstatistica}>

                    <h2 className={css.tituloCard}>
                        Total de doações do ano
                    </h2>

                    <p className={css.valorCard}>
                        R$ {Number(estatisticas.valor_total_doacoes).toFixed(2)}
                    </p>

                </div>

                <div className={css.cardEstatistica}>

                    <h2 className={css.tituloCard}>
                        Número de doadores novos no ano
                    </h2>

                    <p className={css.valorCard}>
                        {estatisticas.novos_doadores}
                    </p>

                </div>

                <div className={css.cardEstatistica}>

                    <h2 className={css.tituloCard}>
                        Número de ONGs novas no ano
                    </h2>

                    <p className={css.valorCard}>
                        {estatisticas.novas_ongs}
                    </p>

                </div>

            </section>
        </>
    );
}