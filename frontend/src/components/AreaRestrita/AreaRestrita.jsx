import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import css from "./AreaRestrita.module.css";


export default function AreaRestrita() {
    return (
        <div className={css.container}>

            <main className={css.conteudo}>
                <h1 className={css.titulo}>(Olá)</h1>
            </main>

        </div>
    );
}