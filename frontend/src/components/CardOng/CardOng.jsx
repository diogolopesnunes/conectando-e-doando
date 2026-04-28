import React from "react";
import "./OngCard.css";

export default function OngCard({ ong, onDesativar }) {
    return (
        <div className="card">
            <button className="btnDesativar" onClick={() => onDesativar(ong.id)}>
                Desativar
            </button>
            <img
                src={ong.imagem}
                alt={ong.nome}
                className="cardImagem"
            />
            <div className="cardConteudo">
                <h3 className="cardTitulo">{ong.nome}</h3>
                <p className="cardDescricao">{ong.descricao}</p>
            </div>
            <div className="cardRodape">
                <img
                    src={ong.logo}
                    alt={`${ong.nome} logo`}
                    className="cardLogo"
                />
            </div>
        </div>
    );
}