import Footer from "../../components/Footer/Footer.jsx";
import css from "./Erro.module.css";


export default function Erro() {
    return (
        <div className={css.container}>
            <main className={css.conteudo}>
                <h1 className={css.titulo}>Erro 404</h1>
                <h2 className={css.subtitulo}> Página não encontrada</h2>
            </main>
        </div>
    );
}