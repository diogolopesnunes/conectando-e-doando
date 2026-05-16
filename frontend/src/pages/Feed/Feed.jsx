import css from './Feed.module.css';
import CardPost from "../../components/CardPost/CardPost.jsx";
import {useEffect, useState, useRef} from "react";
import Alerts from "../../components/Alerts/Alerts.jsx";
import Nav from "../../components/Nav/Nav.jsx";
import OngsFavoritas from "../../components/OngsFavoritas/OngsFavoritas.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import Input from "../../components/Input/Input.jsx";
import Swal from "sweetalert2";

export default function Feed({api}){
    const [mensagem, setMensagem] = useState(null)
    const [ongsSeguidas, setOngsSeguidas] = useState([]);
    const [posts, setPosts] = useState([]);
    const [novasOngs, setNovasOngs] = useState(null);
    const paginaRef = useRef(1);
    const [loading, setLoading] = useState(false);
    const [temMais, setTemMais] = useState(true);
    const observerRef = useRef(null);
    const carregandoRef = useRef(false);
    const [favoritas, setFavoritas] = useState(false);
    const [idPost, setIdPost] = useState('');
    const [comentario, setComentario] = useState('')
    const [filtro, setFiltro] = useState('');
    const [ordemData, setOrdemData] = useState('desc');
    const [comentariosPost, setComentariosPost] = useState(null)
    const [editar, setEditar] = useState(false);

    async function carregarPosts() {
        if (carregandoRef.current || !temMais) return;

        carregandoRef.current = true;
        setLoading(true);

        const resposta = await fetch(
            `${api}/pagina_feed/${paginaRef.current}?nome=${encodeURIComponent(filtro)}&ordem=${ordemData}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            }
        );

        const retorno = await resposta.json();

        if (retorno.mensagem) {
            setMensagem(retorno.mensagem);
        }

        setOngsSeguidas(retorno.ongs_seguidas || []);

        if (retorno.novas_ongs) {
            setNovasOngs(retorno.novas_ongs);
        }

        if (retorno.posts) {
            if (retorno.posts.length === 0) {
                setTemMais(false);
                carregandoRef.current = false;
                setLoading(false);
                return;
            }

            setPosts((prev) => [...prev, ...retorno.posts]);
            paginaRef.current += 1;
        }

        carregandoRef.current = false;
        setLoading(false);
    }

    function reiniciarFeed() {
        setPosts([]);
        setTemMais(true);
        paginaRef.current = 1;
        carregandoRef.current = false;
    }

    useEffect(() => {
        reiniciarFeed();
        carregarPosts();
    }, [filtro, ordemData]);

    // useEffect para scroll infinito
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


    function atualizarOngsFavoritas(idOng, nomeOng, temaOng, ongImagem, seguindo) {
        setOngsSeguidas((ongsAnteriores = []) => {
            if (seguindo) {
                // Se começou a seguir, adiciona a ONG caso ela ainda não exista
                const jaExiste = ongsAnteriores.some(
                    (ong) => ong.id === idOng
                );

                if (jaExiste) {
                    return ongsAnteriores;
                }

                return [
                    ...ongsAnteriores,
                    {
                        id: idOng,
                        nome: nomeOng,
                        tema: temaOng,
                        imagem: ongImagem
                    }
                ];
            } else {
                return ongsAnteriores.filter(
                    (ong) => ong.id !== idOng
                );
            }
        });
    }

    async function listarComentarios(idPostComentario) {
        const resposta = await fetch(`${api}/listar_comentario/${idPostComentario}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
        });

        const retorno = await resposta.json();

        if (retorno.mensagem) {
            setMensagem(retorno.mensagem);
        }

        if (retorno.mensagens) {
            setComentariosPost(retorno.mensagens);
        }
    }

    async function comentar(e, idPostComentario) {
        e.preventDefault();

        if (!comentario.trim()) {
            setMensagem({
                tipo: "erro",
                descricao: "Digite um comentário antes de enviar"
            });
            return;
        }

        const resposta = await fetch(
            `${api}/postar_comentario/${localStorage.getItem('id_usuario')}/${idPostComentario}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    comentario: comentario
                })
            }
        );

        const retorno = await resposta.json();

        if (retorno.mensagem) {
            setMensagem(retorno.mensagem);

            if (retorno.mensagem.tipo === 'sucesso') {
                setComentario('');

                // Recarrega os comentários depois de postar
                listarComentarios(idPostComentario);
            }
        }
    }

    const postsFiltrados = favoritas
        ? posts.filter((post) =>
            ongsSeguidas.some((ong) => ong.id === post.id_ong)
        )
        : posts;

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

    async function excluirComentario(idMensagem, idPostComentario) {
        const confirmou = await confirmarExclusao();
        if (!confirmou) return;

        const resposta = await fetch(
            `${api}/excluir_comentario/${idMensagem}`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            }
        );

        const retorno = await resposta.json();

        if (retorno.mensagem) {
            setMensagem(retorno.mensagem);
            if (retorno.mensagem.tipo === 'sucesso') {
                listarComentarios(idPostComentario)
            }
        }
    }

    async function editarComentario(e, idMensagem, idPostComentario, mensagemEditada) {
        e.preventDefault();

        const resposta = await fetch(
            `${api}/editar_comentario/${idMensagem}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    mensagemEditada
                })
            }
        );

        const retorno = await resposta.json();

        if (retorno.mensagem) {
            setMensagem(retorno.mensagem);
            if (retorno.mensagem.tipo === 'sucesso') {
                listarComentarios(idPostComentario)
                setEditar(false)
            }
        }
    }

    return (
        <>
            {localStorage.getItem('id_usuario') && (<Nav/>)}

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

                    {localStorage.getItem('id_usuario') && (
                        <div className={'col-10 m-auto d-flex flex-column'}>
                                <OngsFavoritas ongs={ongsSeguidas || []} api={api} />
                            <div className="my-3">
                                <Input
                                    tipoInp={'text'}
                                    htmlFor={'projetos'}
                                    placeholder={'Digite o nome para o filtro'}
                                    value={filtro}
                                    funcao={(e) => {
                                        setFiltro(e.target.value);
                                    }}
                                />

                                <select
                                    className="form-select"
                                    value={ordemData}
                                    onChange={(e) => {
                                        setOrdemData(e.target.value);
                                    }}>
                                    <option value="desc">Mais recentes primeiro</option>
                                    <option value="asc">Mais antigos primeiro</option>
                                </select>
                            </div>
                            <div className={'d-none justify-content-center align-items-center d-sm-flex'}>
                                {favoritas ? (
                                    <>
                                        <Buton texto={'Todas as postagens'} background={'branco'}
                                               tamanho={'medio'} onClick={() => setFavoritas(false)}/>
                                        <Buton texto={'Postagens das ongs favoritadas'} background={'roxo'}
                                               tamanho={'medio'} onClick={() => setFavoritas(true)}/>
                                    </>
                                ) : (
                                    <>
                                        <Buton texto={'Todas as postagens'} background={'roxo'}
                                               tamanho={'medio'} onClick={() => setFavoritas(false)}/>
                                        <Buton texto={'Postagens das ongs favoritadas'} background={'branco'}
                                               tamanho={'medio'} onClick={() => setFavoritas(true)}/>
                                    </>
                                )}
                            </div>
                            <div className={'justify-content-center align-items-center d-flex d-sm-none'}>
                                {favoritas ? (
                                    <>
                                        <Buton texto={'Todas'} background={'branco'} tamanho={'pequeno'}
                                               onClick={() => setFavoritas(false)}/>
                                        <Buton texto={'Favoritadas'} background={'roxo'} tamanho={'pequeno'}
                                               onClick={() => setFavoritas(true)}/>
                                    </>
                                ) : (
                                    <>
                                        <Buton texto={'Todas'} background={'roxo'} tamanho={'pequeno'}
                                               onClick={() => setFavoritas(false)}/>
                                        <Buton texto={'Favoritadas'} background={'branco'} tamanho={'pequeno'}
                                               onClick={() => setFavoritas(true)}/>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {postsFiltrados.length > 0 ? (
                        postsFiltrados.map((post) => (
                            <CardPost
                                key={post.id_post}
                                postImagem={post.imagem_icone_post}
                                ongImagem={post.imagem_icone_ong}
                                idPost={post.id_post}
                                setIdPost={setIdPost}
                                api={api}
                                idOng={post.id_ong}
                                idProjeto={post.id_projeto}
                                logo={'/public/favicon.png'}
                                bannerPost={'/public/SemImagemDisponivel.png'}
                                descricao={post.acao}
                                tituloPost={post.titulo}
                                nomeOng={post.ong_nome}
                                dataHora={post.data_hora}
                                totalCurtidas={post.total_curtidas}
                                totalComentarios={post.total_comentarios}
                                curtidoInicial={post.curtido}
                                seguindoInicial={post.seguindo}
                                aoAlterarSeguimento={atualizarSeguimento}
                                aoAlterarOngsFavoritas={atualizarOngsFavoritas}
                                temaOng={post.tema}
                                comentario={comentario}
                                setComentario={setComentario}
                                comentar={comentar}
                                listarComentarios={listarComentarios}
                                comentariosPost={comentariosPost}
                                excluirComentario={excluirComentario}
                                editarComentario={editarComentario}
                                editar={editar}
                                setEditar={setEditar}
                            />
                        ))
                    ) : (
                        <p className={"text-center"}>
                            {favoritas
                                ? "Você não segue nenhuma ONG com posts"
                                : "Nenhum post adicionado"}
                        </p>
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