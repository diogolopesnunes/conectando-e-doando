import Form from "../components/Form/Form.jsx";
import Input from "../components/Input/Input.jsx";
import Buton from "../components/Buton/Buton.jsx"
import {useState} from "react";
import UploadImagem from "../components/uploadImagem/uploadImagem.jsx";

export default function PaginaCadastro() {

    const [selecionado, setSelecionado] = useState('doador')

    function alterar(e) {
        e.preventDefault()
        setSelecionado(e.target.value)
    }


    return (
        <div className="container">
            <div className="row">
                <div className="col">
                    <Form titulo={"Cadastro"}>
                        <Input htmlFor={'nome'} label={'Nome'} tipoInp={'text'} placeholder={'Digite seu nome'}/>
                        <Input htmlFor={'email'} label={'Email'} tipoInp={'email'} placeholder={'Digite seu email'}/>
                        <div className="w-75 m-auto d-flex justify-content-between">
                            <Input htmlFor={'senha'} label={'Senha'} tipoInp={'password'}
                                   placeholder={'Digite sua senha'} classe={'metade'}/>
                            <Input htmlFor={'confirmarSenha'} label={'Confirme sua senha'} tipoInp={'password'}
                                   placeholder={'Digite a senha digitada anteriormente'} classe={'metade'}/>
                        </div>
                        <div className="w-75 m-auto d-flex justify-content-between">
                            <Input tipoInp={'radio'} label={'Sou doador'} htmlFor={'user'} classe={'metade'}
                                   value={'doador'} funcao={alterar}/>
                            <Input tipoInp={'radio'} label={'Sou ONG'} htmlFor={'user'} classe={'metade'} value={'ong'}
                                   funcao={alterar}/>
                        </div>

                        {selecionado === "doador" ? (
                            <>
                                <Input htmlFor={'cpf'} label={'CPF'} tipoInp={'text'} placeholder={'Digite seu CPF'}/>
                                <Input htmlFor={'telefone'} label={'Telefone'} tipoInp={'tel'}
                                       placeholder={'Digite seu telefone'}/>
                                <div className="w-100 d-flex justify-content-center align-items-center">
                                    <UploadImagem textoUpload={'Fazer upload da imagem de perfil'}/>
                                </div>
                            </>
                        ) : (
                            <>
                                <Input htmlFor={'cnpj'} label={'CNPJ'} tipoInp={'text'}
                                       placeholder={'Digite seu CNPJ'}/>
                                <Input htmlFor={'tipoOng'} label={'Selecione o tipo de ONG'} tipoInp={'select'}/>
                                <Input htmlFor={'causaOng'} label={'Causa da ONG'} tipoInp={'textarea'}
                                       placeholder={'Digite a causa da ONG'}/>
                                <div className="w-100 d-flex justify-content-center align-items-center">
                                    <UploadImagem textoUpload={'Fazer upload da logo da ONG'}/>
                                </div>
                            </>
                        )}

                        <Buton texto={'Cadastrar'} background={'laranja'} tamanho={'medio'} rota={'/login'}/>
                    </Form>
                </div>
            </div>
        </div>
    )
}