import React from "react";
import css from "./OngCard.module.css";

export default function OngCard({ ong, onDesativar }) {
    return (
        <div className="card">
            <button className="btnDesativar" onClick={() => onDesativar(ong.id)}>
                Desativar
            </button>
            <img
                src={ong.imagem}
                alt={ong.nome}
                className={css.cardImagem}
            />
            <div className={css.cardConteudo}>
                <h3 className={css.cardTitulo}>{ong.nome}</h3>
                <p className={css.cardDescricao}>{ong.descricao}</p>
            </div>
            <div className={css.cardRodape}>
                <img
                    src={ong.logo}
                    alt={`${ong.nome} logo`}
                    className={css.cardLogo}
                />
            </div>
        </div>
    );
}