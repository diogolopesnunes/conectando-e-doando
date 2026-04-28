import Buton from "../Buton/Buton.jsx";
import css from "./SecaoAtualizacoes.module.css";

export default function SecaoAtualizacoes({ atualizacoes = [], instituicao, idProjeto, onExcluir, onAtivarDesativar, quantidade, api, logoOng }) {
    return (
        <section className={css.secaoAtualizacoes + ' px-3 pe-sm-3 px-lg-0'}>
            <div className={'d-flex flex-column flex-sm-row align-items-center justify-content-sm-between row justify-content-center mb-3'}>
                <p className={'col text-center text-sm-start'}>Posts: {quantidade}</p>
                <h2 className={css.titulo + ' col'}>Atualizações</h2>
                <div className={'col d-flex justify-content-sm-end justify-content-center'}>
                    <Buton background="laranja" tamanho="pequeno" texto="Adicionar" rota={`/adicionar_post/${idProjeto}`} />
                </div>
            </div>

            {atualizacoes.length === 0 && <p className={css.textoNenhumaAtualizacao}>Nenhuma atualização cadastrada.</p>}
            <div className={'d-flex flex-column gap-4 gap-sm-0'}>
            {atualizacoes.map((update) => (
                <div key={update.id_post || update.id} className={css.cardAtualizacao}>

                    <div className={css.conteudoAtualizacao + ' d-flex'}>
                        <img
                            src={update.imagem ? `${api}${update.imagem}?t=${Date.now()}` : "/img/post.jpg"}
                            alt={update.titulo}
                            className={css.imagemAtualizacao}
                            onError={(e) => {
                                e.target.src = "/public/SemImagemDisponivel.png";
                            }}
                        />

                        <div className={css.textoAtualizacao}>
                            <div className={css.cabecalhoInstituicaoAtualizacao + ' d-flex align-items-center justify-content-between'}>
                                <div className={'d-flex gap-2 mt-2 mt-sm-0'}>
                                    <img
                                        src={logoOng ? `${api}${logoOng}?t=${Date.now()}` : "/img/ong.png"}
                                        alt="Logo Instituição"
                                        className={css.logoInstituicaoAtualizacao + ' rounded'}
                                        onError={(e) => {
                                            e.target.src = "/public/SemImagemDisponivel.png";
                                        }}
                                    />
                                    <span className={css.nomeInstituicaoAtualizacao}>{instituicao}</span>
                                </div>
                            </div>
                            <h3 className={css.tituloAtualizacao}>{update.titulo}</h3>
                            <p className={css.descricaoAtualizacao}>{update.descricao || update.acao}</p>

                        </div>
                        <div className={css.acoesAtualizacao + ' flex-column flex-sm-row mt-2'}>
                            <div className={css.infoCabecalhoAtualizacao + " justify-self-around"}>
                                <span>{update.hora}</span>
                                <span>{update.data}</span>
                            </div>
                            <Buton background="rosa" tamanho="pequeno" texto="Excluir" onClick={() => onExcluir(update.id_post || update.id)} />
                            <Buton background="laranja" tamanho="pequeno" texto="Editar" rota={`/edicao_post/${idProjeto}/${update.id_post || update.id}`} />
                            <Buton background={Number(update.atividade) === 1 ? "vermelho" : "verde"} tamanho="pequeno" texto={Number(update.atividade) === 1 ? "Desativar" : "Ativar"} onClick={() => onAtivarDesativar(update.id_post || update.id)} />
                        </div>
                    </div>
                </div>
            ))}
            </div>
        </section>
    );
}
