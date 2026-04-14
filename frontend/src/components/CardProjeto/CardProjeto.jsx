import Buton from "../Buton/Buton.jsx";
import css from "./CardProjeto.module.css"

export default function CardProjeto({NomeProjeto, id, title}) {
    return (
        <div className={'row w-75 m-auto bg-light p-2 rounded-2 shadow-sm my-3 flex-column flex-sm-row text-center text-sm-start'} title={title}>
            <div className={'col-sm-6 col-12 mb-4 mb-sm-0'}>
                <h5>{NomeProjeto}</h5>
            </div>
            <div className={'col d-flex justify-content-evenly flex-sm-row flex-column gap-3'}>
                <Buton tamanho={'pequeno'} texto={'Fazer post'} background={'rosa'} rota={`/adicionar_post/${id}`}/>
                <Buton tamanho={'pequeno'} texto={'Editar'} background={'laranja'} rota={'/edicao_projetos'}/>
                <Buton tamanho={'pequeno'} texto={'Desativar'} background={'vermelho'}/>
            </div>
        </div>
    )
}