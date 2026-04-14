import Form from "../../components/Form/Form.jsx";
import Input from "../../components/Input/Input.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import { useState, useRef, useEffect } from "react";
import css from "./EdicaoONGs.module.css";
import Alerts from "../../components/Alerts/Alerts.jsx";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../../components/Nav/Nav.jsx";

export default function EditarOng({ api }) {

    const { id } = useParams();
    const navigate = useNavigate();
    const inputImagemRef = useRef();

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [cpfCnpj, setCpfCnpj] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [tipoOng, setTipoOng] = useState('');
    const [descricaoCausa, setDescricaoCausa] = useState('');

    const [cidadeOng, setCidadeOng] = useState('');
    const [bacoOng, setBacoOng] = useState('');
    const [agenciaOng, setAgenciaOng] = useState('');
    const [contaOng, setContaOng] = useState('');

    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        async function buscarOng() {
            let res = await fetch(`${api}/ongs/${id}`);
            res = await res.json();

            if (res) {
                setNome(res.nome);
                setEmail(res.email);
                setCpfCnpj(res.cpf_cnpj);
                setTipoOng(res.tipo_ong);
                setDescricaoCausa(res.descricao_causa);
                setCidadeOng(res.cidade_ong);
                setBacoOng(res.banco_ong);
                setAgenciaOng(res.agencia_ong);
                setContaOng(res.conta_ong);
                setPreview(res.imagem);
            }
        }

        buscarOng();
    }, [id]);

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

    async function editar(e) {
        e.preventDefault();

        if (senha && senha !== confirmarSenha) {
            setMensagem("As senhas não coincidem");
            setTipoMensagem("erro");
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

        if (senha) form.append("senha", senha);
        if (imagem) form.append("imagem", imagem);

        let res = await fetch(`${api}/ongs/${id}`, {
            method: "PUT",
            body: form
        });

        res = await res.json();

        if (res.sucesso) {
            setMensagem("ONG atualizada com sucesso!");
            setTipoMensagem("sucesso");
            setTimeout(() => navigate('/ongs'), 2000);
        } else {
            setMensagem("Erro ao atualizar ONG");
            setTipoMensagem("erro");
        }
    }

    return (
        <>
            <Nav />
            <div className="container m-auto">
                <div className="row">
                    <div className="col">

                        {mensagem && (
                            <Alerts
                                tipo={tipoMensagem}
                                imagem={`./public/${tipoMensagem}.png`}
                                duracao={'10000'}
                                descricao={mensagem}
                            />
                        )}

                        <Form largura="maior" titulo={"Edição da ONG"} onSubmit={editar}>

                            <Input label="Nome" tipoInp="text" value={nome} funcao={(e)=>setNome(e.target.value)} />

                            <Input label="Email" tipoInp="email" value={email} funcao={(e)=>setEmail(e.target.value)} />

                            <Input label="CNPJ" tipoInp="text"
                                   value={cpfCnpj}
                                   funcao={(e)=>setCpfCnpj(e.target.value.replace(/\D/g,"").slice(0,14))}
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
                                       placeholder={'Digite sua senha'} classe={'metade'} value={senha} funcao={(f) => setSenha(f.target.value)}/>
                                <Input minLength={8} maxLength={20} htmlFor={'confirmarSenha'} label={'Confirme sua senha'} tipoInp={'password'}
                                       placeholder={'Digite a senha digitada anteriormente'} classe={'metade'} value={confirmarSenha} funcao={(f) => setConfirmarSenha(f.target.value)}/>
                            </div>

                            <Input label="Tipo de ONG" tipoInp="select"
                                   value={tipoOng}
                                   opcoes={["Meio ambiente","Educação","Saúde"]}
                                   funcao={(e)=>setTipoOng(e.target.value)}
                            />

                            <Input label="Causa da ONG" tipoInp="textarea"
                                   value={descricaoCausa}
                                   funcao={(e)=>setDescricaoCausa(e.target.value)}
                            />

                            <div className="text-center mt-3">
                                <strong>Dados Bancários</strong>
                                <p>Esses dados serão usados para enviar os valores para suas contas bancárias</p>
                            </div>

                            <Input label="Cidade" tipoInp="text" value={cidadeOng} funcao={(e)=>setCidadeOng(e.target.value)} />

                            <Input label="Banco" tipoInp="text" value={bacoOng} funcao={(e)=>setBacoOng(e.target.value)} />

                            <Input label="Agência" tipoInp="text" value={agenciaOng} funcao={(e)=>setAgenciaOng(e.target.value)} />

                            <Input label="Conta" tipoInp="text" value={contaOng} funcao={(e)=>setContaOng(e.target.value)} />

                            <div className="w-100 flex-column d-flex justify-content-center align-items-center mb-4">
                                <label className="mb-3 fw-bold">Logo da ONG</label>

                                <input
                                    ref={inputImagemRef}
                                    type="file"
                                    onChange={colocarImagem}
                                    className={css.botao}
                                />

                                {preview && (
                                    <>
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
                                    </>
                                )}
                            </div>

                            <Buton
                                texto={'Salvar Alterações'}
                                background={'laranja'}
                                tamanho={'medio'}
                                tipo={"submit"}
                            />

                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}