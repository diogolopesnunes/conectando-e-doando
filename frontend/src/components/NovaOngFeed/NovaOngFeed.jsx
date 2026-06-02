import css from "./NovaOngFeed.module.css";
import {useNavigate} from "react-router-dom";
import SeguirOng from "../SeguirOng/SeguirOng.jsx";

export default function NovaOngFeed({api, banner, descricao, nomeOng, logoOng, seguindo, idOng, aoAlterarOngsFavoritas, carregarPosts}) {
    const navigate = useNavigate();
    return(
        <div className={`col-12 col-sm-12 col-lg-4 rounded mx-2 my-4 shadow d-flex flex-column ${css.borda}`}>
            <img onClick={() => navigate(`/previa_ong/${idOng}`)} src={`${api}${banner}`} className={`w-100 ${css.altura}`} onError={(e) => {
                e.target.src = "/public/SemImagemDisponivel.png";
            }}/>

            <div className="row d-flex align-items-center p-2 flex-grow-1 gap-2">
                <div className="col-12">
                    <p className={css.descricao}>{descricao}</p>
                </div>

                <div className="col-12 mt-auto">
                    <div className="row d-flex align-items-center justify-content-between">
                        <div
                            onClick={() => navigate(`/previa_ong/${idOng}`)}
                            className="col"
                        >
                            <h4 className={css.nomeOng}>{nomeOng}</h4>
                        </div>

                        <div className="col d-flex justify-content-center">
                            <img
                                className={"object-fit-cover " + css.iconeOng}
                                src={`${api}${logoOng}`}
                                onError={(e) => {
                                    e.target.src = "/public/SemImagemDisponivel.png";
                                }}
                            />
                        </div>

                        <div className="col d-flex justify-content-end">
                            <SeguirOng
                                api={api}
                                idOng={idOng}
                                nomeOng={nomeOng}
                                ongImagem={logoOng}
                                seguindoInicial={seguindo}
                                aoAlterarOngsFavoritas={aoAlterarOngsFavoritas}
                                carregarPosts={carregarPosts}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}