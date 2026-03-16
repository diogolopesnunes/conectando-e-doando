import { useState } from "react";
import { Link } from "react-router-dom";
import css from "./Header.module.css";

export default function Header() {

    const [open,setOpen] = useState(false);

    return (
        <header className={css.header}>
            <div className={css.container}>

                <div className={css.logo}>
                    <img src="/logo.png" alt="logo"/>
                </div>

                <div className={css.hamburger} onClick={() => setOpen(!open)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <nav className={`${css.menu} ${open ? css.menuOpen : ""}`}>
                    <Link to="/">Quem somos</Link>
                    <Link to="#">Doações</Link>
                    <Link to="#">Depoimentos</Link>
                    <Link to="#">ONGs</Link>
                    <Link to="/cadastro">Cadastro</Link>
                    <Link to="/login">Login</Link>
                </nav>

            </div>
        </header>
    )
}