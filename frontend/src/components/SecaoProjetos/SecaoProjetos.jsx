import css from "./SecaoProjetos.module.css";

export default function SecaoProjetos({ projetos }) {

    return (
        <div className={css.container}>

            <h2>Projetos</h2>

            {projetos?.length === 0 && (
                <p>Nenhum projeto cadastrado.</p>
            )}

            {projetos?.map((proj) => (
                <div key={proj.id} className={css.card}>

                    <img
                        src={proj.imagem || "/img/projeto.jpg"}
                        alt="Projeto"
                        className={css.imagem}
                    />

                    <div className={css.info}>

                        <h3>{proj.nome}</h3>

                        <p className={css.descricao}>
                            {proj.descricao}
                        </p>

                    </div>

                </div>
            ))}

        </div>
    );
}