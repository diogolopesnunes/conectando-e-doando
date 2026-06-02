import Buton from "../Buton/Buton.jsx";
import css from "./InfoOng.module.css";
import SeguirOng from "../SeguirOng/SeguirOng.jsx";

export default function InfoOng({rota ,info, texto, api, atualizarSeguimento, seguindo, nomeOng, nomeProjeto}) {
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

                    <div className={`mt-2 flex-column flex-sm-row ${css.secaoChamadaAcao}`}>
                        <img
                            src={`${api}${info.logoInstituicao}?t=${Date.now()}`}
                            alt="Logo Instituição"
                            className={css.logoInstituicao + ' rounded'}
                            onError={(e) => {
                                e.target.src = "/public/SemImagemDisponivel.png";
                            }}
                        />

                        <div className={'d-flex justify-content-center align-items-center'}>
                            <SeguirOng
                                api={api}
                                idOng={info.id_ong}
                                nomeOng={info.nome}
                                temaOng={info.tema}
                                ongImagem={info.logoInstituicao}
                                seguindoInicial={seguindo}
                                aoAlterarSeguimento={(idOng, novoValor) => {
                                    atualizarSeguimento(novoValor);
                                }}
                            />
                        </div>

                        <Buton
                            background="laranja"
                            tamanho="medio"
                            texto={texto}
                            rota={rota}
                            state={{
                                id_ong: info.id_ong,
                                nome_ong: nomeOng,
                                id_projeto: info.id_projeto,
                                nome_projeto: nomeProjeto
                            }}
                        />
                    </div>
                </div>
            </section>

            <section className={css.secaoDescricao}>
                <p>Descrição da ong: {info.descricao_causa}</p>
            </section>
        </>
    );
}