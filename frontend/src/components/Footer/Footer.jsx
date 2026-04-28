import {Link} from "react-router-dom";
import css from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={"w-100 " + css.footer}>
            <div className={css.container}>

                <div className={css.logoArea}>
                    <img src="/logo.png" alt="Conectando & Doando"/>
                </div>

                <nav className={css.menu}>
                    <Link href="/">Início</Link>
                    <Link href="/">Sobre Nós</Link>
                    <Link href="/">ONGs</Link>
                    <Link href="/cadastro">Cadastro</Link>
                </nav>

                <div className={css.linha}></div>

                <div className={css.redes}>
                    <div className={css.divisorMobile}></div>
                    <span>Nossas redes:</span>
                    <div className={css.iconesGrid}>
                        <a href="https://www.instagram.com/" target="blank"><img src="/instagramLogo.png"
                                                                                 alt="Instagram"/></a>
                        <a href="https://www.facebook.com/" target="blank"><img src="/facebookLogo.png" alt="Facebook"/></a>
                        <a href="https://x.com/" target="blank"><img src="/xLogo.png" alt="X"/></a>
                        <a href="https://workspace.google.com/" target="blank"><img src="/emailLogo.png"
                                                                                    alt="Email"/></a>
                    </div>
                </div>

            </div>

            <div className={css.linhaFinal}></div>

            <p className={css.copy}>
                © 2026 - Todos os direitos reservados.
            </p>
        </footer>
    );
}