import {useEffect, useState} from "react";
import css from "./SeguirOng.module.css"

export default function SeguirOng({
                                      api,
                                      idOng,
                                      nomeOng,
                                      temaOng,
                                      ongImagem,
                                      seguindoInicial = false,
                                      aoAlterarSeguimento,
                                      aoAlterarOngsFavoritas
                                  }) {

    const [seguindo, setSeguindo] = useState(seguindoInicial);
    const [carregandoSeguir, setCarregandoSeguir] = useState(false);

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

            if (resposta.ok) {
                setSeguindo(dados.seguindo);

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
            }

        } catch (erro) {
            console.error('Erro ao seguir/desseguir ONG:', erro);
        } finally {
            setCarregandoSeguir(false);
        }
    }

    return (
        <img
            className={css.seguir}
            src={seguindo ? '/seguir.png' : '/deseguir.png'}
            alt={seguindo ? 'Deixar de seguir ONG' : 'Seguir ONG'}
            title={seguindo ? 'Deixar de seguir ONG' : 'Seguir ONG'}
            onClick={seguirDesseguirOng}
        />
    );
}