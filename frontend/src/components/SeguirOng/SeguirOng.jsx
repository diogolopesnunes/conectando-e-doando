import {useEffect, useState} from "react";
import css from "./SeguirOng.module.css"
import Alerts from "../Alerts/Alerts.jsx";

export default function SeguirOng({
                                      api,
                                      idOng,
                                      nomeOng,
                                      temaOng,
                                      ongImagem,
                                      seguindoInicial = false,
                                      aoAlterarSeguimento,
                                      aoAlterarOngsFavoritas,
                                      carregarPosts
                                  }) {

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
                    carregarPosts(true)
                }
            }
            if(dados.mensagem){
                setMensagem(dados.mensagem)
            }
        } catch (erro) {
            console.error('Erro ao seguir/desseguir ONG:', erro);
        } finally {
            setCarregandoSeguir(false);
        }
    }

    useEffect(() => {
        if (mensagem) {
            const timer = setTimeout(() => {
                setMensagem(null);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [mensagem]);

    return (
        <>

            {mensagem && (
                <Alerts
                    key={mensagem.id}
                    tipo={mensagem.tipo}
                    imagem={`/public/${mensagem.tipo}.png`}
                    duracao={10000}
                    descricao={mensagem.descricao}
                />
            )}
            <div
                className={`${css.containerSeguir}`}
                onClick={seguirDesseguirOng}>
                <img
                    className={css.seguir}
                    src={seguindo ? '/seguir.png' : '/deseguir.png'}
                    alt={seguindo ? 'Deixar de seguir ONG' : 'Seguir ONG'}
                    title={seguindo ? 'Deixar de seguir ONG' : 'Seguir ONG'}
                />
                <p className={css.textoSeguir}>
                    {seguindo ? 'Seguindo' : 'Seguir'}
                </p>
            </div>
        </>
    );
}