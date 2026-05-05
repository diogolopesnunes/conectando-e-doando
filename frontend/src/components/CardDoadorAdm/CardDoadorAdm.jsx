import Buton from "../Buton/Buton.jsx";
import { useState } from "react";
import { Link } from "react-router-dom";
import css from "./CardDoadorAdm.module.css"
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function CardDoadorAdm({
                                       id,
                                       nome,
                                       cpf,
                                       telefone,
                                       registro,
                                       situacao,
                                       api,
                                       idAdm,
                                       onAtualizar,
                                       onMensagem
                                   }) {

    const [loadingAprovar, setLoadingAprovar] = useState(false);
    const [loadingBloquear, setLoadingBloquear] = useState(false);

    const status = Number(situacao);

    async function aprovar() {
        setLoadingAprovar(true);

        const resposta = await fetch(`${api}/permitir_recusar_ong/${idAdm}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ acao: 1 })
        });

        const retorno = await resposta.json();

        if (retorno.mensagem && onMensagem) {
            onMensagem(retorno.mensagem);
        }

        if (onAtualizar) onAtualizar();

        setLoadingAprovar(false);
    }

    async function bloquearDesbloquear() {
        setLoadingBloquear(true);

        const resposta = await fetch(`${api}/ativar_desativar_usuario/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });

        const retorno = await resposta.json();
        const msg = retorno.mensagem || retorno.message || retorno.error;

        if (msg && onMensagem) {
            onMensagem(
                msg.descricao
                    ? msg
                    : { tipo: "info", descricao: msg }
            );
        }

        if (onAtualizar) onAtualizar();

        setLoadingBloquear(false);
    }

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

    async function excluirUsuario() {
        const confirmou = await confirmarExclusao();
        if (!confirmou) return;

        const resposta = await fetch(
            `${api}/excluir_usuario/${idAdm}/${id}`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            }
        );

        const retorno = await resposta.json();
        const msg = retorno.mensagem || retorno.message || retorno.error;

        if (msg && onMensagem) {
            onMensagem(
                msg.descricao
                    ? msg
                    : { tipo: "info", descricao: msg }
            );
        }

        if (onAtualizar) onAtualizar();
    }

    return (
        <div className={'row shadow rounded p-2'}>
            <div className={'col-12 col-sm-8'}>
                <div>
                    <div className={'d-flex gap-3 ' + css.nome}>
                        <p className={'px-2 rounded ' + css.idStyle}>ID {id}</p>

                        {status === 1 ? (
                            <p className={'px-2 rounded d-none d-sm-block ' + css.ativo}>Ativado</p>
                        ) : status === 2 || status === 3 ? (
                            <p className={'px-2 rounded d-none d-sm-block ' + css.bloqueado}>Bloqueado</p>
                        ) : status === 5 ? (
                            <p className={'px-2 rounded d-none d-sm-block ' + css.recusado}>Recusado</p>
                        ) : (
                            <p className={'px-2 rounded d-none d-sm-block ' + css.recusado}>Pendente</p>
                        )}

                        <p className={css.nomeCortar}>{nome}</p>
                    </div>

                    <div className={'d-flex justify-content-between flex-column flex-lg-row my-3 ' + css.infos}>
                        <p>CPF: {cpf}</p>
                        <p>Telefone: {telefone}</p>
                        <p>Registro: {registro}</p>
                    </div>
                </div>
            </div>

            <div className={'col-12 col-sm-4 d-flex align-items-center justify-content-end gap-1 flex-row flex-sm-row'}>

                {(status === 4 || status === 0) && (
                    <>
                        <Buton
                            texto={loadingAprovar ? 'Validando...' : 'Validar'}
                            tamanho={'pequeno'}
                            background={'verde'}
                            onClick={aprovar}
                            disabled={loadingAprovar}
                        />
                    </>
                )}

                {status !== 4 && status !== 0 && (
                    <>

                        {[2, 3, 5].includes(status) && (
                            <Buton
                                texto={'Excluir'}
                                background={'vermelho'}
                                tamanho={'pequeno'}
                                onClick={excluirUsuario}
                            />
                        )}

                        <Buton
                            texto={'Editar'}
                            background={'roxo'}
                            tamanho={'pequeno'}
                            rota={`/edicao_doadores/${id}`}
                        />

                        {status === 1 ? (
                            <Buton
                                texto={loadingBloquear ? 'Bloqueando...' : 'Bloquear'}
                                background={'rosa'}
                                tamanho={'pequeno'}
                                onClick={bloquearDesbloquear}
                                disabled={loadingBloquear}
                                rota={`/enviar_email/${id}`}
                            />
                        ) : (status === 2 || status === 3) ? (
                            <Buton
                                texto={loadingBloquear ? 'Desbloqueando...' : 'Desbloquear'}
                                background={'laranja'}
                                tamanho={'pequeno'}
                                onClick={bloquearDesbloquear}
                                disabled={loadingBloquear}
                            />
                        ) : null}
                    </>
                )}
            </div>
        </div>















    );
}