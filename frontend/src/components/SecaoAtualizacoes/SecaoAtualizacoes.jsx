import Buton from "../Buton/Buton.jsx";
import css from "./SecaoAtualizacoes.module.css";

export default function SecaoAtualizacoes({ atualizacoes, instituicao }) {
    return (
        <section className={css.secaoAtualizacoes}>
            <div className={css.cabecalhoAtualizacoes}>
                <h2 className={css.tituloAtualizacoes}>Atualizações</h2>
                <div className={css.envoltórioBotaoAdicionar}>
                    <Buton background="laranja" tamanho="pequeno" texto="Adicionar" />
                </div>
            </div>

            {atualizacoes.map((update) => (
                <div key={update.id} className={css.cardAtualizacao}>
                    <div className={css.infoCabecalhoAtualizacao}>
                        <span>{update.hora}</span>
                        <span>{update.data}</span>
                    </div>
                    <div className={css.conteudoAtualizacao}>
                        <img src={update.imagem} alt={update.titulo} className={css.imagemAtualizacao} />
                        <div className={css.textoAtualizacao}>
                            <div className={css.cabecalhoInstituicaoAtualizacao}>
                                <img src="/logoSenna.png" alt="Logo" className={css.logoInstituicaoAtualizacao}
                                     onError={(e) => e.target.src = "https://ingresso-a.akamaihd.net/b2b/production/uploads/article/image/1708/oppenheimer-como-nolan-recriou-a-explosao-da-bomba-atomica-6898769dc3e601.jpg"} />
                                <span className={css.nomeInstituicaoAtualizacao}>{instituicao}</span>
                            </div>
                            <h3 className={css.tituloAtualizacao}>{update.titulo}</h3>
                            <p className={css.descricaoAtualizacao}>{update.descricao}</p>
                            <div className={css.acoesAtualizacao}>
                                <Buton background="rosa" tamanho="pequeno" texto="Excluir" />
                                <Buton background="laranja" tamanho="pequeno" texto="Editar" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}