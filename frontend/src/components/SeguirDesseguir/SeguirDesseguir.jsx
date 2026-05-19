import css from "../CardPost/CardPost.module.css";
import {useState, useEffect} from "react";
import Alerts from "../Alerts/Alerts.jsx";

export default function SeguirDesseguir( {seguindoInicial, api, idOng, setMensagem, aoAlterarSeguimento, aoAlterarOngsFavoritas, nomeOng, temaOng, ongImagem} ) {

    const [seguindo, setSeguindo] = useState(seguindoInicial);
    const [carregandoSeguir, setCarregandoSeguir] = useState(false);
    const [mensagem, setMensagem] = useState(null);

    useEffect(() => {
        setSeguindo(seguindoInicial);
    }, [seguindoInicial]);

    async function seguirDesseguirOng() {
        if (carregandoSeguir) return;

        try {

            setCarregandoSeguir(true);

            const resposta = await fetch(
                `${api}/deseguir_seguir_ong/${idOng}`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            );
            const dados = await resposta.json();
            if (dados.mensagem){
                setMensagem(dados.mensagem);
            }

            if (resposta.ok) {
                setSeguindo(dados.seguindo);

                // Atualiza todos os posts da mesma ONG
                if (aoAlterarSeguimento) {
                    aoAlterarSeguimento(idOng, dados.seguindo);
                }
                if (aoAlterarOngsFavoritas) {
                    aoAlterarOngsFavoritas(
                        idOng,
                        nomeOng,
                        temaOng,
                        ongImagem,
                        dados.seguindo
                    );
                }
                if (resposta.mensagem) {
                    setMensagem(resposta.mensagem);
                }
            }
        } catch (erro) {
            console.error('Erro ao seguir/desseguir ONG:', erro);
        } finally {
            setCarregandoSeguir(false);
        }
    }

    return (
        <>

            <img
                src={seguindo ? '/seguir.png' : '/deseguir.png'}
                className={css.teste}
                alt={seguindo ? 'Deixar de seguir ONG' : 'Seguir ONG'}
                title={seguindo ? 'Deixar de seguir ONG' : 'Seguir ONG'}
                onClick={seguirDesseguirOng}
                style={{cursor: 'pointer'}}/>
        </>
    )
}