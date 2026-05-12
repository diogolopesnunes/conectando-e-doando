import { useEffect, useState } from "react";
import styles from "./OngsFavoritas.module.css";

function OngsFavoritas({ api }) {
    const [ongs, setOngs] = useState([]);

    useEffect(() => {
        fetch(`${api}/pagina_feed_favoritas/1`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                const favoritas = data.posts.map((post) => ({
                    nome: post.ong_nome,
                    tema: post.tema,
                }));

                const unicas = favoritas.filter(
                    (ong, index, self) =>
                        index === self.findIndex((o) => o.nome === ong.nome)
                );

                setOngs(unicas);
            })
            .catch((err) => console.error(err));
    }, [api]);

    return (
        <div className={styles.favoritasContainer}>
            <h3 className={styles.tituloFavoritas}>
                Suas ONGs favoritas
            </h3>

            <div className={styles.favoritasLista}>
                {ongs.map((ong, index) => (
                    <div key={index} className={styles.favoritaCard}>
                        <img
                            src={`/img/${ong.tema}.png`}
                            alt={ong.nome}
                            className={styles.favoritaLogo}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OngsFavoritas;