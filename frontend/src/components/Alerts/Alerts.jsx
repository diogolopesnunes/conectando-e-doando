import { useState, useEffect } from "react";
import css from './Alerts.module.css';

export default function Alerts({ titulo, descricao, imagem, tipo, duracao }) {
    const [visivel, setVisivel] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisivel(false);
        }, duracao);

        return () => clearTimeout(timer);
    }, [duracao]);

    if (!visivel) return null;

    return (
        <div className={`${css.alert} ${css[tipo]}`}>
            <img src={imagem} alt="icone alerta" />

            <div className={css.conteudo}>
                <h4>{titulo}</h4>
                <p>{descricao}</p>
            </div>

            <button
                className={`${css.fechar} ${css[`fechar_${tipo}`]}`}
                onClick={() => setVisivel(false)}
            >
                ✕
            </button>
        </div>
    );
}