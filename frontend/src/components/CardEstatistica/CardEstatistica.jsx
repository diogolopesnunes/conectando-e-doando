import css from './CardEstatistica.module.css'
export default function CardEstatistica({texto, valor}) {
    return(
        <div className={`col-3 shadow rounded p-2 ${css.cardEstatistica}`}>

            <h2 className={css.tituloCard}>
                {texto}
            </h2>

            <p className={css.valorCard}>
                {valor}
            </p>

        </div>
    )
}