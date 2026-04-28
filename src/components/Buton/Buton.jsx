import {Link} from 'react-router-dom';
import css from './Buton.module.css';

export default function Buton({rota, background, tamanho, texto, efeito, classe, onClick, tipo}) {
    if (rota){
        return (
            <Link to={rota} className={css.botao}>
                <button
                    type={tipo} className={css.botao + " " + css[background] + " " + css[tamanho] + " " + css[efeito] + " " + css[classe]} onClick={onClick}>
                    {texto}
                </button>
            </Link>
        )
    }
    return (
        <div className={css.botao}>
            <button
                type={tipo} className={css.botao + " " + css[background] + " " + css[tamanho] + " " + css[efeito] + " " + css[classe]} onClick={onClick}>
                {texto}
            </button>
        </div>
    )
}