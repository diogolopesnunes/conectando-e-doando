import {Link} from 'react-router-dom';
import css from './Buton.module.css';

export default function Buton({rota, background, tamanho, texto, efeito, classe}) {
    return (
        <Link to={rota} className={css.botao}>
            <button
                className={css.botao + " " + css[background] + " " + css[tamanho] + " " + css[efeito] + " " + css[classe]}>
                {texto}
            </button>
        </Link>
    )
}