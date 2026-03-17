import Buton from "../../Buton/Buton.jsx";
import Titulo from "../../Titulo/Titulo.jsx";

export default function DescobrirONG(titulo, texto, textoBotao, tamanho, tamanhoBotao, rota, background) {
    return (
        <div className={css[tamanho]}>
            <Titulo texto={titulo} />
            <p className={css.texto}>{texto}</p>
            <Buton rota={rota} texto={textoBotao} background={background} tamanho={tamanhoBotao}/>
        </div>
    )
}