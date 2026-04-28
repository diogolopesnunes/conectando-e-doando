import css from "./PaginaPrevia.module.css"
import {useState, useEffect} from "react";
import Buton from "../../components/Buton/Buton.jsx";
import {useNavigate} from "react-router-dom";

export default function Previa() {
    const [email, setEmail] = useState("");
    const [nome, setNome] = useState("");
    const [id, setId] = useState("");
    const api = 'http://192.168.0.147:5000'
    const [ongs, setOngs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
            navigate('/login')
        } else{
            setNome(localStorage.getItem("nome"));
            setEmail(localStorage.getItem("email"));
            setId(localStorage.getItem("id_usuario"));
        }
    }, [])

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("id_usuario") || localStorage.getItem("tipo_usuario") != 2) {
            navigate('/login')
        }
    }, [])

    async function listarOngs() {
        let listagemOngs = await fetch(`${api}/listar_ong_adm`, {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            },
            credentials: "include"
        })

        let listaOngs = await listagemOngs.json();

        console.log(listaOngs)

        let ongsFormatado = listaOngs.ongs

        setOngs(ongsFormatado)
}

    useEffect(() => {
        listarOngs();
    }, []);

    return (
        <div className={"formataAltura m-auto" + css.containerPrevia}>
            <div className={"row d-flex justify-content-center align-items-center gap-3"}>
                {ongs.slice(0, 5).map((ong) => (
                    <div key={ong.id} className={"col-12 m-auto d-flex " + css.cardBonito}>
                        <div className={"d-flex justify-content-around"}>
                            <p className={css.nome}>{ong.nome}</p>
                        </div>
                        <p className={css.item_impar}>ID: {ong.id_usuario}</p>
                        <p className={css.item_par}>{ong.descricao_causa}</p>
                        <p className={css.item_impar}>Situação: {ong.situacao}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}