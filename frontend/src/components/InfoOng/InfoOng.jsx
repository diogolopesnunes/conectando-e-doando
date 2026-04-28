import Buton from "../Buton/Buton.jsx";
import css from "./InfoOng.module.css";

export default function InfoOng({ info, texto, api }) {

    return (
        <>
            <section className={css.secaoInfoProjeto}>
                <div className={css.envolverImagemProjeto}>
                    <img
                        src={`${api}${info.imagem}`}
                        alt={info.nome}
                        className={css.imagemProjeto}
                        onError={(e) => {
                            e.target.src = "/public/SemImagemDisponivel.png";
                        }}
                    />
                </div>
                <div className={css.envolverDetalhesProjeto}>
                    <div className={"mb-5"}>
                        <h1 className={css.nomeProjeto}>{info.nome}</h1>
                        <p className={css.nomeInstituicao}>{info.instituicao}</p>
                    </div>

                    <div className={"mt-2 " + css.secaoChamadaAcao}>
                        <img
                            src={`${api}${info.logoInstituicao}`}
                            alt="Logo Instituição"
                            className={css.logoInstituicao + ' rounded'}
                            onError={(e) => {
                                e.target.src = "/public/SemImagemDisponivel.png";
                            }}
                        />
                        <Buton background="laranja" tamanho="medio" texto={texto} />
                    </div>
                </div>
            </section>

            <section className={css.secaoDescricao}>
                <p>{info.descricao_causa}</p>
            </section>
        </>
    );
}