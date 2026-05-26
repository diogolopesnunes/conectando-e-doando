import css from "./Pagamento.module.css";
import Buton from "../../components/Buton/Buton.jsx";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import Input from "../../components/Input/Input.jsx";
import Form from "../../components/Form/Form.jsx";
import copy from "copy-to-clipboard";

export default function Pagamento({api}){
    const [nomeProjeto, setNomeProjeto] = useState('teste');
    const [nomeOng, setNomeOng] = useState('teste');
    const [qrCode, setQrCode] = useState(true);
    const [pix,setPix] = useState('aujiwfh77af78ujh4uawjkfhju823yt789342yu7895yu3784556yvgt789gv345yv5tgynv523n78v5bhty23490nbvnty345tv5b738b89v5y43h78b7v5h8y34y347n0hn0574vby2n7hby45n7890bvy4579n80by5v42n798045by23n7890h234v5by7n890234v5byn789024v5by37890bnvy452378905y7n89083u');
    const [valorPix, setValorPix] = useState('');
    const [copiado, setCopiado] = useState(false);
    const [idusuario, setIdUsuario] = useState('');
    const navigate = useNavigate()

    useEffect(() => {

        if (
            !localStorage.getItem("email") ||
            !localStorage.getItem("id_usuario") ||
            localStorage.getItem("tipo_usuario") == 1
        ) {
            navigate("/login");
        } else {
            setIdUsuario(localStorage.getItem("id_usuario"));
        }

    }, [navigate]);

    function escolherValorPix(e){
        e.preventDefault();
        alert(`alerta provisório pra nao dar erros valor: ${valorPix}`)
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
                <div className={'col-10 m-auto  col-sm-10 d-flex flex-column my-3'}>
                    <p className={`fs-3 text-center text-sm-start ${css.maiuscula}`}>{nomeOng}</p>
                    <span className={`${css.linha}`}></span>
                    <p className={`text-center text-sm-start ${css.maiuscula}`}>{nomeProjeto}</p>
                </div>
                <div className={'col-10 m-auto col-sm-2 d-flex align-items-center justify-content-center justify-content-md-end my-3'}>
                    <Buton background="rosa" tamanho="pequeno" texto="Voltar" onClick={() => navigate(-1)}/>
                </div>
                <div className={'col-10 col-sm-12 m-auto'}>
                    <div className={'row d-flex justify-content-around'}>
                        {(qrCode||pix) && (
                            <div className={'col-12 col-sm-4 d-flex flex-column mb-3 mb-sm-0'}>
                                <img src={'/SemImagemDisponivel.png'} />
                                <div className={`rounded d-flex justify-content-between align-items-center w-100 my-4 ${css.bordaPix}`}>
                                    <p className={`w-100 p-2 ${css.pix}`}>{pix}</p>
                                    <img className={`${css.copiarIcone}`} src={copiado ? "/copiadoIcon.png" : "/copiarIcon.png"}
                                         alt={copiado ? "Copiado" : "Copiar Pix"} onClick={()=>copiarPix()}/>
                                </div>
                                <Buton background="laranja" tamanho="medio" texto="Fazer minha doação"/>
                            </div>
                        )}
                        <div className={`col-12 col-sm-4 p-5 d-flex flex-column justify-content-evenly ${css.bordaCard}`}>
                            <p className={'fs-3 text-center'}>Resumo da doação</p>
                            <p className={`rounded-4 cor-fundo-laranja p-2 fs-5 my-4 ${css.textJustify}`}>
                                Com sua doação estamos mais perto de alcançar nosso objetivo. Obrigado por acreditar e apoiar essa causa!
                            </p>
                            <Form largura={'pagamento'} onSubmit={(e) => escolherValorPix(e)}>
                                <Input tipoInp={'number'} value={valorPix} funcao={(e) => setValorPix(e.target.value)}
                                       inputMode="numeric"
                                       maxlength={10}
                                       mask={'cash'}
                                       htmlFor={'valorPix'}
                                       placeholder={'Digite o valor do pix'} label={'Digite o valor'} required={true} disabled={qrCode||pix ? true : false}/>
                                <Buton tipo={'submit'} texto={'Enviar'} tamanho={'pequeno'} background={'laranja'}/>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}