import css from "./CardOngAdm.module.css";
import Buton from "../Buton/Buton.jsx";
import { useState } from "react";

export default function CardOngAdm({
                                       id,
                                       nomeOng,
                                       cnpj,
                                       telefone,
                                       registro,
                                       descricao,
                                       situacao,
                                       api,
                                       idAdm,
                                       onAtualizar,
                                       onMensagem
                                   }) {
    const [loadingAprovar, setLoadingAprovar] = useState(false);
    const [loadingBloquear, setLoadingBloquear] = useState(false);

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

        if (onAtualizar) {
            onAtualizar();
        }

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

    return (
        <div className={'row shadow rounded p-2'}>
            <div className={'col-12 col-sm-8'}>
                <div className={'d-flex gap-3 ' + css.nome}>
                    <p className={'px-2 rounded ' + css.idStyle}>ID {id}</p>

                    {situacao == 1 ? (
                        <p className={'px-2 rounded d-none d-sm-block ' + css.ativo}>Ativado</p>
                    ) : situacao == 2 || situacao == 3 ? (
                        <p className={'px-2 rounded d-none d-sm-block ' + css.bloqueado}>Bloqueado</p>
                    ) : situacao == 5 ? (
                        <p className={'px-2 rounded d-none d-sm-block ' + css.recusado}>Recusado</p>
                    ) : (
                        <p className={'px-2 rounded d-none d-sm-block ' + css.recusado}>Pendente</p>
                    )}

                    <p className={css.nomeJorge}>{nomeOng}</p>
                </div>

                <div className={'d-flex justify-content-between align-items-start flex-sm-row flex-column my-3 ' + css.infos}>
                    <p>CNPJ: {cnpj}</p>
                    <p>Telefone: {telefone}</p>
                    <p>Registro: {registro}</p>
                </div>

                <div className={css.justify + ' ' + css.infos}>
                    <p>{descricao}</p>
                </div>
            </div>

            <div className={'col-12 col-sm-4 d-flex align-items-center justify-content-center gap-1 flex-column flex-sm-row'}>
                {(Number(situacao) === 4 || Number(situacao) === 0) && (
                    <div className={'d-flex flex-column gap-2'}>
                        <Buton
                            texto={loadingAprovar ? 'Aprovando...' : 'Aprovar'}
                            tamanho={'pequeno'}
                            background={'verde'}
                            onClick={aprovar}
                            disabled={loadingAprovar}
                        />

                        <Buton
                            texto={'Reprovar'}
                            tamanho={'pequeno'}
                            background={'vermelho'}
                            rota={`/enviar_email/${id}`}
                        />
                    </div>
                )}

                {Number(situacao) !== 4 && Number(situacao) !== 0 && (
                    <>
                        <Buton
                            texto={'Editar'}
                            background={'roxo'}
                            tamanho={'pequeno'}
                            rota={`/edicao_ongs/${id}`}
                        />

                        {Number(situacao) === 1 ? (
                            <Buton
                                texto={loadingBloquear ? 'Bloqueando...' : 'Bloquear'}
                                background={'rosa'}
                                tamanho={'pequeno'}
                                onClick={bloquearDesbloquear}
                                disabled={loadingBloquear}
                            />
                        ) : (Number(situacao) === 2 || Number(situacao) === 3) ? (
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