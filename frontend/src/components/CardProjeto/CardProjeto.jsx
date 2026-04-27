import Buton from "../Buton/Buton.jsx";
import css from "./CardProjeto.module.css"
import {Link} from "react-router-dom";

export default function CardProjeto({NomeProjeto, id, title}) {

    async function deletar(e) {
        e.preventDefault();
        let retorno = await fetch(`${api}/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({

            })
        })

        setLogado(false)

        retorno = await retorno.json()
        console.log(retorno)
        if(!retorno){
            console.log("Erro do servidor:", retorno);
            return;
        }
        if (retorno.mensagem){
            setMensagem(retorno.mensagem.descricao)
            setTipoMensagem(retorno.mensagem.tipo)
            localStorage.clear()
            // if(retorno.mensagem.tipo == 'sucesso'){
            //     localStorage.clear()
            // }
        }
        navegate('/')
    }

    return (
        <div className={'row w-75 m-auto bg-light p-2 rounded-2 shadow-sm my-3 flex-column flex-sm-row text-center text-sm-start '  + css.card} title={title}>
            <div className={'col-sm-6 col-12 mb-4 mb-sm-0 ' + css.textoGrande}>
                <Link to={`/projeto/${id}`}>
                    <h5>{NomeProjeto}</h5>
                </Link>
            </div>
            <div className={'col d-flex justify-content-evenly flex-sm-row flex-column gap-3'}>
                <Buton tamanho={'pequeno'} texto={'Fazer post'} background={'rosa'} rota={`/adicionar_post/${id}`}/>
                <Buton tamanho={'pequeno'} texto={'Editar'} background={'laranja'} rota={`/edicao_projetos/${id}`}/>
                <Buton tamanho={'pequeno'} texto={'Desativar'} background={'vermelho'} onClick={deletar}/>
            </div>
        </div>
    )
}