import css from "./OngsFavoritas.module.css";
import { Link } from "react-router-dom";
import Buton from "../Buton/Buton.jsx";

export default function OngsFavoritas({ ongs = [], api }) {

    return (
        <div className={css.favoritasContainer}>
            <h3 className={css.tituloFavoritas}>
                Suas ONGs favoritas
            </h3>

            <div className={css.favoritasLista}>
                {ongs.length > 0 ? (
                    ongs.map((ong) => (

                                <img
                                    src={ong.imagem ? `${api}${ong.imagem}` : "/public/SemImagemDisponivel.png"}
                                    alt={ong.nome}
                                    className={`${css.favoritaLogo} m-1 cursor-pointer`}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src="/public/SemImagemDisponivel.png"
                                    }}
                                />
                        ))
                ) : (
                    <div className={'d-flex flex-column flex-sm-row m-auto'}>
                        <p className={`${css.semFavoritas} m-3`}>
                            Você ainda não segue uma ONG.
                        </p>
                        <Buton texto={"Descobrir novas ONGs"} background={"rosa"} tamanho={"medio"} rota={"/novas_ongs"} />
                    </div>
                )}
            </div>
        </div>
    );
}