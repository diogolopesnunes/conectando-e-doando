import css from "./NovaOngFeed.module.css";
import {useNavigate} from "react-router-dom";
import SeguirOng from "../SeguirOng/SeguirOng.jsx";

export default function NovaOngFeed({api, banner, descricao, nomeOng, logoOng, seguindo, idOng, aoAlterarOngsFavoritas}) {
    const navigate = useNavigate();
    return(
        <div className={`col-12 col-sm-12 col-lg-4 rounded mx-2 my-4 shadow ${css.borda}`}>
            <img onClick={() => navigate(`/previa_ong/${idOng}`)} src={`${api}${banner}`} className={`w-100 ${css.altura}`} onError={(e) => {
                e.target.src = "/public/SemImagemDisponivel.png";
            }}/>

            <div className={'row d-flex align-items-center p-2'}>
                <div className={'col-12'}>
                    <p>{descricao}</p>
                </div>
                <div onClick={() => navigate(`/previa_ong/${idOng}`)} className={'col'}>
                    <h4>{nomeOng}</h4>
                </div>
                <div className={`col`}>
                    <img className={`${css.iconeOng}`} src={`${api}${logoOng}`} onError={(e) => {
                        e.target.src = "/public/SemImagemDisponivel.png";
                    }}/>
                </div>
                <div className={'col'}>
                    <SeguirOng
                        api={api}
                        idOng={idOng}
                        nomeOng={nomeOng}
                        ongImagem={logoOng}
                        seguindoInicial={seguindo}
                        aoAlterarOngsFavoritas={aoAlterarOngsFavoritas}
                    />
                </div>
            </div>
        </div>
    )
}