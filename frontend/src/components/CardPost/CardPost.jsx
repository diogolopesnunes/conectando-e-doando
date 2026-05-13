import css from './CardPost.module.css'
import {useEffect, useRef, useState} from "react";
import Buton from "../Buton/Buton.jsx";
import Titulo from "../Titulo/Titulo.jsx";
import {Link, useNavigate} from "react-router-dom";
import Alerts from "../Alerts/Alerts.jsx";
import Comentario from "../Comentario/Comentario.jsx";
import Input from "../Input/Input.jsx";
import Form from "../Form/Form.jsx";

export default function CardPost({logo, comentariosPost, setIdPost, nomeOng, bannerPost, postImagem, ongImagem, descricao, dataHora, tituloPost, idProjeto, idOng, comentario, setComentario, comentar, listarComentarios, idPost, api,  totalCurtidas = 0, totalComentarios = 0, curtidoInicial = false, seguindoInicial = false, aoAlterarSeguimento, aoAlterarCurtida, aoAlterarOngsFavoritas,
                                     temaOng}){
    const [modalAberto, setModalAberto] = useState(false);
    const [comentarios, setComentarios] = useState(false);
    const [pagina, setPagina] = useState(1);
    const [proximaPagina, setProximaPagina] = useState(2);
    const [paginaAnterior, setPaginaAnterior] = useState(0);

    // Estados das curtidas
    const [quantidade, setQuantidade] = useState(totalCurtidas);
    const [curtido, setCurtido] = useState(curtidoInicial);
    const [carregandoCurtida, setCarregandoCurtida] = useState(false);

    const [seguindo, setSeguindo] = useState(seguindoInicial);
    const [carregandoSeguir, setCarregandoSeguir] = useState(false);
    const [mensagem, setMensagem] = useState(null)

    const inicioListaRef = useRef(null);
    const listaComentariosRef = useRef(null);
    const fimListaRef = useRef(null);

    const navigate = useNavigate();


    // Atualiza os valores quando as props mudarem
    useEffect(() => {
        setQuantidade(totalCurtidas);
        setCurtido(curtidoInicial);
        setSeguindo(seguindoInicial);
    }, [totalCurtidas, curtidoInicial, seguindoInicial]);

    useEffect(() => {
        if (!comentarios) return;
        if (!fimListaRef.current) return;
        if (!inicioListaRef.current) return;

        const observerFinal = new IntersectionObserver((entries) => {
            const elemento = entries[0];

            if (elemento.isIntersecting) {
                console.log("Chegou no final da lista");

                if (proximaPagina > pagina) {
                    setPagina(proximaPagina);
                    setProximaPagina(proximaPagina + 1);
                }
            }
        });

        const observerInicio = new IntersectionObserver((entries) => {
            const elemento = entries[0];

            if (elemento.isIntersecting) {
                console.log("Chegou no começo da lista");

                if (paginaAnterior < pagina) {
                    setPagina(paginaAnterior);
                    setPaginaAnterior(paginaAnterior - 1);
                    console.log(pagina);
                }
            }
        });

        observerFinal.observe(fimListaRef.current);
        observerInicio.observe(inicioListaRef.current);

        return () => {
            observerFinal.disconnect();
            observerInicio.disconnect();
        };
    }, [comentarios, proximaPagina, paginaAnterior, pagina]);

    async function curtirDescurtirPost() {
        // Evita múltiplos cliques enquanto a requisição está em andamento
        if (carregandoCurtida) return;

        try {
            setCarregandoCurtida(true);

            const resposta = await fetch(
                `${api}/descurtir_curtir_post/${idPost}`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            );

            const dados = await resposta.json();

            // Exibe a mensagem retornada pela API
            if (dados.mensagem) {
                setMensagem(dados.mensagem);
            }

            if (resposta.ok) {
                // Atualiza o estado local do card
                setCurtido(dados.curtido);

                // Calcula o novo total de curtidas
                const novoTotal =
                    dados.total_curtidas !== undefined
                        ? dados.total_curtidas
                        : (
                            dados.curtido
                                ? quantidade + 1
                                : Math.max(0, quantidade - 1)
                        );

                // Atualiza o número de curtidas no próprio card
                setQuantidade(novoTotal);

                // Atualiza também o estado no Feed
                if (aoAlterarCurtida) {
                    aoAlterarCurtida(idPost, dados.curtido, novoTotal);
                }

                console.log(dados.mensagem.descricao);
            } else {
                console.error(dados.mensagem.descricao);
            }
        } catch (erro) {
            console.error('Erro ao curtir/descurtir o post:', erro);
        } finally {
            setCarregandoCurtida(false);
        }
    }

    async function seguirDesseguirOng() {
        if (carregandoSeguir) return;

        try {

            setCarregandoSeguir(true);

            const resposta = await fetch(
                `${api}/deseguir_seguir_ong/${idOng}`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            );
            const dados = await resposta.json();
            if (dados.mensagem){
                setMensagem(dados.mensagem);
            }

            if (resposta.ok) {
                setSeguindo(dados.seguindo);

                // Atualiza todos os posts da mesma ONG
                if (aoAlterarSeguimento) {
                    aoAlterarSeguimento(idOng, dados.seguindo);
                }
                if (aoAlterarOngsFavoritas) {
                    aoAlterarOngsFavoritas(
                        idOng,
                        nomeOng,
                        temaOng,
                        ongImagem,
                        dados.seguindo
                    );
                }
            }
        } catch (erro) {
            console.error('Erro ao seguir/desseguir ONG:', erro);
        } finally {
            setCarregandoSeguir(false);
        }
    }

    useEffect(() => {
        if (mensagem) {
            const timer = setTimeout(() => {
                setMensagem(null);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [mensagem]);

    return (
        <div className={'d-flex flex-column flex-sm-row'}>
            {mensagem && (
                <div className={'col-12 position-absolute'}>
                    <Alerts
                        tipo={mensagem.tipo}
                        imagem={`/public/${mensagem.tipo}.png`}
                        duracao={10000}
                        descricao={mensagem.descricao}
                    />
                </div>
            )}
            <div className={`col-10 col-sm-10 m-auto d-flex px-4 py-2 mt-3 flex-column ${css.cardPost}`}>
                <div className={'row w-100'}>
                    <div className={'col-12 d-flex flex-column flex-md-row justify-content-sm-between justify-content-center align-items-center'}>
                        <div className={"d-flex align-items-center justify-content-center justify-content-sm-start gap-3"}>
                            <Link to={`/previa_ong/${idOng}`}>
                                <div className={'col-12 col-sm-12 d-flex align-items-center justify-content-center justify-content-sm-start gap-2'}>
                                    <img
                                        className={css.logoOng}
                                        alt={`Logo da ONG ${nomeOng}`}
                                        src={`${api}${ongImagem}?t=${Date.now()}`}
                                        onError={(e) => {
                                            e.target.src = "/public/SemImagemDisponivel.png";
                                        }}
                                    />
                                    <p className={`${css.linkRosa} d-inline`}>
                                        {nomeOng}
                                    </p>
                                </div>
                            </Link>
                            <img
                                src={seguindo ? '/seguir.png' : '/deseguir.png'}
                                className={css.teste}
                                alt={seguindo ? 'Deixar de seguir ONG' : 'Seguir ONG'}
                                title={seguindo ? 'Deixar de seguir ONG' : 'Seguir ONG'}
                                onClick={seguirDesseguirOng}
                                style={{ cursor: 'pointer' }}/>
                        </div>
                        <p>{dataHora}</p>
                    </div>
                </div>

                <div className={'row w-100 d-flex'}>

                    <div className={'col-12 d-flex col-sm-6 m-auto justify-content-center align-items-center ' + css.divImagemPost}>
                        <img
                            className={`w-100 ${css.imagemPost}`}
                            src={`${api}${postImagem}?t=${Date.now()}`}
                            alt={'Imagem do post'}
                            onError={(e) => {
                                e.target.src = "/public/SemImagemDisponivel.png";
                            }}
                        />
                    </div>

                    <div className={'col-12 col-sm-6'}>
                        <div className={'row px-2'}>
                            <div className={'col-12 my-3'}>
                                <h4 className={css.titulo}>{tituloPost}</h4>
                            </div>

                            <div className={'col-12 w-100'}>
                                <p className={`${css.descricao} mb-2`}>
                                    {descricao}
                                </p>

                                <h6
                                    className={`my-3 text-center text-sm-end ${css.clicavel}`}
                                    onClick={() => setModalAberto(true)}
                                >
                                    Ver descrição completa
                                </h6>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={`row w-100 d-flex justify-content-between ${css.clicavel}`}>

                    <div
                        className={'col d-flex align-items-center'}
                        onClick={() => {
                            setComentarios(!comentarios)
                            listarComentarios(idPost)
                        }}
                    >
                        <img
                            src="/Comentarios.png"
                            alt="Comentários"
                            title="Ver comentários"
                            className={css.icons}
                        />

                        <p className="d-flex align-items-center mb-0">
                            {totalComentarios}
                        </p>
                    </div>

                    <div
                        className={'col d-flex justify-content-end'}
                        onClick={curtirDescurtirPost}
                    >
                        <p className="d-flex align-items-center">
                            {quantidade}
                        </p>

                        <img
                            src={curtido ? '/like.png' : '/deslike.png'}
                            className={css.teste}
                            alt={curtido ? 'Post curtido' : 'Curtir post'}
                            title={curtido ? 'Descurtir Post' : 'Curtir Post'}
                        />
                    </div>
                </div>
            </div>

            {comentarios && (
                <>
                    <div className={`${css.sobrepor} col-10 col-sm-8 d-flex px-4 pt-0 py-2 mt-0 mt-sm-3 flex-column position-fixed top-50 start-50 translate-middle bg-white ${css.cardPost}`}>
                        <div className={`${css.bordaCabecalho} mt-0 p-3 d-flex justify-content-between mb-3 cor-fundo-laranja gap-3`}>
                            <h3 className={'d-flex align-items-center'}>
                                Comentários
                            </h3>
                            <p
                                className={`${css.clicavel} fs-4 fw-bold m-0 text-end`}
                                onClick={() => setComentarios(false)}
                            >
                                X
                            </p>
                        </div>
                        {comentariosPost && comentariosPost.length > 0 ? (
                            comentariosPost.map((coment) => (
                                <Comentario
                                    key={coment.id_comentario}
                                    comentario={{
                                        mensagem: coment.comentario,
                                        data: coment.data_hora,
                                        usuario: coment.usuario
                                    }}
                                />
                            ))
                        ) : (
                            <p className="text-center">Nenhum comentário ainda.</p>
                        )}
                        <div>
                            <Form largura={'comentario'} onSubmit={(e) => comentar(e, idPost)}>
                                <div className={`d-flex flex-column flex-sm-row justify-content-around align-items-center px-2 py-1 m-auto gap-0 gap-sm-5 ${css.containterInput}`}>
                                    <input
                                        className={`w-100 rounded py-3 text-center text-sm-start ${css.inpComentario}`}
                                        type={'text'} placeholder={'Deixe sua mensagem'} value={comentario} onChange={(e) => setComentario(e.target.value)}/>
                                    <Buton texto={'Comentar'} background={'laranja'} tamanho={'pequeno'} tipo={'submit'}/>
                                </div>
                            </Form>
                        </div>
                    </div>
                    <div className={`bg-black w-100 position-fixed top-50 start-50 translate-middle opacity-75 ${css.fundoPreto}`}></div>
                </>
            )}

            {modalAberto && (
                <>
                    <div className={`${css.sobrepor} col-10 col-sm-8 d-flex flex-column position-fixed top-50 start-50 translate-middle bg-light px-3 pb-3 rounded shadow-lg`}>
                        <div className={`${css.bordaCabecalho} p-3 d-flex justify-content-between mb-3 position-sticky top-0 cor-fundo-laranja gap-3`}>
                            <h4 className={css.tituloDescricao}>
                                <span className={'d-none d-sm-inline-block'}>
                                    Descrição do post:
                                </span>{' '}
                                {tituloPost}
                            </h4>

                            <p
                                className={`${css.clicavel} fs-4 fw-bold m-0`}
                                onClick={() => setModalAberto(false)}
                            >
                                X
                            </p>
                        </div>

                        <p>{descricao}</p>
                    </div>

                    <div className={`bg-black w-100 position-fixed top-50 start-50 translate-middle opacity-75 ${css.fundoPreto}`}></div>
                </>
            )}
        </div>
    );
}
