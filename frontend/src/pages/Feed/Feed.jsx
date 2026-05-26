import css from './Feed.module.css';
import CardPost from "../../components/CardPost/CardPost.jsx";
import { useEffect, useState, useRef } from "react";
import Alerts from "../../components/Alerts/Alerts.jsx";
import Nav from "../../components/Nav/Nav.jsx";
import OngsFavoritas from "../../components/OngsFavoritas/OngsFavoritas.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import Input from "../../components/Input/Input.jsx";
import Swal from "sweetalert2";
import Titulo from "../../components/Titulo/Titulo.jsx";
import NovaOngFeed from "../../components/NovaOngFeed/NovaOngFeed.jsx";

export default function Feed({ api }) {
    const [mensagem, setMensagem] = useState(null);
    const [ongsSeguidas, setOngsSeguidas] = useState([]);
    const [posts, setPosts] = useState([]);
    const [novasOngs, setNovasOngs] = useState(null);
    const [quantidadeNovasOngs, setQuantidadeNovasOngs] = useState(0);
    const [proximaPaginaNovasOngs, setProximaPaginaNovasOngs] = useState(2);
    const [paginaAnteriorNovasOngs, setPaginaAnteriorNovasOngs] = useState(0);
    const [paginaNovasOngs, setPaginaNovasOngs] = useState(1);
    const [numeroPaginasNovasOngs, setNumeroPaginasNovasOngs] = useState(0);

    const [tiposOng, setTiposOng] = useState([]);
    const [tipoOng, setTipoOng] = useState('');

    const paginaRef = useRef(1);
    const [loading, setLoading] = useState(false);
    const [temMais, setTemMais] = useState(true);
    const observerRef = useRef(null);
    const carregandoRef = useRef(false);
    const [favoritas, setFavoritas] = useState(false);
    const favoritasRef = useRef(false);
    const [idPost, setIdPost] = useState('');
    const [comentario, setComentario] = useState('');
    const [filtro, setFiltro] = useState('');
    const [ordemData, setOrdemData] = useState('desc');
    const ordemDataRef = useRef('desc');
    const [comentariosPost, setComentariosPost] = useState(null);
    const [editar, setEditar] = useState(false);

    async function carregarPosts(forcar = false) {
        if (carregandoRef.current || (!forcar && !temMais)) return;
        carregandoRef.current = true;
        setLoading(true);

        try {
            const estaNasFavoritas = favoritasRef.current;
            if (estaNasFavoritas) {
                var rota = 'pagina_feed_favoritas'
            } else {
                var rota = 'pagina_feed'
            }

            // Seleciona a rota de acordo com o tipo de feed
            const resposta = await fetch(
                `${api}/${rota}/${paginaRef.current}?nome=${encodeURIComponent(filtro)}&ordem=${ordemDataRef.current}&paginaNovasOngs=${paginaNovasOngs}&tema=${tipoOng}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                }
            );

            const retorno = await resposta.json();

            if (retorno.mensagem) {
                setMensagem(retorno.mensagem);
            }

            // Atualiza as ONGs seguidas (quando disponível)
            if (retorno.ongs_seguidas) {
                setOngsSeguidas(retorno.ongs_seguidas);
            }

            // Processa os posts
            if (retorno.posts) {
                if (retorno.posts.length === 0) {
                    setTemMais(false);
                    return;
                }

                setPosts((prev) => [...prev, ...retorno.posts]);
                paginaRef.current += 1;
            }
        } catch (erro) {
            setMensagem({
                tipo: "erro",
                descricao: "Erro ao carregar posts"
            });
        } finally {
            carregandoRef.current = false;
            setLoading(false);
        }
    }

    function trocarFeedFavoritas(valor) {
        favoritasRef.current = valor;
        setFavoritas(valor);

        setPosts([]);
        setTemMais(true);
        paginaRef.current = 1;
        carregandoRef.current = false;

        setTimeout(() => {
            carregarPosts();
        }, 0);
    }

    useEffect(() => {
        setPosts([]);
        setNovasOngs([]);
        setTemMais(true);
        paginaRef.current = 1;
        carregandoRef.current = false;

        setTimeout(() => {
            carregarPosts(true);
        }, 0);
    }, [filtro, ordemData, tipoOng]);


    // Scroll infinito
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
    }, [paginaNovasOngs]);

    function atualizarSeguimento(idOng, novoValor) {
        setPosts((postsAnteriores) =>
            postsAnteriores.map((post) =>
                post.id_ong === idOng
                    ? { ...post, seguindo: novoValor }
                    : post
            )
        );
    }

    function atualizarQuantidadeComentarios(idPost, novoTotal) {
        setPosts((postsAnteriores) =>
            postsAnteriores.map((post) =>
                post.id_post === idPost
                    ? {
                        ...post,
                        total_comentarios: novoTotal
                    }
                    : post
            )
        );
    }

    function atualizarOngsFavoritas(idOng, nomeOng, temaOng, ongImagem, seguindo) {
        setOngsSeguidas((ongsAnteriores = []) => {
            if (seguindo) {
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

        // Se estiver no feed de favoritas e deixar de seguir uma ONG,
        // remove os posts dela da tela imediatamente
        if (favoritas && !seguindo) {
            setPosts((postsAnteriores) =>
                postsAnteriores.filter((post) => post.id_ong !== idOng)
            );
        }
    }

    async function listarComentarios(idPostComentario) {
        const resposta = await fetch(
            `${api}/listar_comentario/${idPostComentario}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
            }
        );

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
                listarComentarios(idPostComentario);
                return true;
            }
            return false;
        }
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

    async function excluirComentario(idMensagem, idPostComentario) {
        const confirmou = await confirmarExclusao();
        if (!confirmou) return;

        const resposta = await fetch(
            `${api}/excluir_comentario/${idMensagem}`,
            {
                method: "DELETE",
                credentials: "include",
            }
        );

        const retorno = await resposta.json();

        if (retorno.mensagem) {
            setMensagem(retorno.mensagem);

            if (retorno.mensagem.tipo === 'sucesso') {
                listarComentarios(idPostComentario);
                return true;
            }

            return false;
        }
    }

    async function editarComentario(
        e,
        idMensagem,
        idPostComentario,
        mensagemEditada
    ) {
        e.preventDefault();

        const resposta = await fetch(
            `${api}/editar_comentario/${idMensagem}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
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
                listarComentarios(idPostComentario);
                setEditar(false);

            }
        }
    }

    useEffect(() => {

        async function buscarTiposOng() {

            try {

                let resposta = await fetch(`${api}/listar_tipos_ong`, {
                    method: "GET",
                    credentials: "include"
                })

                resposta = await resposta.json()
                console.log(resposta)

                setTiposOng(resposta.tipos)

            } catch (erro) {
                console.log(erro)
            }
        }

        buscarTiposOng()

    }, [])



    return (
        <>
            {localStorage.getItem('id_usuario') && <Nav />}

            <div className="container m-auto formataAltura">
                <div className="row">
                    {mensagem && (
                        <div className="col-12">
                            <Alerts
                                tipo={mensagem.tipo}
                                imagem={`/public/${mensagem.tipo}.png`}
                                duracao={10000}
                                descricao={mensagem.descricao}
                            />
                        </div>
                    )}

                    {localStorage.getItem('id_usuario') ? (
                        <div className="col-10 m-auto d-flex flex-column">
                            <OngsFavoritas
                                ongs={ongsSeguidas || []}
                                api={api}
                            />

                            <div className="my-3 d-flex gap-3 flex-column flex-md-row">
                                <Input
                                    tipoInp="text"
                                    htmlFor="projetos"
                                    placeholder="Digite o nome para o filtro"
                                    value={filtro}
                                    funcao={(e) => {
                                        setFiltro(e.target.value);
                                    }}
                                />


                                <select
                                    className={`my-3 form-select gap-2 m-auto ${css.selectTipo}`}
                                    value={tipoOng}
                                    onChange={(e) => {
                                        setTipoOng(e.target.value);
                                    }}
                                >
                                    <option value="">Tipos de ONG</option>
                                    {Array.isArray(tiposOng) &&
                                        tiposOng.map((opcao) => (
                                            <option
                                                key={opcao.id_tipo_ong}
                                                value={opcao.id_tipo_ong}
                                            >
                                                {opcao.nome}
                                            </option>
                                        ))
                                    }
                                </select>

                                <select
                                    className={`my-3 form-select gap-2 m-auto ${css.selectTipo}`}
                                    value={ordemData}
                                    onChange={(e) => {
                                        ordemDataRef.current = e.target.value;
                                        setOrdemData(e.target.value);
                                    }}
                                >
                                    <option value="desc">
                                        Mais recentes primeiro
                                    </option>
                                    <option value="asc">
                                        Mais antigos primeiro
                                    </option>
                                </select>
                            </div>

                            {/* Desktop */}
                            <div className="d-none justify-content-center align-items-center d-sm-flex">
                                {favoritas ? (
                                    <>
                                        <Buton
                                            texto="Todas as postagens"
                                            background={favoritas ? "branco" : "roxo"}
                                            tamanho="medio"
                                            onClick={() => trocarFeedFavoritas(false)}
                                        />

                                        <Buton
                                            texto="Postagens das ongs favoritadas"
                                            background={favoritas ? "roxo" : "branco"}
                                            tamanho="medio"
                                            onClick={() => trocarFeedFavoritas(true)}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Buton
                                            texto="Todas as postagens"
                                            background="roxo"
                                            tamanho="medio"
                                            onClick={() => trocarFeedFavoritas(false)}
                                        />
                                        <Buton
                                            texto="Postagens das ongs favoritadas"
                                            background="branco"
                                            tamanho="medio"
                                            onClick={() => trocarFeedFavoritas(true)}
                                        />
                                    </>
                                )}
                            </div>

                            {/* Mobile */}
                            <div className="justify-content-center align-items-center d-flex d-sm-none">
                                {favoritas ? (
                                    <>
                                        <Buton
                                            texto="Todas"
                                            background="branco"
                                            tamanho="pequeno"
                                            onClick={() => trocarFeedFavoritas(false)}
                                        />
                                        <Buton
                                            texto="Favoritadas"
                                            background="roxo"
                                            tamanho="pequeno"
                                            onClick={() => trocarFeedFavoritas(true)}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Buton
                                            texto="Todas"
                                            background="roxo"
                                            tamanho="pequeno"
                                            onClick={() => trocarFeedFavoritas(false)}
                                        />
                                        <Buton
                                            texto="Favoritadas"
                                            background="branco"
                                            tamanho="pequeno"
                                            onClick={() => trocarFeedFavoritas(true)}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="col-10 m-auto d-flex flex-column">
                            <div className="my-3 d-flex gap-3 flex-column flex-md-row">
                                <Input
                                    tipoInp="text"
                                    htmlFor="projetos"
                                    placeholder="Digite o nome para o filtro"
                                    value={filtro}
                                    funcao={(e) => {
                                        setFiltro(e.target.value);
                                    }}
                                />

                                {/*<Input*/}
                                {/*    obrigatorio={"Não"}*/}
                                {/*    htmlFor={'tipoOng'}*/}
                                {/*    label={''}*/}
                                {/*    tipoInp={'select'}*/}
                                {/*    value={tipoOng}*/}
                                {/*    opcoeslabel="Selecione o tipo da ONG"*/}
                                {/*    opcoes={tiposOng}*/}
                                {/*    funcao={(f) => setTipoOng(f.target.value)}*/}
                                {/*/>*/}
                                <select
                                    className={`my-3 form-select gap-2 m-auto ${css.selectTipo}`}
                                    value={tipoOng}
                                    onChange={(e) => {
                                        setTipoOng(e.target.value);
                                    }}
                                >
                                    <option value="">Tipos de ONG</option>
                                    {Array.isArray(tiposOng) &&
                                        tiposOng.map((opcao) => (
                                            <option
                                                key={opcao.id_tipo_ong}
                                                value={opcao.id_tipo_ong}
                                            >
                                                {opcao.nome}
                                            </option>
                                        ))
                                    }
                                </select>

                                <select
                                    className={`my-3 form-select gap-2 m-auto ${css.selectTipo}`}
                                    value={ordemData}
                                    onChange={(e) => {
                                        ordemDataRef.current = e.target.value;
                                        setOrdemData(e.target.value);
                                    }}
                                >
                                    <option value="desc">
                                        Mais recentes primeiro
                                    </option>
                                    <option value="asc">
                                        Mais antigos primeiro
                                    </option>
                                </select>
                            </div>
                        </div>
                    )}

                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <CardPost
                                key={post.id_post}
                                postImagem={post.imagem_icone_post}
                                ongImagem={post.imagem_icone_ong}
                                idPost={post.id_post}
                                setIdPost={setIdPost}
                                api={api}
                                idOng={post.id_ong}
                                idProjeto={post.id_projeto}
                                logo="/public/favicon.png"
                                bannerPost="/public/SemImagemDisponivel.png"
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
                                atualizarQuantidadeComentarios={atualizarQuantidadeComentarios}
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
                                carregarPosts={carregarPosts}
                            />
                        ))
                    ) : (
                        <p className="text-center">
                            {favoritas
                                ? "Você não segue nenhuma ONG com posts"
                                : "Nenhum post adicionado"}
                        </p>
                    )}

                    <div
                        className={css.divObservado}
                        ref={observerRef}
                    ></div>

                    {loading && (
                        <p className="text-center">Carregando...</p>
                    )}

                    {!temMais && (
                        <p className="text-center my-2">
                            Você chegou ao fim
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}