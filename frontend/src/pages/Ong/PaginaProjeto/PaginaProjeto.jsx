import Nav from "../../../components/Nav/Nav.jsx";
import Buton from "../../../components/Buton/Buton.jsx";
import Input from "../../../components/Input/Input.jsx";
import CardProjeto from "../../../components/CardProjeto/CardProjeto.jsx";
import Titulo from "../../../components/Titulo/Titulo.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";

export default function PaginaProjeto({ api }){
    const { id_projeto } = useParams()

    const [idUsuario, setIdUsuario] = useState("");
    const navegate = useNavigate();

    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
            navigate('/login')
        } else{
            setIdUsuario(localStorage.getItem("id_usuario"));
        }
    }, [])


    useEffect(() => {
        if (mensagem) {
            const timer = setTimeout(() => {
                setMensagem('');
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [mensagem]);

    async function listarPosts(){
        let resposta = await fetch(`${api}/listar_projetos/${id_projeto}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
        })
        let retorno = await projetos.json()
        if (retorno.projetos){
            setProjetos(retorno.projetos)
            setProximaPagina(retorno.proximaPagina)
            setPaginaAnterior(retorno.paginaAnterior)
            setQuantidade(retorno.numeroPaginas)
        }
    }

    return (
        <div className={'container m-auto d-flex align-items-center justify-content-center '}>
            <div className="row w-100">
                <div className="col-12">
                    <Nav/>
                </div>
                <div className={'col-12'}>

                </div>
            </div>
        </div>
    )
}