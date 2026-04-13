import {NavLink, useLocation} from "react-router-dom";
import css from "./Nav.module.css";

export default function Nav() {
    const local = useLocation();

    function cssAtivado({ isActive }) {
        var ativo = isActive ? "active" : "";
        return ativo + " " + css.nav_btn
    }

    function btnAddProjeto({ isActive }) {
        var projeto = cssAtivado({ isActive });
        if (local.pathname == '/adicionar_projetos' || local.pathname == '/adicionar_post' || local.pathname == '/edicao_projetos') {
            projeto += " active";
        }

        return projeto;
    }

    return (
        <div className={'m-auto justify-content-center w-75 '+ css.nav_container + "" }>
            <NavLink
                to="/previa"
                className={cssAtivado}>
                Prévia
            </NavLink>

            <NavLink
                to="/grafico"
                className={cssAtivado}>
                Gráfico
            </NavLink>

            <NavLink
                to="/historico"
                className={cssAtivado}>
                Histórico
            </NavLink>

            <NavLink to={"/projetos_ong"} className={btnAddProjeto} >Projetos</NavLink>

            <NavLink
                to="/edicao_ongs"
                className={cssAtivado}>
                Editar ONG
            </NavLink>
        </div>
    );
}