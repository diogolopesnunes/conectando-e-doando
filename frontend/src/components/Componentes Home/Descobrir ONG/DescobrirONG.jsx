import Button from "../../Button/Button.jsx";
import Titulo from "../../Titulo/Titulo.jsx";

export default function DescobrirONG(titulo, texto, textoBotao, tamanho, tamanhoBotao, rota, background) {
    return (
        <div className={css[tamanho]}>
            <Titulo texto={titulo} />
            <p className={css.texto}>{texto}</p>
            <Button rota={rota} texto={textoBotao} background={background} tamanho={tamanhoBotao}/>
        </div>
    )
}