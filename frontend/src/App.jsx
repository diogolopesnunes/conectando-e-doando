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
import AdicionarPost from "./pages/AdicionarPost/AdicionarPost.jsx";
import EdicaoProjetos from "./pages/EdicaoProjetos/EdicaoProjetos.jsx";
import EdicaoONGS from "./pages/EdicaoONGs/EdicaoONGs.jsx";
import PaginaProjeto from "./pages/Ong/PaginaProjeto/PaginaProjeto.jsx";
import DashboardAdmOng from "./pages/DashboardAdmOng/DashboardAdmOng.jsx"
import DashboardAdmAdm from "./pages/DashboardAdmAdm/DashboardAdmAdm.jsx"
import {PaginaPreviaOng} from "./pages/PaginaPreviaOng/PaginaPreviaOng.jsx";
import PaginaEnviarEmail from "./pages/PaginaEnviarEmail/PaginaEnviarEmail.jsx";
import DashboardAdmDoador from "./pages/DashboardAdmDoador/DashboardAdmDoador.jsx";
import Feed from "./pages/Feed/Feed.jsx";
import EdicaoDoadores from "./pages/EdicaoDoadores/EdicaoDoadores.jsx";
import CadastroAdm from "./pages/PaginaCadastro/PaginaCadastro.jsx";
import EdicaoAdm from "./pages/EdicaoAdm/EdicaoAdm.jsx"
import NovasOngs from "./pages/NovasOngs/NovasOngs.jsx";
import Historico from "./pages/Historico/Historico.jsx";
import EstatisticaAdm from "./pages/EstatisticasAdm/EstatisticasAdm.jsx";
import Pagamento from "./pages/Pagamento/Pagamento.jsx";


export default function App() {

    const api = "http://10.92.3.155:5000"

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

    const [logado, setLogado] = useState(false);
    const [id, setId] = useState("");
    const [mensagem, setMensagem] = useState()
    const [tipoMensagem ,setTipoMensagem] = useState()

    useEffect(() => {
        async function verificarSessao() {
            if (window.location.pathname === "/login") {
                return;
            }
            if (!localStorage.getItem("id_usuario")) {
                return;
            }
            try {
                const resposta = await fetch(`${api}/verificar_token`, {
                    method: "GET",
                    credentials: "include"
                });

                    if (resposta.status === 401) {
                        setMensagem("Sua sessão expirou. Faça login novamente.");
                        setTipoMensagem("erro");
                        setLogado(false);

                        localStorage.removeItem("email");
                        localStorage.removeItem("id_usuario");
                        localStorage.removeItem("tipo_usuario");

                        setTimeout(() => {
                            window.location.href = "/login";
                        }, 5000);

                        return;
                }
                // if (localStorage.getItem('id_usuario')){
                //     setlogado(true)
                // } else{
                //     setLogado(false)
                // }
                setLogado(true);
                setId(localStorage.getItem("id_usuario"));

            } catch (error) {
                console.log(error);
                setLogado(false);

                localStorage.removeItem("email");
                localStorage.removeItem("id_usuario");
                localStorage.removeItem("tipo_usuario");
            }
        }

        verificarSessao();
    }, []);


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
                <Route path={"/adicionar_projetos/:id_usuario"} element={<AdicionarProjetos api={api}/>} />
                <Route path={"/adicionar_post/:id_projeto"} element={<AdicionarPost api={api}/>} />
                <Route path={"/edicao_projetos/:id_projeto"} element={<EdicaoProjetos api={api}/>} />
                <Route path={"/edicao_post/:id_projeto/:id_post"} element={<AdicionarPost api={api}/>} />
                <Route path={"/edicao_ongs/:id_usuario"} element={<EdicaoONGS api={api}/>} />
                <Route path={"/edicao_ongs"} element={<EdicaoONGS api={api}/>} />
                <Route path={"/edicao_doadores/:id_usuario"} element={<EdicaoDoadores api={api} />} />
                <Route path={"/edicao_doadores"} element={<EdicaoDoadores api={api}/>} />
                <Route path={"/edicao_adm/:id_usuario"} element={<EdicaoAdm api={api}/>} />
                <Route path={'/projeto/:id_projeto'} element={<PaginaProjeto api={api}/>} />
                <Route path={'/dashboard_adm_ong'} element={<DashboardAdmOng api={api}/>} />
                <Route path={'/dashboard_adm_adm'} element={<DashboardAdmAdm api={api}/>} />
                <Route path={'/previa_ong/:id'} element={<PaginaPreviaOng api={api}/>} />
                <Route path={'/previa_ong'} element={<PaginaPreviaOng api={api}/>} />
                <Route path={'/enviar_email/:id_ong'} element={<PaginaEnviarEmail api={api}/>} />
                <Route path={'/enviar_email_bloquear/:id_ong'} element={<PaginaEnviarEmail api={api}/>} />
                <Route path={'/dashboard_adm_doador'} element={<DashboardAdmDoador api={api}/>} />
                <Route path={"/cadastroadm"} element={<CadastroAdm api={api}/>}/>
                <Route path={'/feed'} element={<Feed api={api}/>} />
                <Route path={'/novas_ongs'} element={<NovasOngs api={api}/>}/>
                <Route path={'/historico_doador'} element={<Historico api={api}/>}/>
                <Route path={'/historico_ong'} element={<Historico api={api}/>}/>
                <Route path={'/historico_ong/:id_ong'} element={<Historico api={api}/>}/>
                <Route path={'/estatisticas'} element={<EstatisticaAdm api={api}/>}/>
                <Route path={'/pagamento'} element={<Pagamento api={api}/>}/>

                <Route path="*" element={<Erro/>} />
            </Routes>
            <Footer/>
        </BrowserRouter>
    )
}