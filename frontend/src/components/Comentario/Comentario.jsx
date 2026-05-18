import css from "./Comentario.module.css"
import Buton from "../Buton/Buton.jsx";
import {useEffect, useRef, useState} from "react";

export default function Comentario({comentario, idMensagem, excluirComentario, idPost, acoes, setEditar, setMensagemEditada, setIdMensagemEditada, idUsuario}){
    const [comentarioInteiro, setComentarioInteiro] = useState(false);
    const [tem3Pontos, setTem3Pontos] = useState(false);
    const [menuAberto, setMenuAberto] = useState(false);

    const mensagemRef = useRef(null);

    useEffect(() => {
        const elemento = mensagemRef.current;

        if (elemento) {
            const estourou = elemento.scrollWidth > elemento.clientWidth;
            setTem3Pontos(estourou);
        }
    }, [comentario.mensagem]);

    useEffect(() => {
        console.log('comentario inteiro');
    }, [comentarioInteiro])

    return (
        <div className={'border p-2 rounded my-1'}>
            {/*<img className={css.imagemUsuario} src={idUsuario ? `${api}/uploads/Usuarios/Icone_Perfil/${idUsuario}.jpg` : "/public/SemImagemDisponivel.png"} ></img>*/}

            <div className={'d-flex justify-content-between'}>
                <p className={'fw-bold'}>{comentario.usuario}</p>
                <div className={`d-flex justify-content-between align-items-center ${css.divMenu}`}>
                    <p className={'fw-bold'}>{comentario.data}</p>
                    {acoes && (
                        <div className={`d-flex align-items-center`}>
                            <img src={'/menuAcao3Pontos.png'} className={`${css.menu}`} onClick={() => setMenuAberto(!menuAberto)}></img>
                            {menuAberto && (
                                <div className={`d-flex flex-column justify-content-between bg-white ${css.menuAberto}`}>
                                    <p className={'rounded p-1 border'} onClick={() => {
                                        setEditar(true)
                                        setMensagemEditada(comentario.mensagem)
                                        setIdMensagemEditada(idMensagem)
                                    }}>Editar</p>
                                    <p className={'link bg-danger text-white border-danger rounded p-1'} onClick={() => excluirComentario(idMensagem, idPost)}>Deletar</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
            <p ref={mensagemRef} className={`${comentarioInteiro ? css.mensagemInteira : css.mensagem}`}>{comentario.mensagem}</p>
            {tem3Pontos && (
                <div className={`d-flex justify-content-start ${css.botaoVer}`}>
                    <Buton texto={`${!comentarioInteiro ?  'Ver tudo': 'Ver menos'}`} tamanho={'pequeno'} background={'branco'} onClick={()=> setComentarioInteiro(!comentarioInteiro) ? comentarioInteiro : !comentarioInteiro}/>
                </div>
            )}
        </div>
    )
}