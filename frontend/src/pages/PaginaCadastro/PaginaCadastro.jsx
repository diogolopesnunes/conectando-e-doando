import Form from "../../components/Form/Form.jsx";
import Input from "../../components/Input/Input.jsx";
import Buton from "../../components/Buton/Buton.jsx"
import {useEffect, useState, useRef} from "react";
import UploadImagem from "../../components/uploadImagem/uploadImagem.jsx";
import Titulo from "../../components/Titulo/Titulo.jsx";
import css from "./PaginaCadastro.module.css"
import {useNavigate} from "react-router-dom";
import Alerts from "../../components/Alerts/Alerts.jsx";


export default function PaginaCadastro({api}) {

    const [selecionado, setSelecionado] = useState('0')
    const [checado1, setChecado1] = useState(true)
    const [checado2, setChecado2] = useState(false)
    const [mensagem, setMensagem] = useState('')
    const [tipoMensagem, setTipoMensagem] = useState('')
    const inputImagemRef = useRef();
    const inputBannerRef = useRef();

    useEffect(()=>{
        if (mensagem) {
            const timer = setTimeout(() => {
                setMensagem('');
            }, 10000);

            return () => clearTimeout(timer);
        }
    },[mensagem])

    function alterar(e) {
        setSelecionado(e.target.value)
        if (checado1){
            setChecado2(true)
            setChecado1(false)
            setTipoUsuario('1')
            setCpfCnpj('')
        } else{
            setChecado2(false)
            setChecado1(true)
            setTipoUsuario('0')
            setCpfCnpj('')
        }
    }

    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const [tipoUsuario, setTipoUsuario] = useState(0)
    const [cpfCnpj, setCpfCnpj] = useState('')
    const [tipoOng, setTipoOng] = useState('')
    const [descricaoCausa, setDescricaoCausa] = useState('')
    const [bacoOng, setBacoOng] = useState('')
    const [agenciaOng, setAgenciaOng] = useState('')
    const [contaOng, setContaOng] = useState('')
    const [cidadeOng, setCidadeOng] = useState('')
    const [telefone, setTelefone] = useState('')
    const [imagem, setImagem] = useState(false)
    const [imagemBanner, setImagemBanner] = useState(false)
    const [preview, setPreview] = useState(null);
    const [previewBanner, setPreviewBanner] = useState(null);

    function colocarImagem(e) {
        const algo = e.target.files[0];
        if (algo) {
            setImagem(algo);
            setPreview(URL.createObjectURL(algo));
        }
    }

    function colocarImagemBanner(e) {
        const algo = e.target.files[0];
        if (algo) {
            setImagemBanner(algo);
            setPreviewBanner(URL.createObjectURL(algo));
        }
    }

    const navegate = useNavigate();

    // async function digitarCpfCnpj(e) {
    //     if (e.target.value.length <= 11) {
    //         setCpfCnpj(e.target.value);
    //     }
    // }

    async function cadastro(f) {
        f.preventDefault();
        
        const form = new FormData()
        form.append("nome",nome)
        form.append("email", email)
        form.append("senha", senha)
        form.append("confirmar_senha", confirmarSenha)
        form.append("tipo_de_usuario", tipoUsuario)
        form.append("cpf_cnpj", cpfCnpj)
        form.append("tipo_ong", tipoOng)
        form.append("descricao_causa", descricaoCausa)
        form.append("banco_ong",bacoOng)
        form.append("agencia_ong", agenciaOng)
        form.append("conta_ong", contaOng)
        form.append("cidade_ong",cidadeOng)
        form.append("telefone", telefone)

        if (imagem) {
            form.append("imagem", imagem)
        }

        if (imagemBanner) {
            form.append("bannerOng", imagemBanner)
        }

        let retorno = await fetch(`${api}/cadastro`, {
            method: "POST",
            credentials: "include",
            body: form
        })
        retorno = await retorno.json()
        console.log(retorno)

        if (!retorno) {
            console.log("Erro do servidor:", retorno);
            alert("DEU RUIM DE MAIIIISSSS!!! APAGA, SOCORRO DEUS")
        }
        if (retorno.usuario){
            localStorage.setItem('email', retorno.usuario.email);
            setTimeout(function (){navegate('/validar')}, 2000)

        }
        if (retorno.mensagem){
            setMensagem(retorno.mensagem.descricao)
            setTipoMensagem(retorno.mensagem.tipo)
        }

    }

    return (
        <div className="container m-auto">
            <div className="row">
                <div className="col">
                    {mensagem && <Alerts tipo={tipoMensagem} imagem={`./public/${tipoMensagem}.png`} duracao={'10000'} descricao={mensagem} />}


                    <Form largura="maior" titulo={"Cadastro"} onSubmit={cadastro}>
                        <Input htmlFor={'nome'} label={'Nome'} tipoInp={'text'} placeholder={'Digite seu nome'} value={nome} funcao={(f)=> setNome(f.target.value)}/>
                        <Input htmlFor={'email'} label={'Email'} tipoInp={'email'} placeholder={'Digite seu email'} value={email} funcao={(f)=> setEmail(f.target.value)}/>
                        <div className={"w-75 m-auto d-flex justify-content-between " + css.senha}>
                            <Input minLength={8} maxLength={20} htmlFor={'senha'} label={'Senha'} tipoInp={'password'}
                                   placeholder={'Digite sua senha'} classe={'metade'} value={senha} funcao={(f) => setSenha(f.target.value)}/>
                            <Input minLength={8} maxLength={20} htmlFor={'confirmarSenha'} label={'Confirme sua senha'} tipoInp={'password'}
                                   placeholder={'Digite a senha digitada anteriormente'} classe={'metade'} value={confirmarSenha} funcao={(f) => setConfirmarSenha(f.target.value)}/>
                        </div>
                        <Input htmlFor={'telefone'} label={'Telefone'} tipoInp={'text'}  placeholder={'Digite seu telefone'} value={telefone} funcao={(e) => setTelefone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                               inputMode="numeric"
                               maxLength={15}
                               minLength={15}
                               mask={"telefone"}/>
                        <div className="w-75 m-auto d-flex justify-content-between flex-lg-row flex-column">
                            <Input tipoInp={'radio'} label={'Sou doador'} htmlFor={'user'} classe={'metade'}
                                   value={'0'} funcao={alterar} checado={checado1} />
                            <Input tipoInp={'radio'} label={'Sou ONG'} htmlFor={'user'} classe={'metade'} value={'1'}
                                   funcao={alterar} checado={checado2} />
                        </div>

                        {selecionado == "0" ? (
                            <div>
                                <Input htmlFor={'cpf'} label={'CPF'} tipoInp={'text'} placeholder={'Digite seu CPF'} value={cpfCnpj} funcao={(e) => setCpfCnpj(e.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric" maxLength={14} minLength={14} mask={"cpf"}/>



                                <div className="w-100 flex-column d-flex justify-content-center align-items-center mb-3">
                                    <label className={"mb-3 fw-bold"}>Imagem de perfil</label>
                                    <input ref={inputImagemRef} type="file" onChange={colocarImagem} className={' ' + css.botao}/>
                                    {preview && (
                                        <>
                                            <img className={'mt-3 ' + css.preview + ' ' + css.circulo}
                                                 src={preview}
                                                 alt="Preview"
                                            />
                                            <Buton tipo={"button"} onClick={() => { inputImagemRef.current.value = null;setPreview(null); setImagem(null)}} background={'vermelho'} tamanho={'pequeno'} texto={"Remover"} />
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <Input htmlFor={'cnpj'} label={'CNPJ'} tipoInp={'text'}
                                       placeholder={'Digite seu CNPJ'} value={cpfCnpj} funcao={(e) => setCpfCnpj(e.target.value.replace(/\D/g, "").slice(0, 14))} inputMode="numeric" maxLength={18} minLength={18} mask={"cnpj"}/>
                                <Input htmlFor={'tipoOng'} label={'Selecione o tipo de ONG'} tipoInp={'select'} value={tipoOng} opcoeslabel="Selecione o tipo da ONG" opcoes={["Meio ambiente", "Educação", "Saúde"]} funcao={(f) => setTipoOng(f.target.value)}/>
                                <Input htmlFor={'causaOng'} label={'Causa da ONG'} tipoInp={'textarea'}
                                       placeholder={'Digite a causa da ONG'} value={descricaoCausa} funcao={(f) => setDescricaoCausa(f.target.value)}/>
                                <div className={"d-flex justify-content-center"}>
                                    <Titulo texto={"Dados Bancários"} />
                                </div>
                                <p className={'text-center w-100 m-auto'}>Esses dados serão usados para enviar os valores para suas contas bancárias</p>

                                <Input htmlFor={'cidade'} label={'Cidade:'} tipoInp={'text'} placeholder={'Digite a cidade da ONG'} value={cidadeOng} funcao={(f) => setCidadeOng(f.target.value)}/>
                                <Input htmlFor={'banco'} label={'Banco:'} tipoInp={'text'} placeholder={'Informe qual seu banco'} value={bacoOng} funcao={(f) => setBacoOng(f.target.value)}/>
                                <Input htmlFor={'agencia'} label={'Agencia:'} tipoInp={'text'} placeholder={'Informe a agencia bancária'} value={agenciaOng} funcao={(f) => setAgenciaOng(f.target.value)}/>
                                <Input htmlFor={'conta'} label={'Conta:'} tipoInp={'text'} placeholder={'Informe a conta bancária'} value={contaOng} funcao={(f) => setContaOng(f.target.value)}/>

                                <div className={"w-100 flex-column d-flex justify-content-center align-items-center mb-5"}>
                                    <label className={"mb-3 fw-bold"}>Ícone da ONG</label>
                                    <input ref={inputImagemRef} type="file" onChange={colocarImagem} className={' ' + css.botao}/>
                                    {preview && (
                                        <>
                                            <img className={'mt-3 ' + css.preview}
                                                 src={preview}
                                                 alt="Preview"
                                            />
                                            <Buton tipo={"button"} onClick={() => {inputImagemRef.current.value = null; setPreview(null); setImagem(null);}} background={'vermelho'} tamanho={'pequeno'} texto={"Remover"} />
                                        </>
                                    )}
                                </div>

                                <div className="w-100 flex-column d-flex justify-content-center align-items-center mb-3">
                                    <label className={"mb-3 fw-bold"}>Imagem do Banner</label>
                                    <input ref={inputBannerRef} type="file" onChange={colocarImagemBanner} className={' ' + css.botao}/>
                                    {previewBanner && (
                                        <>
                                            <img className={'mt-3 ' + css.preview}
                                                 src={previewBanner}
                                                 alt="Preview"
                                            />
                                            <Buton tipo={"button"} onClick={() => {inputBannerRef.current.value = null; setPreviewBanner(null); setImagemBanner(null);}} background={'vermelho'} tamanho={'pequeno'} texto={"Remover"} />
                                        </>
                                    )}
                                </div>

                            </>
                        )}

                        <Buton texto={'Cadastrar'} background={'laranja'} tamanho={'medio'}  tipo={"submit"} />
                    </Form>
                </div>
            </div>
        </div>
    )
}