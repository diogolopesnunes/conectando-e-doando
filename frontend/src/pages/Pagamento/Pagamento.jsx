import css from "./Pagamento.module.css";
import Buton from "../../components/Buton/Buton.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Input from "../../components/Input/Input.jsx";
import Form from "../../components/Form/Form.jsx";
import copy from "copy-to-clipboard";

export default function Pagamento({ api }) {

    const navigate = useNavigate();
    const location = useLocation();

    const idOng = location.state?.id_ong;
    const idProjeto = location.state?.id_projeto;

    const [nomeProjeto, setNomeProjeto] = useState("");
    const [nomeOng, setNomeOng] = useState("");
    const [idusuario, setIdUsuario] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [pix, setPix] = useState("");
    const [valorPix, setValorPix] = useState("");
    const [copiado, setCopiado] = useState(false);
    const [carregando, setCarregando] = useState(false)

    useEffect(() => {

        if (
            !localStorage.getItem("email") ||
            !localStorage.getItem("id_usuario") ||
            localStorage.getItem("tipo_usuario") == 1
        ) {

            navigate("/login");

        } else {

            setIdUsuario(localStorage.getItem("id_usuario"));

            if (location.state) {

                console.log(location.state);

                setNomeOng(location.state.nome_ong || "");

                if (location.state.nome_projeto) {

                    setNomeProjeto(location.state.nome_projeto);
                }
            }
        }

    }, [navigate, location.state]);

    async function escolherValorPix(e) {

        e.preventDefault();

        try {
            setCarregando(true)
            const resposta = await fetch(
                `${api}/enviar_pix`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        id_ong: idOng,
                        id_projeto: idProjeto,
                        valor: valorPix
                    })
                }
            );

            const retorno = await resposta.json();

            console.log(retorno);

            if (resposta.ok) {
                setCarregando(false)

                setNomeOng(retorno.pix.nome_ong);

                if (retorno.pix.nome_projeto) {

                    setNomeProjeto(retorno.pix.nome_projeto);
                }

                setPix(retorno.pix.chave_pix);

                setQrCode(
                    `${api}/qrcodes/${retorno.pix.qrcode}`
                );

            } else {

                alert(retorno.mensagem.descricao);
            }

        } catch (erro) {

            console.log(erro);
        }
    }


    function copiarPix() {

        const copiou = copy(pix);

        if (copiou) {

            setCopiado(true);

            setTimeout(() => {

                setCopiado(false);

            }, 1500);

        } else {

            alert("Não foi possível copiar o Pix");
        }
    }

    return (
        <div className={'container m-auto formataAltura'}>

            <div className={'row p-2'}>

                <div className={'col-10 m-auto col-sm-10 d-flex flex-column my-3'}>

                    <p className={`fs-3 text-center text-sm-start ${css.maiuscula}`}>
                        {nomeOng}
                    </p>

                    <span className={css.linha}></span>

                    <p className={`text-center text-sm-start ${css.maiuscula}`}>
                        {nomeProjeto}
                    </p>

                </div>

                <div className={'col-10 m-auto col-sm-2 d-flex align-items-center justify-content-center justify-content-md-end my-3'}>

                    <Buton
                        background="rosa"
                        tamanho="pequeno"
                        texto="Voltar"
                        onClick={() => navigate(-1)}
                    />

                </div>

                <div className={'col-10 col-sm-12 m-auto'}>

                    <div className={'row d-flex justify-content-around'}>

                        {carregando ? (
                            <div className={`col-12 col-sm-4 d-flex align-items-center justify-content-center ${css.fundoRoxo}`}>
                                <p className={'text-white'}>Carregando...</p>
                            </div>
                        ): (
                            (qrCode || pix) && (
                                <div className={'col-12 col-sm-4 d-flex flex-column mb-3 mb-sm-0'}>

                                    <img
                                        src={qrCode}
                                        alt="QRCode Pix"
                                    />

                                    <div className={`rounded d-flex justify-content-between align-items-center w-100 my-4 ${css.bordaPix}`}>

                                        <p className={`w-100 p-2 ${css.pix}`}>
                                            {pix}
                                        </p>

                                        <img
                                            className={css.copiarIcone}
                                            src={copiado ? "/copiadoIcon.png" : "/copiarIcon.png"}
                                            alt="Copiar Pix"
                                            onClick={copiarPix}
                                        />

                                    </div>

                                </div>
                            )
                        )}


                        <div className={`col-12 col-sm-4 p-5 d-flex flex-column justify-content-evenly ${css.bordaCard}`}>

                            <p className={'fs-3 text-center'}>
                                Resumo da doação
                            </p>

                            <p className={`rounded-4 cor-fundo-laranja p-2 fs-5 my-4 ${css.textJustify}`}>

                                Com sua doação estamos mais perto de alcançar nosso objetivo.

                            </p>

                            <Form
                                largura={'pagamento'}
                                onSubmit={escolherValorPix}
                            >

                                <Input
                                    tipoInp={'number'}
                                    value={valorPix}
                                    funcao={(e) => setValorPix(e.target.value)}
                                    htmlFor={'valorPix'}
                                    placeholder={'Digite o valor do pix'}
                                    label={'Digite o valor'}
                                    required={true}
                                />

                                <Buton
                                    tipo={'submit'}
                                    texto={'Gerar Pix'}
                                    tamanho={'pequeno'}
                                    background={'laranja'}
                                />

                            </Form>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}