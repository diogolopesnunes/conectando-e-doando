import Buton from "../Buton/Buton.jsx";
import css from "./CardProjeto.module.css";
import { Link } from "react-router-dom";
import {useState} from "react";
import Swal from "sweetalert2";

export default function CardProjeto({ NomeProjeto, id, title, api, idUsuario, atividade = 1, onAtualizar, setMensagem }) {
    async function confirmarExclusao() {
        const result = await Swal.fire({
            title: "Você tem certeza?",
            text: "Você não poderá refazer a ação!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim, deletar!",
            cancelButtonText: "Cancelar",
        });

        return result.isConfirmed;
    }

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
        <>
            <div className={'row w-100 m-auto bg-light p-2 rounded-2 shadow-sm justify-content-around my-3 text-center text-sm-start '  + css.card} title={title}>
                <div className={'col-sm-6 col-12 mb-4 mb-sm-0 ' + css.textoGrande}>
                    <Link to={`/projeto/${id}`}>
                        <h5 className={'text-center text-lg-start'}>{NomeProjeto}</h5>
                    </Link>
                </div>

                <div className={'col-sm-6 col-12 w-100 d-flex justify-content-end flex-sm-row flex-column gap-3 ' + css.botoes}>
                    {Number(atividade) === 1 &&
                        (
                            <>
                                <Buton tamanho={'pequeno'} texto={'Fazer post'} background={'rosa'} rota={`/adicionar_post/${id}`}/>
                                <Buton tamanho={'pequeno'} texto={'Editar'} background={'laranja'} rota={`/edicao_projetos/${id}`}/>
                            </>
                        )}
                    {Number(atividade) !== 1 && (
                        <Buton
                            tamanho={'pequeno'}
                            texto={'Excluir'}
                            background={'roxo'}
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const confirmou = await confirmarExclusao();
                                if (!confirmou) return;


                                const resposta = await fetch(`${api}/excluir_projeto/${idUsuario}/${id}`, {
                                    method: "DELETE",
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
                            }}
                        />
                    )}
                    <Buton
                        tamanho={'pequeno'}
                        texto={Number(atividade) === 1 ? 'Desativar' : 'Ativar'}
                        background={Number(atividade) === 1 ? 'vermelho' : 'bege'}
                        onClick={ativarDesativar}
                    />
                </div>
            </div>
        </>
    );
}
