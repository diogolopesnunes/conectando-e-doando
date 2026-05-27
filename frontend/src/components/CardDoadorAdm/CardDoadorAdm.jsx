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


    const [loadingBloquear, setLoadingBloquear] = useState(false);
    const [hoverMenu, setHoverMenu] = useState(false);

    const status = Number(situacao);

    

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
        <div className={`row shadow rounded p-2 ${css.cardDoadorAdm}`}>
            {status === 1 ? (
                <div className={`${css.linhaAtivo}`}></div>
            ) : status === 2 || status === 3 ? (
                <div className={`${css.linhaBloqueado}`}></div>
            ) : status === 5 ? (
                <div className={`${css.linhaRecusado}`}></div>
            ) : (
                <div className={`${css.linhaRecusado}`}></div>
            )}
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

            <div className={'col-12 col-sm-4 d-flex align-items-start justify-content-end gap-1 flex-row flex-sm-row'}>


                {status !== 4 && status !== 0 && (
                    <div
                        onMouseEnter={() => setHoverMenu(true)}
                        onMouseLeave={() => setHoverMenu(false)}
                    >
                        <div className={`d-flex ${css.hamburguer} ${hoverMenu ? css.girar : ''}`}>
                            <img src="./redirecionamento.png" alt="Hamburguer" />
                        </div>
                        <div className={`p-2 rounded ${css.opcoesExpansivo} ${hoverMenu ? css.expandir : ''}`}>
                            <p className={"text-center fw-bold fs-5"}>Opções</p>
                            <div className={`d-flex flex-column align-items-center justify-content-center m-auto gap-2 p-2 ${css.opcoesExpansivoConteudo}`}>
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
                                        disabled={loadingBloquear}
                                        rota={`/enviar_email_bloquear/${id}`}
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
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>















    );
}
