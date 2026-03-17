import {BrowserRouter, Routes, Route, Link} from "react-router-dom";
import PaginaCadastro from "./pages/PaginaCadastro.jsx";
import PaginaLogin from "./pages/PaginaLogin.jsx"
import Footer from "./components/Footer/Footer.jsx";
import Header from "./components/Header/Header.jsx";
import Home from "./pages/Home.jsx"

export default function App() {
    return (
        <BrowserRouter>
            {/*<Link to={'/cadastro'}>cadastro</Link>*/}
            <Header/>

            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/cadastro" element={<PaginaCadastro/>}/>
                <Route path="/login" element={< PaginaLogin/>}/>

            </Routes>
            <Footer/>
        </BrowserRouter>
    )
}