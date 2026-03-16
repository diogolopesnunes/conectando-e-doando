import css from './Banner.module.css';
import Titulo from "../Titulo/Titulo.jsx";
import Button from "../Button/Button.jsx";

export default function Banner() {
    return (
        <div className={css.banner}>
            <Titulo texto={'Conheça o Conectando & Doando, a plataforma que conecta você a ONGs confiáveis e transforma solidariedade em ação.'}/>
            <div>
                <Button background={'laranja'} texto={'Conheça as Ongs'}/>
                <Button background={'roxo'} texto={'Fazer doação'}/>
            </div>
        </div>
    )
}