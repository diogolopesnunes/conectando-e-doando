import {useState, useEffect} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import css from "./Header.module.css";
import Buton from "../Buton/Buton.jsx";

export default function Header({scrollQuemSomos, scrollDoacoes, scrollOngs, logado, setLogado, setMensagem, setTipoMensagem, api}) {

    const [open, setOpen] = useState(false);
    const pagina = useLocation().pathname;

    const [email, setEmail] = useState("");
    const [nome, setNome] = useState("");
    const navegate = useNavigate();
    // const [logado, setLogado] = useState("");
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
                            <Buton onClick={logout} background="rosa" tamanho="pequeno" texto="Sair" />
                            <Link to={"/dashboard"}>
                                Dashboard
                            </Link>
                        </>
                    )}
                </nav>

            </div>
        </header>
    )
}