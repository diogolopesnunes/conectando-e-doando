import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import css from "./AreaRestrita.module.css";
import {useEffect, useState} from "react";
import Alerts from "../../components/Alerts/Alerts.jsx";
import {useNavigate} from "react-router-dom";
import Nav from "../../components/Nav/Nav.jsx";


export default function AreaRestrita() {
    const [email, setEmail] = useState("");
    const [nome, setNome] = useState("");
    const [id, setId] = useState("");
    const [mensagem, setMensagem] = useState('');
    const navegate = useNavigate();

    // né melhor fazer isso como uma função e depois só usar ela? as outras paginas da dashboard tbm vão usar
    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
            navegate('/login')
        } else{
            setNome(localStorage.getItem("nome"));
            setEmail(localStorage.getItem("email"));
            setId(localStorage.getItem("id_usuario"));
        }
    }, [])

    return (
        <div className={'container m-auto d-flex align-items-center justify-content-center'}>
            <div className={'row formataAltura'}>
                <div className={'col-12'}>
                    <Nav/>
                </div>
                <div className={'col'}>

                    <h1>Olá, {nome}</h1>
                </div>
            </div>
        </div>
    );
}