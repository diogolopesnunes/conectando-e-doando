import css from './NovasOngs.module.css';
import {useEffect, useRef, useState} from "react";
import Nav from "../../components/Nav/Nav.jsx";
import OngsFavoritas from "../../components/OngsFavoritas/OngsFavoritas.jsx";
import Input from "../../components/Input/Input.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import NovaOngFeed from "../../components/NovaOngFeed/NovaOngFeed.jsx";

export default function NovasOngs({api}) {
    const [idUsuario, setIdUsuario] = useState(localStorage.getItem('id_usuario'));
    const [tiposOng ,setTiposOng] = useState();
    const [tipoOng, setTipoOng] = useState('');
    const [filtro, setFiltro] = useState('');
    const [ordemData, setOrdemData] = useState('desc');
    const ordemDataRef = useRef('desc');

    const [novasOngs, setNovasOngs] = useState(null)
    const [quantidadeNovasOngs, setQuantidadeNovasOngs] = useState(0);
    const [proximaPaginaNovasOngs, setProximaPaginaNovasOngs] = useState(2);
    const [paginaAnteriorNovasOngs, setPaginaAnteriorNovasOngs] = useState(0);
    const [paginaNovasOngs, setPaginaNovasOngs] = useState(1);
    const [numeroPaginasNovasOngs, setNumeroPaginasNovasOngs] = useState(0);

    useEffect(() => {
        listarNovasOngs()
    }, [])

    async function listarNovasOngs(){
        const resposta = await fetch(
            `${api}/pagina_feed/1?nome=${encodeURIComponent(filtro)}&ordem=${ordemDataRef.current}&paginaNovasOngs=${paginaNovasOngs}&tema=${tipoOng}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            }
        );
        const retorno = await resposta.json()
        if (retorno.novas_ongs){
            setNovasOngs(retorno.novas_ongs);
            setQuantidadeNovasOngs(retorno.quantidadeNovasOngs);
            setNumeroPaginasNovasOngs(retorno.numeroPaginasNovasOngs);
            setProximaPaginaNovasOngs(retorno.proximaPaginaNovasOngs);
            setPaginaAnteriorNovasOngs(retorno.paginaAnteriorNovasOngs);
        }
    }

    useEffect(() => {
        setNovasOngs([]);
        setTimeout(() => {
            listarNovasOngs();
        }, 0);
    }, [filtro, ordemData, tipoOng]);

    useEffect(() => {
        listarNovasOngs();
    }, [paginaNovasOngs]);

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
    return(
        <>
            {idUsuario && <Nav/>}
            <div className={'container m-auto formataAltura'}>
                <div className={'row'}>
                    <div className={"col-10 m-auto d-flex flex-column "}>
                        {localStorage.getItem('id_usuario') ? (
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
                        ) : (
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
                        )}
                    </div>
                    {novasOngs && (
                        <div className={'col-10 m-auto d-flex '}>
                            <div className={'row w-100 m-auto d-flex justify-content-center justify-content-md-start'}>
                                {novasOngs.map((novaOng) => (
                                    <NovaOngFeed api={api} nomeOng={novaOng.nome} idOng={novaOng.id} key={novaOng.id} descricao={novaOng.descricao}
                                                 banner={novaOng.bannerOng} logoOng={novaOng.imagemPerfilOng}
                                                 // aoAlterarOngsFavoritas={atualizarOngsFavoritas}
                                                 // carregarPosts={carregarPosts}
                                                 />
                                ))}
                            </div>
                        </div>
                    )}
                    {numeroPaginasNovasOngs >= 1 && (
                        <div className={'col-12 col-sm-12 m-auto d-flex justify-content-center gap-4 paginas'}>
                            {paginaAnteriorNovasOngs !== 0 && (
                                <>
                                    <Buton texto={"<"} onClick={() => setPaginaNovasOngs(paginaAnteriorNovasOngs)} classe={'pagina'} />
                                    {paginaNovasOngs === numeroPaginasNovasOngs && paginaAnteriorNovasOngs - 1 !== 0 && (
                                        <Buton texto={paginaAnteriorNovasOngs - 1} onClick={() => setPaginaNovasOngs(paginaAnteriorNovasOngs - 1)} classe={'pagina'} />
                                    )}
                                    <Buton texto={paginaAnteriorNovasOngs} onClick={() => setPaginaNovasOngs(paginaAnteriorNovasOngs)} classe={'pagina'} />
                                </>
                            )}
                            {numeroPaginasNovasOngs === 1 ? (
                                <div className={'m-auto'}>
                                    <Buton texto={paginaNovasOngs} classe={'paginaSelecionada'} />
                                </div>
                            ) : (
                                <Buton texto={paginaNovasOngs} classe={'paginaSelecionada'} />
                            )}
                            {proximaPaginaNovasOngs !== 0 && (
                                <>
                                    <Buton texto={proximaPaginaNovasOngs} onClick={() => setPaginaNovasOngs(proximaPaginaNovasOngs)} classe={'pagina'} />
                                    {proximaPaginaNovasOngs + 1 <= numeroPaginasNovasOngs && paginaNovasOngs === 1 && (
                                        <Buton texto={proximaPaginaNovasOngs + 1} onClick={() => setPaginaNovasOngs(proximaPaginaNovasOngs + 1)} classe={'pagina'} />
                                    )}
                                    <Buton texto={">"} onClick={() => setPaginaNovasOngs(proximaPaginaNovasOngs)} classe={'pagina'} />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}