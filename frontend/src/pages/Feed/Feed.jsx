import css from './Feed.module.css';
import CardPost from "../../components/CardPost/CardPost.jsx";
import {useEffect, useState, useRef} from "react";
import Alerts from "../../components/Alerts/Alerts.jsx";
import Nav from "../../components/Nav/Nav.jsx";
import OngsFavoritas from "../../components/OngsFavoritas/OngsFavoritas.jsx";
import Buton from "../../components/Buton/Buton.jsx";

export default function Feed({api}){
    const [mensagem, setMensagem] = useState(null)
    const [ongsSeguidas, setOngsSeguidas] = useState(null);
    const [posts, setPosts] = useState([]);
    const [novasOngs, setNovasOngs] = useState(null);
    const paginaRef = useRef(1);
    const [loading, setLoading] = useState(false);
    const [temMais, setTemMais] = useState(true);
    const observerRef = useRef(null);
    const carregandoRef = useRef(false);
    const [favoritas, setFavoritas] = useState(false);

    async function carregarPosts(){

        if (carregandoRef.current || !temMais) return;

        carregandoRef.current = true;
        setLoading(true);

        const resposta = await fetch(`${api}/pagina_feed/${paginaRef.current}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
            credentials: "include"
        });

        // if (resposta.status === 500) {
        //     return;
        // }

        const retorno = await resposta.json();
        console.log(retorno)

        if (retorno.mensagem) {
            setMensagem(retorno.mensagem)
        }
        if (retorno.ongs_seguidas) {
            setOngsSeguidas(retorno.ongs_seguidas)
        }
        if (retorno.novas_ongs) {
            setNovasOngs(retorno.novas_ongs)
        }
        if (retorno.posts) {
            if (retorno.posts.length == 0) {
                setTemMais(false);

                carregandoRef.current = false;
                setLoading(false);
                return;
            }

            setPosts((prev) => [...prev, ...retorno.posts]);
            paginaRef.current += 1;

            carregandoRef.current = false;
            setLoading(false);
        }
    }

    useEffect(() => {
        carregarPosts()
    }, [])

    useEffect(() => {

        const observer = new IntersectionObserver(
            (entries) => {

                const primeiro = entries[0];

                if (primeiro.isIntersecting) {

                    carregarPosts();

                }

            },
            {
                threshold: 0.1,
            }
        );

        if (observerRef.current) {

            observer.observe(observerRef.current);

        }

        return () => {

            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }

        };

    }, []);

    function atualizarSeguimento(idOng, novoValor) {
        setPosts((postsAnteriores) =>
            postsAnteriores.map((post) =>
                post.id_ong === idOng
                    ? { ...post, seguindo: novoValor }
                    : post
            )
        );
    }

    return(
        <>
            {localStorage.getItem('id_usuario') && (<Nav />)}

            <div className={'container m-auto'}>
                <div className={'row'}>
                    {mensagem && (
                        <div className={'col-12'}>
                            <Alerts
                                tipo={mensagem.tipo}
                                imagem={`/public/${mensagem.tipo}.png`}
                                duracao={10000}
                                descricao={mensagem.descricao}
                            />
                        </div>
                    )}
                    {/*<div className={'col-12'}>*/}
                    {/*    <h1 className={"text-center"}>Título página</h1>*/}
                    {/*</div>*/}
                    {localStorage.getItem('id_usuario') && (
                        <div className={'col-10 m-auto d-flex flex-column'}>
                            <OngsFavoritas api={api} />
                            <div className={'d-none justify-content-center align-items-center d-sm-flex'}>
                                {favoritas ? (
                                    <>
                                        <Buton texto={'Todas as postagens'} background={'branco'} tamanho={'medio'} onClick={() => setFavoritas(false)}/>
                                        <Buton texto={'Postagens das ongs favoritadas'} background={'roxo'} tamanho={'medio'} onClick={() => setFavoritas(true)}/>
                                    </>
                                ):(
                                    <>
                                        <Buton texto={'Todas as postagens'} background={'roxo'} tamanho={'medio'} onClick={() => setFavoritas(false)}/>
                                        <Buton texto={'Postagens das ongs favoritadas'} background={'branco'} tamanho={'medio'} onClick={() => setFavoritas(true)}/>
                                    </>
                                )}
                            </div>
                            <div className={'justify-content-center align-items-center d-flex d-sm-none'}>
                                {favoritas ? (
                                    <>
                                        <Buton texto={'Todas'} background={'branco'} tamanho={'medio'} onClick={() => setFavoritas(false)}/>
                                        <Buton texto={'Favoritadas'} background={'roxo'} tamanho={'medio'} onClick={() => setFavoritas(true)}/>
                                    </>
                                ):(
                                    <>
                                        <Buton texto={'Todas'} background={'roxo'} tamanho={'medio'} onClick={() => setFavoritas(false)}/>
                                        <Buton texto={'Favoritadas'} background={'branco'} tamanho={'medio'} onClick={() => setFavoritas(true)}/>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <CardPost key={post.id_post} postImagem={post.imagem_icone_ong} ongImagem={post.imagem_icone_ong} idPost={post.id_post} api={api} idOng={post.id_ong} idProjeto={post.id_projeto} logo={'/public/favicon.png'} bannerPost={'/public/SemImagemDisponivel.png'} descricao={post.acao} tituloPost={post.titulo} nomeOng={post.ong_nome} dataHora={post.data_hora} totalCurtidas={post.total_curtidas} totalComentarios={post.total_comentarios} curtidoInicial={post.curtido} seguindoInicial={post.seguindo} aoAlterarSeguimento={atualizarSeguimento}/>
                        ))
                    ):(
                        <p className={"text-center"}>Nenhum post adicionado</p>
                    )}
                    <div className={css.divObservado} ref={observerRef}></div>
                    {loading && (
                        <p className={"text-center"}>Carregando...</p>
                    )}
                    {!temMais && (
                        <p className={"text-center"}>Você chegou ao fim</p>
                    )}
                </div>
            </div>
        </>
    )
}