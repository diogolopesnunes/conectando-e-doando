import css from "./CardOngAdm.module.css"
import Buton from "../Buton/Buton.jsx";
import {useState} from "react";

export default function CardOngAdm({id, nomeOng, cnpj, telefone, registro, descricao, situacao}) {
    // const [idUsuario, setIdUsuario] = useState(localStorage.getItem('idUsuario'));
    // async function aprovarReprovar(valor){
    //     let retorno = await fetch(`${api}/permitir_recusar_ong/${idUsuario}/${id}`, {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         credentials: "include",
    //         body: JSON.stringify({
    //             email, senha
    //         })
    //     });
    //
    //     retorno = await retorno.json();
    //     console.log(retorno);
    //
    //
    //     if (retorno.mensagem) {
    //         setMensagem({
    //             id: Date.now(),
    //             texto: retorno.mensagem.descricao,
    //             tipo: retorno.mensagem.tipo
    //         });
    //     }
    // }

    return (
        <div className={'row shadow rounded p-2'}>
            <div className={'col-12 col-sm-8'}>
                <div className={'d-flex gap-3 ' + css.nome}>
                    <p className={'px-2 rounded ' + css.idStyle}>ID {id}</p>
                    {situacao == 1 ?(
                        <p className={'px-2 rounded d-none d-sm-block ' + css.ativo}>Ativado</p>
                    ): situacao == 2 ?(
                        <p className={'px-2 rounded d-none d-sm-block ' + css.bloqueado}>Bloqueado</p>
                    ): situacao == 5 &&(
                        <p className={'px-2 rounded d-none d-sm-block ' + css.recusado}>Recusado</p>
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
                {situacao == 4 && (
                    <div className={'d-flex flex-column gap-2'}>
                        <Buton texto={'Aprovar'} tamanho={'pequeno'} background={'verde'} />
                        <Buton texto={'Reprovar'} tamanho={'pequeno'} background={'vermelho'}/>
                    </div>
                )}
                {situacao == 0 &&(
                    <div className={'d-flex flex-column gap-2'}>
                        <Buton texto={'Aprovar'} tamanho={'pequeno'} background={'verde'} />
                        <Buton texto={'Reprovar'} tamanho={'pequeno'} background={'vermelho'}/>
                    </div>
                )}
                {situacao != 0 && situacao != 4 && (
                    <Buton texto={'Editar'} background={'roxo'} tamanho={'pequeno'} rota={`/edicao_ongs/${id}`}/>
                )}
                {situacao == 3 || situacao == 2 ? (
                    <div className={'d-flex flex-column gap-2'}>
                        <Buton texto={'Desbloquear'} background={'laranja'} tamanho={'pequeno'}/>
                        {situacao == 2 && (
                            <Buton texto={'Excluir'} background={'vermelho'} tamanho={'pequeno'}/>
                        )}
                    </div>
                ) : situacao == 1 ? (
                    <Buton texto={'Bloquear'} background={'rosa'} tamanho={'pequeno'}/>
                ) : situacao == 5 && (
                    <Buton texto={'Excluir'} background={'vermelho'} tamanho={'pequeno'}/>
                )}
            </div>


        </div>
    )
}