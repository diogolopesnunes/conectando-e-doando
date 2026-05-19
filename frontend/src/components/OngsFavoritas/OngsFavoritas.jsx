import css from "./OngsFavoritas.module.css";
import { Link } from "react-router-dom";
import Buton from "../Buton/Buton.jsx";

export default function OngsFavoritas({ ongs = [], api }) {

    console.log(ongs)

    return (
        <div className={css.favoritasContainer}>
            <h3 className={css.tituloFavoritas}>
                Suas ONGs favoritas
            </h3>

            <div className={css.favoritasLista}>
                {ongs.length > 0 ? (
                    ongs.map((ong) => (
                            <Link
                                key={ong.id}
                                to={`/previa_ong/${ong.id}`}
                                className={css.linkFavorita}
                                title={ong.nome}
                            >
                                <img
                                    src={ong.imagem ? `${api}${ong.imagem}` : "/public/SemImagemDisponivel.png"}
                                    alt={ong.nome}
                                    className={`${css.favoritaLogo} m-1`}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src="/public/SemImagemDisponivel.png"
                                    }}
                                />
                            </Link>
                        ))
                ) : (
                    <>
                        <p className={`${css.semFavoritas} m-3`}>
                            Você ainda não segue uma ONG.
                        </p>
                        <Buton texto={"Descobrir novas ONGs"} background={"rosa"} tamanho={"medio"} rota={"/novas_ongs"} />
                    </>
                )}
            </div>
        </div>
    );
}