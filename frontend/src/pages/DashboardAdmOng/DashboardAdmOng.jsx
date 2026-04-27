import css from "./DashboardAdmOng.module.css"
import {useState, useEffect} from "react";
import Buton from "../../components/Buton/Buton.jsx";
import {useNavigate} from "react-router-dom";
import Nav from "../../components/Nav/Nav.jsx";
import IMask from "imask";



export default function DashboardAdmOng({api}) {
    const [email, setEmail] = useState("");
    const [nome, setNome] = useState("");
    const [id, setId] = useState("");
    const [ongs, setOngs] = useState([]);
    const [aprovacao, setAprovacao] = useState(1);
    const navigate = useNavigate();

    const ongsNaoAprovadas = ongs.filter((ong) => Number(ong.situacao) === 4 || Number(ong.situacao) === 0);
    const ongsAprovadasEReprovadas = ongs.filter((ong) => Number(ong.situacao) !== 4 && Number(ong.situacao) !== 0);

    function formatarCNPJ(valor) {
        const mask = IMask.createMask({
            mask: "00.000.000-0000-00"
        });

        mask.resolve(String(valor));
        return mask.value;
    }

    function formatarTelefone(valor){
        const mask = IMask.createMask({
            mask: "(00) 00000-0000"
        });

        mask.resolve(String(valor));
        return mask.value;
    }

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
            navigate('/login')
        } else{
            setNome(localStorage.getItem("nome"));
            setEmail(localStorage.getItem("email"));
            setId(localStorage.getItem("id_usuario"));
        }
    }, [])

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("id_usuario") || localStorage.getItem("tipo_usuario") != 2) {
            navigate('/login')
        }
    }, [])

    async function listarOngs() {
        let listagemOngs = await fetch(`${api}/listar_ong_adm`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        })

        let listaOngs = await listagemOngs.json();

        console.log(listaOngs)
        console.log(listaOngs.mensagem)

        let ongsFormatado = listaOngs.ongs

        setOngs(ongsFormatado)
    }

    useEffect(() => {
        listarOngs();
    }, []);


    useEffect(() => {
        console.log(ongsNaoAprovadas);
    }, [ongsNaoAprovadas])
    return (
        <section className={'container m-auto'}>
            <div className={'row'}>
                <div className={'col-12'}>
                    <Nav/>
                </div>
                <div className={"formataAltura m-auto col-12 " + css.containerPrevia}>
                    {aprovacao == 0 ? (
                        <div className={"row d-flex justify-content-center align-items-center gap-3"}>
                            {ongsNaoAprovadas.map((ong) => (
                                <div key={ong.id} className={"row m-auto d-flex " + css.cardBonito}>
                                    <div className={"col"}>
                                        <div className={'row'}>
                                            <div className={'col-8 ' + css.nome}>
                                                <p>Nome: {ong.nome}</p>
                                            </div>
                                            <div className={"d-flex justify-content-around col-4"}>
                                                <p className={css.item_impar}>ID: {ong.id_usuario}</p>
                                            </div>
                                            <div className={'col-2'}>
                                                <Buton texto={'Aprovar'} tamanho={'pequeno'} background={'rosa'} rota={'/email_aprovacao'}/>
                                            </div>
                                            <div className={'col-3'}>
                                                <p className={css.item_impar}>Data de Registro: {ong.data_hora_registro}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={'row'}>
                                        <div className={'col'}>
                                            <p className={css.item_par}>{ong.descricao_causa}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ):(
                        <div className={"row d-flex justify-content-center align-items-center gap-3"}>
                            {ongsAprovadasEReprovadas.map((ong) => (
                                <div key={ong.id} className={"row m-auto d-flex " + css.cardBonito}>
                                    <div className={"col"}>
                                        <div className={'row'}>
                                            <div className={'col-9'}>
                                                <div className={'row'}>
                                                    <div className={"d-flex justify-content-around col-4"}>
                                                        <p className={css.item_impar}>ID: {ong.id_usuario}</p>
                                                    </div>
                                                    <div className={'col-6  ' + css.nome}>
                                                        <p>Nome: {ong.nome}</p>
                                                    </div>

                                                    <div className={'col-4'}>
                                                        <p className={css.item_par}>CNPJ: {formatarCNPJ(ong.cpf_cpnj)}</p>
                                                    </div>
                                                    <div className={'col-4'}>
                                                        <p className={css.item_impar}>Telefone: {formatarTelefone(ong.telefone)}</p>
                                                    </div>
                                                    <div className={'col-4'}>
                                                        <p className={css.item_impar}>Registro: {ong.data_hora_registro}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={'col-3'}>
                                                {ong.situacao == 3 || ong.situacao == 2 ? (
                                                    //     ativa
                                                    <div>
                                                        <Buton texto={'Desbloquear'} background={'laranja'}/>
                                                        {ong.situacao == 2 && (
                                                            <Buton texto={'Excluir'} background={'vermelho'}/>
                                                        )}
                                                    </div>
                                                ) : ong.situacao == 1 ? (
                                                    //     desativa
                                                    <Buton texto={'Bloquear'} background={'rosa'}/>
                                                ) : ong.situacao == 5 && (
                                                    //     excluir
                                                    <Buton texto={'Excluir'} background={'vermelho'}/>
                                                )}
                                                <p className={css.item_impar}>Situação: {ong.situacao}</p>
                                            </div>

                                        </div>
                                    </div>
                                    <div className={'row'}>
                                        <div className={'col'}>
                                            <p className={css.item_par}>{ong.descricao_causa}</p>
                                        </div>
                                    </div>



                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </section>
    )
}