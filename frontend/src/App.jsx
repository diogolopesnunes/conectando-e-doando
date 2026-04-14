import {BrowserRouter, Routes, Route, Link} from "react-router-dom";
import PaginaCadastro from "./pages/PaginaCadastro/PaginaCadastro.jsx";
import PaginaLogin from "./pages/PaginaLogin/PaginaLogin.jsx"
import Footer from "./components/Footer/Footer.jsx";
import Header from "./components/Header/Header.jsx";
import Home from "./pages/Home/Home.jsx"
import {useEffect, useRef, useState} from "react";
import PaginaEsqueciMinhaSenha from "./pages/PaginaEsqueciMinhaSenha/PaginaEsqueciMinhaSenha.jsx";
import Erro from "./pages/Erro/Erro.jsx"
import PaginaValidarEmail from "./pages/PaginaValidarEmail/PaginaValidarEmail.jsx";
import PaginaAlterarSenha from "./pages/PaginaAlterarSenha/PaginaAlterarSenha.jsx";
import AreaRestrita from "./pages/AreaRestrita/AreaRestrita.jsx";
import Projetos from "./pages/Ong/Projetos/Projetos.jsx"
import AdicionarProjetos from "./pages/AdicionarProjetos/AdicionarProjetos.jsx";
import  AdicionarPost from "./pages/AdicionarPost/AdicionarPost.jsx";
import EdicaoProjetos from "./pages/EdicaoProjetos/EdicaoProjetos.jsx";
import EdicaoONGS from "./pages/EdicaoONGs/EdicaoONGs.jsx";


export default function App() {

    const api = 'http://10.92.3.170:5000'

    const quemSomos = useRef(null);
    const doacoes = useRef(null);
    const ongs = useRef(null);


    const scrollQuemSomos = () =>{
        quemSomos.current.scrollIntoView({ behavior: "smooth" });
    };
    const scrollDoacoes = () =>{
        doacoes.current.scrollIntoView({ behavior: "smooth" });
    };
    const scrollOngs = () =>{
        ongs.current.scrollIntoView({ behavior: "smooth" });
    };

    const [logado, setLogado] = useState("");
    const [id, setId] = useState("");
    const [mensagem, setMensagem] = useState()
    const [tipoMensagem ,setTipoMensagem] = useState()

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
            setLogado(false);
        } else{
            setLogado(true);
            setId(localStorage.getItem('id_usuario'))
        }
    }, [logado])



    return (
        <BrowserRouter>
            <Header scrollQuemSomos={scrollQuemSomos} scrollDoacoes={scrollDoacoes} scrollOngs={scrollOngs} logado={logado} setLogado={setLogado} setMensagem={setMensagem} setTipoMensagem={setTipoMensagem} api={api}/>

            <Routes>
                <Route path="/" element={<Home quemSomos={quemSomos} doacoes={doacoes} ongs={ongs}/>}/>
                <Route path="/cadastro" element={<PaginaCadastro api={api}/>}/>
                <Route path="/login" element={< PaginaLogin logado={logado} setLogado={setLogado} api={api} />}/>
                <Route path="/esqueciminhasenha" element={<PaginaEsqueciMinhaSenha api={api} />}/>
                <Route path={"/validar"} element={<PaginaValidarEmail api={api} />}/>
                <Route path={"/alterar_senha"} element={<PaginaAlterarSenha api={api} />} />
                <Route path={"/dashboard"} element={<AreaRestrita />} />
                <Route path={"/projetos_ong"} element={<Projetos api={api}/>} />
                <Route path={"/adicionar_projetos"} element={<AdicionarProjetos api={api}/>} />
                <Route path={"/adicionar_post/:id_projeto"} element={<AdicionarPost api={api}/>} />
                <Route path={"/edicao_projetos"} element={<EdicaoProjetos api={api}/>} />
                <Route path={"/edicao_ongs"} element={<EdicaoONGS api={api}/>} />

                <Route path="*" element={<Erro/>} />
            </Routes>
            <Footer/>
        </BrowserRouter>
    )
}