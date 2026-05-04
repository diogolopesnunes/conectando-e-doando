import {NavLink, useLocation, useNavigate} from "react-router-dom";
import css from "./Nav.module.css";
import {useEffect, useState} from "react";

export default function Nav() {
    const local = useLocation();
    const navegate = useNavigate();
    const [email, setEmail] = useState("");
    const [nome, setNome] = useState("");
    const [id, setId] = useState("");
    const [tipoUsuario, setTipoUsuario] = useState("");

    function cssAtivado({ isActive }) {
        var ativo = isActive ? "active" : "";
        return ativo + " " + css.nav_btn
    }

    function btnAddProjeto({ isActive }) {
        var projeto = cssAtivado({ isActive });
        if (local.pathname == '/adicionar_projetos' || local.pathname.includes('/adicionar_post/') || local.pathname.includes('/edicao_projetos/') || local.pathname.includes('/projeto/')) {
            projeto += " active";
        }

        return projeto;
    }

    function ongsAdm({ isActive }) {
        var ongs = cssAtivado({ isActive });
        if (local.pathname.includes('/enviar_email/')) {
            ongs += " active";
        }
        // if (local.pathname.includes('/enviar_email/')) {
        //     ongs += " active";
        // }
        return ongs;
    }

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("email") || !localStorage.getItem("id_usuario") || !localStorage.getItem("tipo_usuario")) {
            navegate('/login')
        } else{
            setNome(localStorage.getItem("nome"));
            setEmail(localStorage.getItem("email"));
            setId(localStorage.getItem("id_usuario"));
            setTipoUsuario(localStorage.getItem("tipo_usuario"));
        }
    }, [])

    return (
        <div className={'m-auto justify-content-center w-75 '+ css.nav_container + "" }>
            {tipoUsuario == 1 && (
                <>
                    <NavLink
                        to={"/previa_ong"}
                        className={cssAtivado}>
                        Prévia
                    </NavLink>

                    {/*<NavLink*/}
                    {/*    to="/grafico"*/}
                    {/*    className={cssAtivado}>*/}
                    {/*    Gráfico*/}
                    {/*</NavLink>*/}

                    {/*<NavLink*/}
                    {/*    to="/historico"*/}
                    {/*    className={cssAtivado}>*/}
                    {/*    Histórico*/}
                    {/*</NavLink>*/}

                    <NavLink to={"/projetos_ong"} className={btnAddProjeto} >Projetos</NavLink>

                    <NavLink
                        to="/edicao_ongs"
                        className={cssAtivado}>
                        Editar ONG
                    </NavLink>
                </>
            )}
            {tipoUsuario == 2 && (
                <>
                    <NavLink
                        to="/dashboard_adm_ong"
                        className={ongsAdm}>
                        ONGs
                    </NavLink>

                    <NavLink
                        to="/doadores"
                        className={cssAtivado}>
                        Doadores
                    </NavLink>

                    <NavLink
                        to="/adms"
                        className={cssAtivado}>
                        ADMs
                    </NavLink>

                    <NavLink to={"/doacoes"} className={cssAtivado} >Doações</NavLink>

                    <NavLink
                        to="/edicao_adm"
                        className={cssAtivado}>
                        Editar ADM
                    </NavLink>
                </>
            )}
        </div>
    );
}