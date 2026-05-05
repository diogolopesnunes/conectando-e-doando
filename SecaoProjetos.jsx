import css from "./SecaoProjetos.module.css";
import { Link } from "react-router-dom";
import Buton from "../Buton/Buton.jsx";

export default function SecaoProjetos({ projetos, api, excluir, alternarStatus }) {
    return (
        <div className={css.container}>
            <h2>Projetos</h2>

            {projetos?.length === 0 && (
                <p>Nenhum projeto cadastrado.</p>
            )}

            {projetos?.map((proj) => {
                const idProjeto = proj.id_projeto || proj.id;
                const statusAtividade = proj.atividade ?? proj.ativadade;

                return (
                    <div key={idProjeto} className={css.card + ' px-2 flex-column flex-sm-row'}>
                        <Link to={`/projeto/${idProjeto}`} className={'d-flex flex-column flex-sm-row w-100'}>
                            <img
                                src={proj.imagem ? `${api}${proj.imagem}` : "/img/projeto.jpg"}
                                alt="Projeto"
                                className={css.imagem}
                                onError={(e) => {e.target.src = "/SemImagemDisponivel.png";}}
                            />
                            <div className={css.info + ' d-flex flex-column justify-content-center'}>
                                <h3 className={css.tituloProjeto}>{proj.nome || proj.titulo}</h3>
                                <p className={css.descricao + ' text-center text-sm-start'}>
                                    {proj.descricao}
                                </p>
                            </div>
                        </Link>

                        <div className={'d-flex align-items-center gap-1'}>
                            <Buton
                                texto={statusAtividade === 1 ? 'Desativar' : 'Ativar'}
                                background={statusAtividade === 1 ? 'vermelho' : "bege"}
                                tamanho={'pequeno'}
                                onClick={() => alternarStatus(idProjeto)}
                            />

                            {statusAtividade !== 1 && (
                                <Buton
                                    tamanho={'pequeno'}
                                    texto={'Excluir'}
                                    background={'roxo'}
                                    onClick={() => excluir(idProjeto)}
                                />
                            )}

                            <Buton
                                texto={'Editar'}
                                background={'laranja'}
                                tamanho={'pequeno'}
                                rota={`/edicao_projetos/${idProjeto}`}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}