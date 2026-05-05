import css from './CardPost.module.css'
import {useState} from "react";

export default function CardPost({logo, nomeOng, bannerPost, descricao, dataHora, tituloPost}){
    const [modalAberto, setModalAberto] = useState(false);
    return (
        <>
            <div className={`col-12 m-auto d-flex px-4 py-2 ${css.cardPost}`}>
                <div className={'row w-25'}>
                    <div className={'col-12 d-flex align-items-center'}>
                        <img className={`${css.logoOng}`} alt={`Logo da ong ${nomeOng}`} src={logo}/>
                        <p>{nomeOng}</p>
                    </div>
                    <div className={`col-12 `}>
                        <img className={`w-100 ${css.imagemPost}`} src={bannerPost} alt={'Imagem sobre ' + descricao}/>
                    </div>
                </div>
                <div className={'row w-75 d-flex'}>
                    <div className={'col-12 d-flex justify-content-end'}>
                        <p>{dataHora}</p>
                    </div>
                    <div className={'col-12 px-4'}>
                        <h4>{tituloPost}</h4>
                    </div>
                    <div className={'col-12 px-4'}>
                        <p className={`${css.descricao}`}>{descricao}</p>
                        <h6 className={`mt-2 text-end ${css.clicavel}`} onClick={() => setModalAberto(true)}>Ver descrição completa</h6>
                    </div>
                </div>

            </div>
            {modalAberto && (
                <>
                    <div className={`${css.sobrepor} col-6 d-flex flex-column position-fixed top-50 start-50 translate-middle bg-light px-3 pb-3 rounded shadow-lg`}>
                        <div className={`${css.bordaCabecalho} p-3 d-flex justify-content-between mb-3 position-sticky top-0 cor-fundo-laranja`}>
                            <h4 className={'d-flex align-items-center'}>Descrição do post: {tituloPost}</h4>
                            <p className={`${css.clicavel} fs-4 fw-bold`} onClick={() => setModalAberto(false)}>X</p>
                        </div>
                        <p>{descricao}</p>
                    </div>
                    <div className={`bg-black w-100 position-fixed top-50 start-50 translate-middle opacity-50 ${css.fundoPreto}`}>
                    </div>
                </>
            )}
        </>
    )
}