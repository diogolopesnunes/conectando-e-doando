import Buton from "../Buton/Buton.jsx";
import css from "./CardProjeto.module.css";
import { Link } from "react-router-dom";
import {useState} from "react";

export default function CardProjeto({ NomeProjeto, id, title, api, idUsuario, atividade = 1, onAtualizar }) {
    const [mensagem, setMensagem] = useState();
    async function ativarDesativar(e) {
        e.preventDefault();
        e.stopPropagation();

        const resposta = await fetch(`${api}/ativar_desativar_projeto/${idUsuario}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });

        const retorno = await resposta.json();
        if (retorno.mensagem) {
            setMensagem({
                texto: retorno.mensagem.descricao,
                tipo: retorno.mensagem.tipo
            });
        }
        if (onAtualizar) onAtualizar();
    }

    return (
        <div className={'row w-75 m-auto bg-light p-2 rounded-2 shadow-sm my-3 flex-column flex-sm-row text-center text-sm-start '  + css.card} title={title}>
            <div className={'col-sm-6 col-12 mb-4 mb-sm-0 ' + css.textoGrande}>
                <Link to={`/projeto/${id}`}>
                    <h5>{NomeProjeto}</h5>
                </Link>
            </div>
            <div className={'col d-flex justify-content-evenly flex-sm-row flex-column gap-3'}>
                <Buton tamanho={'pequeno'} texto={'Fazer post'} background={'rosa'} rota={`/adicionar_post/${id}`}/>
                <Buton tamanho={'pequeno'} texto={'Editar'} background={'laranja'} rota={`/edicao_projetos/${id}`}/>
                <Buton
                    tamanho={'pequeno'}
                    texto={Number(atividade) === 1 ? 'Desativar' : 'Ativar'}
                    background={Number(atividade) === 1 ? 'vermelho' : 'verde'}
                    onClick={ativarDesativar}
                />
            </div>
        </div>
    );
}
