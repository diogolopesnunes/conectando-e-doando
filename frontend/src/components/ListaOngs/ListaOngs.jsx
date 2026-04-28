import OngCard from "../OngCards/OngCards.jsx";
import css from "./ListaOngs.module.css";

export default function ListaOngs({ ongs, onDesativar }) {
    return (
        <div className="lista-ongs">
            {ongs.length > 0 ? (
                ongs.map((ong) => (
                    <OngCard
                        key={ong.id}
                        ong={ong}
                        onDesativar={onDesativar}
                    />
                ))
            ) : (
                <p>Nenhuma ONG encontrada</p>
            )}
        </div>
    );
}