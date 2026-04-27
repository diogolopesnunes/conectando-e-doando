import Buton from "../Buton/Buton.jsx";
import css from "./InfoOng.module.css";

export default function InfoOng({ info }) {
    return (
        <>
            <section className={css.secaoInfoProjeto}>
                <div className={css.envolverImagemProjeto}>
                    <img src={info.imagem} alt={info.nome} className={css.imagemProjeto} />
                </div>
                <div className={css.envolverDetalhesProjeto}>
                    <div className={"mb-5"}>
                        <h1 className={css.nomeProjeto}>{info.nome}</h1>
                        <p className={css.nomeInstituicao}>{info.instituicao}</p>
                    </div>

                    <div className={"mt-5 " + css.secaoChamadaAcao}>
                        <img src="/logoSenna.png" alt="Logo Instituição" className={css.logoInstituicao}
                             onError={(e) => e.target.src = "https://ingresso-a.akamaihd.net/b2b/production/uploads/article/image/1708/oppenheimer-como-nolan-recriou-a-explosao-da-bomba-atomica-6898769dc3e601.jpg"} />
                        <Buton background="laranja" tamanho="medio" texto="Doar para o Projeto" />
                    </div>
                </div>
            </section>

            <section className={css.secaoDescricao}>
                <p>{info.descricao_causa}</p>
            </section>
        </>
    );
}