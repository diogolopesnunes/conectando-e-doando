import Nav from "../../../components/Nav/Nav.jsx"
import CardProjeto from "../../../components/CardProjeto/CardProjeto.jsx";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import Input from "../../../components/Input/Input.jsx";
import Buton from "../../../components/Buton/Buton.jsx";

export default function Projetos({ api }) {
    const [projetos, setProjetos] = useState([])
    const [pagina, setPagina] = useState(1)
    const [proximaPagina, setProximaPagina] = useState(2)
    const [paginaAnterior, setPaginaAnterior] = useState(0)
    const [quantidade, setQuantidade] = useState(0)

    async function ListarProjetos(){

        let projetos = await fetch(`${api}/listar_projetos/57/${pagina}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
        })
        let retorno = await projetos.json()
        if (retorno.projetos){
            setProjetos(retorno.projetos)
            setProximaPagina(retorno.proximaPagina)
            setPaginaAnterior(retorno.paginaAnterior)
            setQuantidade(retorno.numeroPaginas)
        }
    }

    useEffect( () => {
        ListarProjetos()
    }, [pagina]);

    return (
        <div className={'container m-auto d-flex align-items-center justify-content-center'}>
            <div className="row">
                <div className="col-12">
                    <Nav/>
                </div>
                <div className={'col-12 w-75 m-auto'}>
                    <div className="d-flex align-items-center justify-content-between mt-3">
                        <h3 className={'color-rosa'}>Projetos</h3>
                        <div className={'d-block d-sm-none'}><Buton texto={'+'} background={'rosa'} rota={'/adicionar_projetos'} classe={'adicionar'}/></div>
                    </div>
                    <div className={'d-flex align-items-end'}>
                        <Input htmlFor={'projetos'} placeholder={'Digite o nome para o filtro'}/>
                        <div className={'d-flex align-items-end h-100 p-2 d-none d-sm-block'}>
                            <Buton texto={'Adicionar projeto'} tamanho={'medio'} background={'rosa'} rota={'/adicionar_projetos'}/>
                        </div>
                    </div>
                </div>
                <div className={'col-12'}>
                    {projetos.map((projeto) =>(
                        <CardProjeto NomeProjeto={projeto.nome} id={projeto.id_projeto} title={projeto.descricao}/>
                    ))}
                </div>
                <div className={'col-3 m-auto d-flex justify-content-between paginas'}>

                    {paginaAnterior !== 0 && (
                        <>
                            <Buton texto={"<"} onClick={() => setPagina(paginaAnterior)} classe={'pagina'} />
                            {pagina == quantidade && paginaAnterior !== 0 && (
                                <Buton texto={paginaAnterior-1} onClick={() => setPagina(paginaAnterior-1)} classe={'pagina'} />
                            )}
                            <Buton texto={paginaAnterior} onClick={() => setPagina(paginaAnterior)} classe={'pagina'} />
                        </>
                    )}

                    <Buton texto={pagina} classe={'paginaSelecionada'}/>
                    {proximaPagina !== 0 && (
                        <>
                            <Buton texto={proximaPagina} onClick={() => setPagina(proximaPagina)} classe={'pagina'}/>
                            {proximaPagina+1 <= quantidade && pagina == 1 && (
                                <Buton texto={proximaPagina+1} onClick={() => setPagina(proximaPagina+1)} classe={'pagina'}/>
                            )}
                        </>
                    )}

                    {proximaPagina !== 0 && (
                        <Buton texto={">"} onClick={() => setPagina(proximaPagina)} classe={'pagina'} />
                    )}
                </div>
            </div>
        </div>
    )
}