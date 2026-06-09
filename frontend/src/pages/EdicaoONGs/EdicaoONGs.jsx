import Form from "../../components/Form/Form.jsx";
import Input from "../../components/Input/Input.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import { useState, useRef, useEffect } from "react";
import css from "./EdicaoONGs.module.css";
import Alerts from "../../components/Alerts/Alerts.jsx";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../../components/Nav/Nav.jsx";

export default function EditarOng({ api }) {

    const navigate = useNavigate();
    const inputImagemRef = useRef();
    const inputBannerRef = useRef();

    const [mensagem, setMensagem] = useState('');

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [cpfCnpj, setCpfCnpj] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [tipoOng, setTipoOng] = useState('');
    const [tiposOng, setTiposOng] = useState([])
    const [descricaoCausa, setDescricaoCausa] = useState('');

    const [cidadeOng, setCidadeOng] = useState('');
    const [bacoOng, setBacoOng] = useState('');
    const [agenciaOng, setAgenciaOng] = useState('');
    const [contaOng, setContaOng] = useState('');
    const [chavePix, setChavePix] = useState('');

    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);

    const [imagemBanner, setImagemBanner] = useState(false)
    const [previewBanner, setPreviewBanner] = useState(null);

    const { id_usuario } = useParams();

    const [idUsuario, setIdUsuario] = useState(id_usuario || localStorage.getItem("id_usuario"));

    const navegate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("email") || !localStorage.getItem("email") || !localStorage.getItem("id_usuario")) {
            navigate('/login')
        } else{
            setIdUsuario(id_usuario || localStorage.getItem("id_usuario"));
        }
    }, [])

    useEffect(() => {
        async function buscarOng() {
            let resposta = await fetch(`${api}/editar_usuario/${idUsuario}`,{
                method: "GET",
                credentials: "include"
            });
            let res = await resposta.json();

            if (res.usuario) {
                setNome(res.usuario.nome);
                setEmail(res.usuario.email);
                setCpfCnpj(res.usuario.cpf_cnpj);
                setTipoOng(res.usuario.tipo_ong);
                setDescricaoCausa(res.usuario.descricao_causa);
                setCidadeOng(res.usuario.cidade_ong);
                setBacoOng(res.usuario.banco_ong);
                setAgenciaOng(res.usuario.agencia_ong);
                setContaOng(res.usuario.conta_ong);
                setTelefone(res.usuario.telefone);
                setChavePix(res.usuario.chave_pix);
            }
            if (res.mensagem){
                setMensagem({
                    ...res.mensagem,
                    id: Date.now()
                });
            }
        }

        buscarOng();
    }, [idUsuario]);

    useEffect(() => {
        if (mensagem) {
            const timer = setTimeout(() => setMensagem(''), 10000);
            return () => clearTimeout(timer);
        }
    }, [mensagem]);

    function colocarImagem(e) {
        const file = e.target.files[0];
        if (file) {
            setImagem(file);
            setPreview(URL.createObjectURL(file));
        }
    }

    function colocarImagemBanner(e) {
        const algo = e.target.files[0];
        if (algo) {
            setImagemBanner(algo);
            setPreviewBanner(URL.createObjectURL(algo));
        }
    }

    async function editar(e) {
        e.preventDefault();

        if (senha && senha != confirmarSenha) {
            setMensagem({
                descricao:"As senhas não coincidem",
                tipo:'erro',
                id: Date.now()
            });
            return;
        }

        const form = new FormData();
        form.append("nome", nome);
        form.append("email", email);
        form.append("cpf_cnpj", cpfCnpj);
        form.append("tipo_ong", tipoOng);
        form.append("descricao_causa", descricaoCausa);
        form.append("cidade_ong", cidadeOng);
        form.append("banco_ong", bacoOng);
        form.append("agencia_ong", agenciaOng);
        form.append("conta_ong", contaOng);
        form.append("chave_pix", chavePix);
        form.append('senha', senha)
        form.append('confirmar_senha', confirmarSenha)

        if (senha) form.append("senha", senha);
        if (imagem) form.append("imagem", imagem);
        if (imagemBanner) {form.append("bannerOng", imagemBanner)}


        let res = await fetch(`${api}/editar_usuario/${idUsuario}`, {
            method: "PUT",
            body: form,
            credentials: "include"
        });

        res = await res.json();

        if (res.mensagem){
            setMensagem({
                ...res.mensagem,
                id: Date.now()
            });
            if (res.mensagem.tipo == 'sucesso'){
                setTimeout(function () {
                    navegate(localStorage.getItem("tipo_usuario") == 2 ? "/dashboard_adm_ong" : "/previa_ong")
                }, 1500)
            }
        }
    }

    useEffect(() => {

        async function buscarTiposOng() {

            try {

                let resposta = await fetch(`${api}/listar_tipos_ong`, {
                    method: "GET",
                    credentials: "include"
                })

                resposta = await resposta.json()

                setTiposOng(resposta.tipos)

            } catch (erro) {
                console.log(erro)
            }
        }

        buscarTiposOng()

    }, [])

    return (
        <>
            <Nav />
            <div className="container m-auto">
                <div className="row">
                    <div className="col">

                        {mensagem && (
                            <Alerts
                                key={mensagem.id}
                                tipo={mensagem.tipo}
                                imagem={`/public/${mensagem.tipo}.png`}
                                duracao={'10000'}
                                descricao={mensagem.descricao}
                            />
                        )}

                        <Form largura="maior" titulo={"Edição da ONG"} onSubmit={editar}>

                            <Input obrigatorio={"Sim"} label="Nome" tipoInp="text" value={nome} funcao={(e)=>setNome(e.target.value)} />

                            <Input obrigatorio={"Sim"} label="Email" tipoInp="email" value={email} funcao={(e)=>setEmail(e.target.value)} />

                            <Input obrigatorio={"Sim"} htmlFor={'cnpj'} label={'CNPJ'} tipoInp={'text'}
                                   placeholder={'Digite seu CNPJ'} value={cpfCnpj} funcao={(e) => setCpfCnpj(e.target.value.replace(/\D/g, "").slice(0, 14))} inputMode="numeric" maxLength={18} minLength={18} mask={"cnpj"}/>

                            <Input label="Telefone" obrigatorio={"Sim"}
                                   tipoInp="text"
                                   value={telefone}
                                   funcao={(e)=>setTelefone(e.target.value)}
                                   inputMode="numeric"
                                   maxLength={15}
                                   minLength={15}
                                   mask={"telefone"}
                            />

                            {/*<Input label="Senha" tipoInp="password"*/}
                            {/*       value={senha}*/}
                            {/*       funcao={(e)=>setSenha(e.target.value)}*/}
                            {/*/>*/}

                            {/*<Input label="Confirmar Senha" tipoInp="password"*/}
                            {/*       value={confirmarSenha}*/}
                            {/*       funcao={(e)=>setConfirmarSenha(e.target.value)}*/}
                            {/*/>*/}
                            <div className={"w-75 m-auto d-flex justify-content-between " + css.senha}>
                                <Input minLength={8} maxLength={20} htmlFor={'senha'} label={'Senha'} tipoInp={'password'}
                                       placeholder={'Digite sua senha'} classe={'metade'} value={senha} funcao={(f) => setSenha(f.target.value)} required={false}/>
                                <Input minLength={8} maxLength={20} htmlFor={'confirmarSenha'} label={'Confirme sua senha'} tipoInp={'password'}
                                       placeholder={'Digite a senha digitada anteriormente'} classe={'metade'} value={confirmarSenha} funcao={(f) => setConfirmarSenha(f.target.value)} required={false}/>
                            </div>

                            <Input
                                obrigatorio={"Sim"}
                                htmlFor={'tipoOng'}
                                label={'Selecione o tipo de ONG'}
                                tipoInp={'select'}
                                value={tipoOng}
                                opcoeslabel="Selecione o tipo da ONG"
                                opcoes={tiposOng}
                                funcao={(f) => setTipoOng(f.target.value)}
                            />

                            <Input obrigatorio={"Sim"} label="Causa da ONG" tipoInp="textarea"
                                   value={descricaoCausa}
                                   funcao={(e)=>setDescricaoCausa(e.target.value)}
                            />

                            <div className="text-center mt-3">
                                <strong>Dados Bancários</strong>
                                <p className={"px-3"}>Esses dados serão usados para enviar os valores para suas contas bancárias</p>
                            </div>

                            <Input obrigatorio={"Sim"} label="Cidade" tipoInp="text" value={cidadeOng} funcao={(e)=>setCidadeOng(e.target.value)} />

                            <Input obrigatorio={"Sim"} label="Banco" tipoInp="text" value={bacoOng} funcao={(e)=>setBacoOng(e.target.value)} />

                            <Input obrigatorio={"Sim"} label="Agência" tipoInp="text" value={agenciaOng} funcao={(e)=>setAgenciaOng(e.target.value)} />

                            <Input obrigatorio={"Sim"} label="Conta" tipoInp="text" value={contaOng} funcao={(e)=>setContaOng(e.target.value)} />

                            <Input obrigatorio={"Sim"} label="Chave Pix" tipoInp="text" value={chavePix} funcao={(e)=>setChavePix(e.target.value)} />

                            <div className={"w-75 m-auto mb-3 p-3 " + css.previewDiv}>
                                <div className="w-100 flex-column d-flex justify-content-center align-items-center mb-3">
                                    <label className="mb-3 fw-bold">Logo da ONG</label>

                                    <input
                                        ref={inputImagemRef}
                                        type="file"
                                        onChange={colocarImagem}
                                        className={css.botao}
                                    />

                                    {preview && (
                                        <div className={"d-flex flex-column gap-1"}>
                                            <img
                                                className={"mt-3 " + css.preview}
                                                src={preview}
                                                alt="Preview"
                                            />

                                            <Buton
                                                tipo="button"
                                                texto="Remover"
                                                background="vermelho"
                                                tamanho="pequeno"
                                                onClick={() => {
                                                    inputImagemRef.current.value = null;
                                                    setPreview(null);
                                                    setImagem(null);
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className={"w-100 flex-column d-flex justify-content-center align-items-center mb-2"}>
                                    <label className={"mb-3 fw-bold"}>Imagem do Banner</label>
                                    <input
                                        ref={inputBannerRef}
                                        type="file"
                                        onChange={colocarImagemBanner}
                                        className={css.botao}
                                    />
                                    {previewBanner && (
                                        <div className={"d-flex flex-column gap-1"}>
                                            <img className={'mt-3 ' + css.previewBanner}
                                                 src={previewBanner}
                                                 alt="Preview"
                                            />
                                            <Buton
                                                tipo="button"
                                                texto="Remover"
                                                background="vermelho"
                                                tamanho="pequeno"
                                                onClick={() => {
                                                    inputBannerRef.current.value = null;
                                                    setPreviewBanner(null);
                                                    setImagemBanner(null);
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={"d-flex flex-column align-items-center justify-content-center gap-2"}>
                                <Buton
                                    texto={'Salvar Alterações'}
                                    background={'laranja'}
                                    tamanho={'medio'}
                                    tipo={"submit"}
                                />
                                <Buton
                                    texto={'Cancelar'}
                                    background={'roxo'}
                                    tamanho={'pequeno'}
                                    onClick={() => {navigate(-1)}}
                                />
                            </div>

                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}