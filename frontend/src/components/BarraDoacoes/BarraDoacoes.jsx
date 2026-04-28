import css from "./BarraDoacoes.module.css";

export default function BarraDoacoes({ projeto }) {
    const formatarMoeda = (valor) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <section className={css.secaoProgresso}>
            <div className={css.valoresProgresso}>
                <div>
                    <span className={css.rotuloArrecadado}>Valor Arrecadado: </span>
                    <span className={css.valorArrecadado}>{formatarMoeda(projeto.valorArrecadado)}</span>
                </div>
                <div>
                    <span className={css.rotuloMeta}>Meta de Doações: </span>
                    <span className={css.valorMeta}>{formatarMoeda(projeto.metaDoacoes)}</span>
                </div>
            </div>
            <div className={css.containerBarraProgresso}>
                <span className={css.textoPorcentagem}>{projeto.porcentagem}%</span>
                <div className={css.fundoBarraProgresso}>
                    <div
                        className={css.preenchimentoBarraProgresso}
                        style={{ width: `${Math.min(projeto.porcentagem, 100)}%` }}
                    ></div>
                </div>
            </div>
        </section>
    );
}