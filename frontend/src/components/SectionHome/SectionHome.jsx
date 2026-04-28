import css from "./SectionHome.module.css";
import {Link} from "react-router-dom";
import Buton from "../Buton/Buton.jsx";

export default function SectionHome({Titulo, Texto, imagem, alt, estilo, estilo2}) {

    if (imagem) {
        return (
            <div className={'d-flex justify-content-around flex-column flex-sm-row px-5 py-5 py-sm-2' + " "+ css.sectionHome + " " + css[estilo]}>
                <div className={'w-100 w-sm-50 d-flex align-items-sm-start ' + css[estilo2]}>
                    <h1 className="">{Titulo}</h1>
                    <div>
                        <p className={'tamanhoTexto text-center text-sm-start pb-2 pb-sm-0'}>{Texto}</p>
                    </div>
                </div>
                <img className={'w-100 ' + css.img} src={imagem} alt={alt}/>
            </div>
        )
    }

    return (
        <div className={'px-5 py-5 py-sm-2 d-flex flex-column justify-content-center gap-2 ' + css[estilo] + " " + css.tamanhoSection}>
            <h1 className={'text-white mb-3 text-center text-sm-start'}>{Titulo}</h1>
            <p className={"tamanhoTexto mb-3 text-white text-center text-sm-start"}>{Texto}</p>
            <Buton texto={"Conheça Mais"} background={"laranja"} tamanho={'medio'}/>
        </div>
    )
}