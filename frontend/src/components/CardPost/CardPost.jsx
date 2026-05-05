import css from './CardPost.module.css'
import {useState} from "react";

export default function CardPost({logo, nomeOng, bannerPost, descricao, dataHora, tituloPost}){
    const [modalAberto, setModalAberto] = useState(false);
    const [comentarios, setComentarios] = useState(false)
    return (
        <div className={'d-flex flex-column flex-sm-row '}>
            <div className={`col-10 col-sm-6 m-auto d-flex px-4 py-2 mt-3 d-flex flex-column ${css.cardPost} ${comentarios && (css.cardPost2)}`}>
                <div className={'row w-100'}>
                    <div className={'col-12 col-sm-6 d-flex align-items-center justify-content-center justify-content-sm-start gap-2'}>
                        <img className={`${css.logoOng}`} alt={`Logo da ong ${nomeOng}`} src={logo}/>
                        <p>{nomeOng}</p>
                    </div>
                    <div className={'col-12 col-sm-6 d-flex justify-content-sm-end justify-content-center align-items-center'}>
                        <p>{dataHora}</p>
                    </div>
                    <div className={`col-6 m-auto`}>
                        <img className={`w-100 ${css.imagemPost}`} src={bannerPost} alt={'Imagem sobre ' + descricao}/>
                    </div>
                </div>
                <div className={'row w-100 d-flex'}>
                    <div className={'col-12 my-3'}>
                        <h4 className={`${css.titulo}`}>{tituloPost}</h4>
                    </div>
                    <div className={'col-12 w-100'}>
                        <p className={`${css.descricao} mb-2`}>{descricao}</p>
                        <h6 className={`my-3 text-center text-sm-end ${css.clicavel}`} onClick={() => setModalAberto(true)}>Ver descrição completa</h6>
                    </div>
                </div>
                <div className={'row w-100 d-flex'} onClick={() => setComentarios(!comentarios)}>
                    <p>Comentários</p>
                </div>
            </div>
            {comentarios && (
                <div className={`col-10 col-sm-6 d-flex px-4 py-2 mt-3 d-flex flex-column ${css.cardPost} ${css.cardComentario}`}></div>
            )}
            {modalAberto && (
                <>
                    <div className={`${css.sobrepor} col-10 col-sm-8 d-flex flex-column position-fixed top-50 start-50 translate-middle bg-light px-3 pb-3 rounded shadow-lg`}>
                        <div className={`${css.bordaCabecalho} p-3 d-flex justify-content-between mb-3 position-sticky top-0 cor-fundo-laranja gap-3`}>
                            <h4 className={`${css.tituloDescricao}`}><span className={'d-none d-sm-inline-block'}>Descrição do post:</span> {tituloPost}</h4>
                            <p className={`${css.clicavel} fs-4 fw-bold m-0`} onClick={() => setModalAberto(false)}>X</p>
                        </div>
                        <p>{descricao}</p>
                    </div>
                    <div className={`bg-black w-100 position-fixed top-50 start-50 translate-middle opacity-75 ${css.fundoPreto}`}>
                    </div>
                </>
            )}
        </div>
    )
}