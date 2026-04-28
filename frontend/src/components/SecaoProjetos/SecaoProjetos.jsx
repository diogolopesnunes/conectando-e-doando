import css from "./SecaoProjetos.module.css";
import {Link} from "react-router-dom";
import Buton from "../Buton/Buton.jsx";

export default function SecaoProjetos({ projetos, api }) {

    return (
        <div className={css.container}>

            <h2>Projetos</h2>

            {projetos?.length === 0 && (
                <p>Nenhum projeto cadastrado.</p>
            )}

            {projetos?.map((proj) => (
                <div key={proj.id_projeto || proj.id} className={css.card + ' px-2 flex-column flex-sm-row'}>
                    <Link to={`/projeto/${proj.id_projeto}`} className={'d-flex flex-column flex-sm-row w-100'}>
                        <img 
                            src={proj.imagem ? `${api}${proj.imagem}` : "/img/projeto.jpg"} alt="Projeto"
                            className={css.imagem}
                            onError={(e) => {e.target.src = "/public/SemImagemDisponivel.png";}}
                        />

                        <div className={css.info + ' d-flex flex-column justify-content-center'}>

                            <h3 className={css.tituloProjeto}>{proj.nome || proj.titulo}</h3>

                            <p className={css.descricao + ' text-center text-sm-start'}>
                                {proj.descricao}
                            </p>

                        </div>
                    </Link>
                    <div>
                        <Buton texto={'Editar'} background={'laranja'} tamanho={'pequeno'} rota={`/edicao_projetos/${proj.id_projeto}`}/>
                    </div>
                </div>


            ))}

        </div>
    );
}