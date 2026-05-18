import Buton from "../Buton/Buton.jsx";
import css from "./InfoOng.module.css";
import SeguirOng from "../SeguirOng/SeguirOng.jsx";

export default function InfoOng({ info, texto, api, atualizarSeguimento, seguindo}) {

    return (
        <>
            <section className={css.secaoInfoProjeto}>
                <div className={css.envolverImagemProjeto}>
                    <img
                        src={`${api}${info.imagem}?t=${Date.now()}`}
                        alt={info.nome}
                        className={css.imagemProjeto}
                        onError={(e) => {
                            e.target.src = "/public/SemImagemDisponivel.png";
                        }}
                    />
                </div>

                <div className={css.envolverDetalhesProjeto}>
                    <div className={"mb-5"}>
                        <h1 className={css.nomeProjeto}>
                            {info.nome}
                        </h1>

                        <p className={css.nomeInstituicao}>
                            {info.instituicao}
                        </p>
                    </div>

                    <div className={"mt-2 " + css.secaoChamadaAcao}>
                        <img
                            src={`${api}${info.logoInstituicao}?t=${Date.now()}`}
                            alt="Logo Instituição"
                            className={css.logoInstituicao + ' rounded'}
                            onError={(e) => {
                                e.target.src = "/public/SemImagemDisponivel.png";
                            }}
                        />

                        <SeguirOng
                            api={api}
                            idOng={info.id}
                            nomeOng={info.nome}
                            temaOng={info.tema}
                            ongImagem={info.logoInstituicao}
                            seguindoInicial={seguindo}
                            aoAlterarSeguimento={(idOng, novoValor) => {
                                atualizarSeguimento(novoValor);
                            }}
                        />

                        <Buton
                            background="laranja"
                            tamanho="medio"
                            texto={texto}
                        />
                    </div>
                </div>
            </section>

            <section className={css.secaoDescricao}>
                <p>{info.descricao_causa}</p>
            </section>
        </>
    );
}