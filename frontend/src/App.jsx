import {BrowserRouter, Routes, Route, Link} from "react-router-dom";
import PaginaCadastro from "./pages/PaginaCadastro/PaginaCadastro.jsx";
import PaginaLogin from "./pages/PaginaLogin/PaginaLogin.jsx"
import Footer from "./components/Footer/Footer.jsx";
import Header from "./components/Header/Header.jsx";
import Home from "./pages/Home/Home.jsx"
import {useRef} from "react";
import PaginaEsqueciMinhaSenha from "./pages/PaginaEsqueciMinhaSenha/PaginaEsqueciMinhaSenha.jsx";
import Erro from "./pages/Erro/Erro.jsx"
import PaginaValidarEmail from "./pages/PaginaValidarEmail/PaginaValidarEmail.jsx";
import PaginaAlterarSenha from "./pages/PaginaAlterarSenha/PaginaAlterarSenha.jsx";
import PaginaInformeEmailConta from "./pages/PaginaInformeEmailConta/PaginaInformeEmailConta.jsx"

export default function App() {
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
    return (
        <BrowserRouter>
            <Header scrollQuemSomos={scrollQuemSomos} scrollDoacoes={scrollDoacoes} scrollOngs={scrollOngs}/>

            <Routes>
                <Route path="/" element={<Home quemSomos={quemSomos} doacoes={doacoes} ongs={ongs}/>}/>
                <Route path="/cadastro" element={<PaginaCadastro/>}/>
                <Route path="/login" element={< PaginaLogin/>}/>
                <Route path="/esqueciminhasenha" element={<PaginaEsqueciMinhaSenha/>}/>
                <Route path={"/validar"} element={<PaginaValidarEmail/>}/>
                <Route path={"/alterar_senha"} element={<PaginaAlterarSenha/>} />
                <Route path={"/enviar_validar"} element={<PaginaInformeEmailConta/>}/>
                <Route path="*" element={<Erro/>}/>
            </Routes>
            <Footer/>
        </BrowserRouter>
    )
}