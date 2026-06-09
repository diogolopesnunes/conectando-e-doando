import Buton from "../Buton/Buton.jsx";
import { useState } from "react";
import { Link } from "react-router-dom";
import css from "./CardUsuarioAdm.module.css"
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function CardUsuarioAdm({
                                          id,
                                          nome,
                                          email,
                                          cpfCnpj,
                                          telefone,
                                          registro,
                                          situacao,
                                          descricao,
                                          api,
                                          idAdm,
                                          onAtualizar,
                                          onMensagem,
                                          tipo
                                      }) {

    const [loadingAprovar, setLoadingAprovar] = useState(false);
    const [loadingBloquear, setLoadingBloquear] = useState(false);
    const [hoverMenu, setHoverMenu] = useState(false);

    const status = Number(situacao);

    const usuarioDoador = tipo === 0;
    const usuarioOng = tipo === 1;
    const usuarioAdm = tipo === 2;

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
        <div className={`shadow rounded p-2 justify-content-between align-items-start w-100 ${css.cardUsuarioAdm}`}>
            {status === 1 ? (
                <div className={`${css.linhaAtivo}`}></div>
            ) : status === 2 || status === 3 ? (
                <div className={`${css.linhaBloqueado}`}></div>
            ) : status === 5 ? (
                <div className={`${css.linhaRecusado}`}></div>
            ) : (
                <div className={`${css.linhaRecusado}`}></div>
            )}
            <div className="d-flex justify-content-between align-items-start w-100">
                <Link to={usuarioOng ? `/previa_ong/${id}` : "#"} className={'d-flex w-75'}>
                    <div className={"w-100"}>
                        <div className={'d-flex gap-1 ' + css.nome}>
                            {/*<p className={'px-2 rounded ' + css.idStyle}>ID {id}</p>*/}

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
                        <div className={'d-flex justify-content-between flex-column flex-lg-row my-3' + css.infos}>
                            {usuarioOng ? (
                                <div className={'d-flex flex-column w-100'}>
                                    <div className={'d-flex justify-content-between flex-column flex-lg-row my-3 w-100 ' + css.infos}>
                                        <p className={css.tamanhoInfo}>CNPJ: {cpfCnpj}</p>
                                        <p className={css.tamanhoInfo}>Telefone: {telefone}</p>
                                        <p className={css.tamanhoInfo}>Registro: {registro}</p>
                                    </div>

                                </div>
                            ) : (
                                <div className={'d-flex justify-content-between flex-column flex-lg-row my-3 w-100 ' + css.infos}>
                                    <p className={css.tamanhoInfo}>CPF: {cpfCnpj}</p>
                                    <p className={css.tamanhoInfo}>Telefone: {telefone}</p>
                                    <p className={css.tamanhoInfo}>Registro: {registro}</p>
                                </div>
                            )
                            }
                        </div>
                    </div>
                </Link>
                <div className={`flex-shrink-0`}>

                    {usuarioOng && (status === 4 || status === 0) && (
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
                            </div>
                        </div>
                    )}

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
                                        rota={
                                            usuarioDoador
                                                ? `/edicao_doadores/${id}`
                                                : usuarioOng
                                                    ? `/edicao_ongs/${id}`
                                                    : usuarioAdm
                                                        ? `/edicao_adm/${id}`
                                                        : undefined
                                        }
                                    />

                                    {usuarioOng && (
                                        <Buton
                                            rota={`/historico_ong/${id}`}
                                            texto={'Histórico'}
                                            background={'bege'}
                                            tamanho={'pequeno'}
                                        />
                                    )}

                                    {usuarioDoador && (
                                        <Buton
                                            rota={`/historico_doador/${id}`}
                                            texto={'Histórico'}
                                            background={'bege'}
                                            tamanho={'pequeno'}
                                        />
                                    )}

                                    {status === 1 ? (
                                        <Buton
                                            texto={loadingBloquear ? 'Bloqueando...' : 'Bloquear'}
                                            background={'rosa'}
                                            tamanho={'pequeno'}
                                            disabled={loadingBloquear}
                                            rota={
                                                usuarioDoador
                                                    ? `/enviar_email_bloquear/${id}`
                                                    : undefined
                                            }
                                            onClick={
                                                !usuarioDoador
                                                    ? bloquearDesbloquear
                                                    : undefined
                                            }
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

        </div>


    );
}
