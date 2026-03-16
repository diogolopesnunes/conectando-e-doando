import css from "./Sectionhome.module.css";
import Button from "./Button/Button.jsx";
import {Link} from "react-router-dom";
export default function Sectionhome({Titulo,Texto, imagem, alt, estilo}) {

    if (imagem) {
        return (
            <div className={css[estilo]}>
                <div>
                    <h1>{Titulo}</h1>
                    <div>
                        <p>{Texto}</p>
                    </div>
                </div>
                <img className={css.img} src={imagem} alt={alt}/>
            </div>
        )
    }

    return (
        <div className={css[estilo]}>
            <div className="row">
                <h1>{Titulo}</h1>
                <p>{Texto}</p>
            <Button texto={"Conheça Mais"} background={"Laranja"}/>
            </div>
        </div>
    )
}