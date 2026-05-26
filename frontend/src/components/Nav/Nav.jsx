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
        if (local.pathname.includes('/edicao_ongs/')) {
            ongs += " active";
        }
        if (local.pathname.includes('/previa_ong/')) {
            ongs += " active";
        }
        if (local.pathname.includes('/projeto/')) {
            ongs += " active";
        }
        if (local.pathname.includes('/adicionar_post/')) {
            ongs += " active";
        }
        if (local.pathname.includes('/adicionar_projetos/')) {
            ongs += " active";
        }
        if (local.pathname.includes('/edicao_projetos/')) {
            ongs += " active";
        }
        return ongs;
    }

    function doadoresAdm({ isActive }) {
        var doadores = cssAtivado({ isActive });
        if (local.pathname.includes('/edicao_doadores/')) {
            doadores += " active";
        }
        // if (local.pathname.includes('/edicao_ongs/')) {
        //     ongs += " active";
        // }
        return doadores;
    }

    function admAdms({ isActive }) {
        var adms = cssAtivado({ isActive });

        if (local.pathname.includes('/edicao_adm/')) {
            adms += " active";
        }

        if (local.pathname.includes('/dashboard_adm_adms/')) {
            adms += " active";
        }

        return adms;
    }

    function doadoresDashboard({ isActive }) {
        var doadores = cssAtivado({ isActive });
        if (local.pathname.includes('/feed/')) {
            doadores += " active";
        }
        return doadores;
    }
    
    function feedDoadores({ isActive }){
        var feed = cssAtivado({ isActive });
        if (local.pathname.includes('/novas_ongs')) {
            feed += " active";
        }
        return feed;
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
            {tipoUsuario == 0 && (
                <>
                    <NavLink
                        to={"/feed"}
                        className={feedDoadores}>
                        Feed
                    </NavLink>

                    <NavLink
                        to={"/Historico_doador"}
                        className={doadoresDashboard}>
                        Histórico
                    </NavLink>

                    <NavLink
                        to={"/edicao_doadores"}
                        className={doadoresDashboard}>
                        Editar
                    </NavLink>
                </>
            )}
            {tipoUsuario == 1 && (
                <>
                    <NavLink
                        to={"/previa_ong"}
                        className={cssAtivado}>
                        Prévia
                    </NavLink>

                    <NavLink
                        to="/grafico"
                        className={cssAtivado}>
                        Gráfico
                    </NavLink>

                    <NavLink
                        to="/historico_ong"
                        className={cssAtivado}>
                        Histórico
                    </NavLink>

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
                        to="/cadastro"
                        className={cssAtivado}>
                        Cadastrar
                    </NavLink>

                    <NavLink
                        to="/dashboard_adm_ong"
                        className={ongsAdm}>
                        ONGs
                    </NavLink>

                    <NavLink
                        to="/dashboard_adm_doador"
                        className={doadoresAdm}>
                        Doadores
                    </NavLink>

                    <NavLink
                        to="/dashboard_adm_adm"
                        className={admAdms}>
                        ADMs
                    </NavLink>

                    <NavLink
                        to="/estatisticas"
                        className={cssAtivado}>
                        Estatisticas
                    </NavLink>


                    {/*<NavLink to={"/doacoes"} className={cssAtivado} >Doações</NavLink>*/}

                    {/*<NavLink*/}
                    {/*    to="/edicao_adm"*/}
                    {/*    className={cssAtivado}>*/}
                    {/*    Editar ADM*/}
                    {/*</NavLink>*/}
                </>
            )}
        </div>
    );
}