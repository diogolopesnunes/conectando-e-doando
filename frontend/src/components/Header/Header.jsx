import {useState, useEffect} from "react";
import {Link, NavLink, useLocation, useNavigate} from "react-router-dom";
import css from "./Header.module.css";
import Buton from "../Buton/Buton.jsx";

export default function Header({scrollQuemSomos, scrollDoacoes, scrollOngs, logado, setLogado, setMensagem, setTipoMensagem, api}) {

    const [open, setOpen] = useState(false);
    const pagina = useLocation().pathname;

    const [email, setEmail] = useState("");
    const nome = localStorage.getItem("nome");
    const navegate = useNavigate();
    if (logado == true && localStorage.getItem("id_usuario") == null) {
        setLogado(false);
    }

    // const [logado, setLogado] = useState("");
    // if (localStorage.getItem('id_usuario')){
    //     setlogado(true)
    // } else{
    //     setLogado(false)
    // }
    // const [id, setId] = useState("");
    // const [mensagem, setMensagem] = useState()
    // const [tipoMensagem ,setTipoMensagem] = useState()
    // const navegate = useNavigate();

    // useEffect(() => {
    //     if (!localStorage.getItem("email") || !localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
    //         setLogado(false);
    //         // } else{
    //         setLogado(true);
    //         setId(localStorage.getItem('id_usuario'))
    //     }
    // }, [logado])

    // async function logout(e) {
    //     e.preventDefault();
    //     let retorno = await fetch(`http://10.92.3.118:5000/logout`, {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         credentials: "include",
    //         body: JSON.stringify({
    //
    //         })
    //     })
    //
    //     setLogado(false)
    //
    //     retorno = await retorno.json()
    //     console.log(retorno)
    //     if(!retorno){
    //         console.log("Erro do servidor:", retorno);
    //         return;
    //     }
    //     if (retorno.mensagem){
    //         setMensagem(retorno.mensagem.descricao)
    //         setTipoMensagem(retorno.mensagem.tipo)
    //         console.log(mensagem)
    //         console.log(tipoMensagem)
    //         if(retorno.mensagem.tipo === 'sucesso'){
    //             localStorage.clear()
    //         }
    //     }
    //     // navegate('/')
    // }

    async function logout(e) {
        e.preventDefault();
        let retorno = await fetch(`${api}/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({

            })
        })

        setLogado(false)

        retorno = await retorno.json()
        console.log(retorno)
        if(!retorno){
            console.log("Erro do servidor:", retorno);
            return;
        }
        if (retorno.mensagem){
            setMensagem(retorno.mensagem.descricao)
            setTipoMensagem(retorno.mensagem.tipo)
            localStorage.clear()
            // if(retorno.mensagem.tipo == 'sucesso'){
            //     localStorage.clear()
            // }
        }
        navegate('/')
    }


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
                    {!logado ? (
                        <>
                            <span></span>
                            <Link to={"/feed"}>
                                Feed
                            </Link>
                            <Link to="/" onClick={scrollQuemSomos}>Quem somos</Link>
                            <Link to="/" onClick={scrollDoacoes}>Doações</Link>
                            {/*<Link to="/" onClick={scrollOngs}>Depoimentos</Link>*/}
                            <Link to="/" onClick={scrollOngs}>ONGs</Link>
                            <Link to="/cadastro">Cadastro</Link>
                            <Link to="/login">Login</Link>
                            <span></span>
                        </>
                    ) : (
                        <>
                            <p>{nome}</p>

                            <Buton onClick={logout} background="rosa" tamanho="pequeno" texto="Sair" />
                            {localStorage.getItem('tipo_usuario') == 1 ?(
                                <>
                                    <Link to={"/previa_ong"}>
                                        Dashboard
                                    </Link>
                                    <Link to={"/feed"}>
                                        Feed
                                    </Link>
                                </>
                            ): localStorage.getItem('tipo_usuario') == 2 ? (
                                <>
                                    <Link to={"/dashboard_adm_ong"}>
                                        Dashboard
                                    </Link>
                                    <Link to={"/feed"}>
                                        Feed
                                    </Link>
                                </>
                            ): localStorage.getItem('tipo_usuario') == 0 ? (
                                <Link to={"/feed"}>
                                    Feed
                                </Link>
                                ) : null
                            }
                        </>
                    )}
                </nav>

            </div>
        </header>
    )
}