import { Link } from 'react-router-dom';
import css from './Button.module.css';

export default function Button({rota, background, tamanho, texto, efeito}) {
    return (
        <Link to={rota} className={css.botao}>
            <button className={css.botao + " " + css[background] + " " + css[tamanho] + " " + css[efeito]}>
                {texto}
            </button>
        </Link>
    )
}