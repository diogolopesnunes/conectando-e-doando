import css from './OngCausa.module.css';
import Buton from "../../Buton/Buton.jsx";

export default function OngCausa() {
    return (
        <div className={css.container}>
            {/* Bloco Roxo */}
            <section className={css.cardRoxo}>
                <h2 className={css.titulo}>
                    Quer encontrar uma ONG pela causa?
                    <span className={'d-block'}>
                        Você pode também :)
                    </span>
                </h2>

                <p className={css.descricao}>
                    Conheça nossas causas, faça uma doação para alguma das ONGs cadastradas e colabore!
                </p>
                <Buton rota={"/login"} background={'laranja'} texto={'Quero fazer uma doação'} tamanho={'medio'} />

                <div className={css.containerImagem}>
                    <img src="public/imagem_crianca_feliz.png" alt="Criança sorrindo" />
                </div>
            </section>

            <section className={css.cardLaranja}>
                <h2 className={css.titulo}>
                    Ajude a mudar vidas, ajude uma ONG!
                </h2>

                <p className={'px-3 ' + css.descricao} style={{ maxWidth: '100%' }}>
                    Ajude a salvar vidas, e a mudar o futuro dessas pessoas
                </p>

                <Buton background={'roxo'} texto={'Descobrir ONGs'} tamanho={'medio'} />
            </section>
        </div>
    );
}