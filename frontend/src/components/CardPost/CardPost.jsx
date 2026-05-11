import css from './CardPost.module.css'
import {useEffect, useRef, useState} from "react";
import Buton from "../Buton/Buton.jsx";
import Titulo from "../Titulo/Titulo.jsx";

export default function CardPost({logo, nomeOng, bannerPost, descricao, dataHora, tituloPost}){
    const [modalAberto, setModalAberto] = useState(false);
    const [comentarios, setComentarios] = useState(false);
    const [pagina, setPagina] = useState(1);
    const [proximaPagina, setProximaPagina] = useState(2);
    const [paginaAnterior, setPaginaAnterior] = useState(0);
    const [quantidade, setQuantidade] = useState(0);

    const inicioListaRef = useRef(null);
    const listaComentariosRef = useRef(null);
    const fimListaRef = useRef(null);

    useEffect(() => {
        if (!comentarios) return;
        if (!fimListaRef.current) return;
        if (!inicioListaRef.current) return;

        const observerFinal = new IntersectionObserver((entries) => {
            const elemento = entries[0];

            if (elemento.isIntersecting) {
                console.log("Chegou no final da lista");

                if (proximaPagina>pagina) {
                    setPagina(proximaPagina);
                    setProximaPagina(proximaPagina+1);
                }
            }
        });

        const observerInicio = new IntersectionObserver((entries) => {
            const elemento = entries[0];

            if (elemento.isIntersecting) {
                console.log("Chegou no começo da lista");

                if (paginaAnterior<pagina) {
                    setPagina(paginaAnterior);
                    setPaginaAnterior(paginaAnterior-1);
                    console.log(pagina)
                }
            }
        });

        observerFinal.observe(fimListaRef.current);
        observerInicio.observe(inicioListaRef.current);

        return () => {
            observerFinal.disconnect();
            observerInicio.disconnect();
        };
    }, [comentarios, proximaPagina, paginaAnterior]);

    return (
        <div className={'d-flex flex-column flex-sm-row '}>
            <div className={`col-10 col-sm-6 m-auto d-flex px-4 py-2 mt-3 d-flex flex-column ${css.cardPost}`}>
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
                <div className={`row w-100 d-flex ${css.clicavel}`} onClick={() => setComentarios(!comentarios)}>
                    <p>Comentários</p>
                </div>
            </div>
            {comentarios && (
                <div className={`${css.sobrepor} col-10 col-sm-8 d-flex px-4 pt-0 py-2 mt-0 mt-sm-3 d-flex flex-column position-fixed top-50 start-50 translate-middle ${css.cardPost}`}>
                    <div className={`${css.bordaCabecalho} mt-0 p-3 d-flex justify-content-between mb-3 position-sticky top-0 cor-fundo-laranja gap-3`}>
                        <h3 className={'d-flex align-items-center'}>Comentários</h3>
                        <p className={`${css.clicavel} fs-4 fw-bold m-0 text-end`} onClick={() => setComentarios(false)}>X</p>
                    </div>
                    <div ref={inicioListaRef} className={`bg-light w-100 ${css.div}`}></div>
                    {pagina == 1 ?(
                        <>
                            <div className={`h-50 w-100 bg-black my-1 ${css.comentario}`}></div>
                            <div className={`h-50 w-100 bg-black my-1 ${css.comentario}`}></div>
                            <div className={`h-50 w-100 bg-black my-1 ${css.comentario}`}></div>
                            <div className={`h-50 w-100 bg-black my-1 ${css.comentario}`}></div>
                        </>
                    ):(
                        <>
                            <div className={`h-50 w-100 bg-warning my-1 ${css.comentario}`}></div>
                            <div className={`h-50 w-100 bg-warning my-1 ${css.comentario}`}></div>
                            <div className={`h-50 w-100 bg-warning my-1 ${css.comentario}`}></div>
                            <div className={`h-50 w-100 bg-warning my-1 ${css.comentario}`}></div>
                        </>
                    )}
                    <div ref={fimListaRef} className={`bg-light w-100 ${css.div}`}></div>
                </div>
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