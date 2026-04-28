import css from './Titulo.module.css';

export default function Titulo({texto, estilo}) {
    return (
        <p className={css.titulo + " " + css[estilo]}>
            {texto}
        </p>
    )
}