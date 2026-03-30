import {useState} from "react";
import {Link, useLocation} from "react-router-dom";
import css from "./Header.module.css";

export default function Header({scrollQuemSomos, scrollDoacoes, scrollOngs}) {

    const [open, setOpen] = useState(false);
    const pagina = useLocation().pathname;

    return (
        <header className={'p-2 ' + css.header}>
            <div className={css.container}>

                <Link to="/">
                    <div className={css.logo}>
                        <img src="/logo.png" alt="logo"/>
                    </div>
                </Link>

                <div className={css.hamburger} onClick={() => setOpen(!open)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <nav className={`${css.menu} ${open ? css.menuOpen : ""}`}>
                    <Link to="/" onClick={scrollQuemSomos}>Quem somos</Link>
                    <Link to="/" onClick={scrollDoacoes}>Doações</Link>
                    {/*<Link to="/" onClick={scrollOngs}>Depoimentos</Link>*/}
                    <Link to="/" onClick={scrollOngs}>ONGs</Link>
                    <Link to="/cadastro">Cadastro</Link>
                    <Link to="/login">Login</Link>
                </nav>

            </div>
        </header>
    )
}