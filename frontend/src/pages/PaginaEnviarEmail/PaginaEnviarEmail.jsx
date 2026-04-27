import Alerts from "../../components/Alerts/Alerts.jsx";
import Form from "../../components/Form/Form.jsx";
import Input from "../../components/Input/Input.jsx";
import Buton from "../../components/Buton/Buton.jsx";
import {Link} from "react-router-dom";


export default function PaginaEnviarEmail() {
    return (
        <div className="container m-auto formataAltura">
            <div className={'row'}>
                <div className="col align-self-center">

                    {/*{mensagem && (*/}
                    {/*    <Alerts*/}
                    {/*        key={mensagem.id}*/}
                    {/*        tipo={mensagem.tipo}*/}
                    {/*        imagem={`./public/${mensagem.tipo}.png`}*/}
                    {/*        duracao={10000}*/}
                    {/*        descricao={mensagem.texto}*/}
                    {/*    />*/}
                    {/*)}*/}

                    <Form largura="maior" titulo={'Motivo da reprova'}>

                        <Input
                            tipoInp={"text"}
                            label={"Assunto:"}
                            htmlFor={"assunto"}
                            placeholder={"Digite o Assunto"}
                        />

                        <Input
                            tipoInp={"textarea"}
                            label={"Mensagem:"}
                            htmlFor={"mensagem"}
                            placeholder={"Digite a mensagem"}

                        />

                        <div className="my-3">
                            <Buton texto={"Enviar"} tamanho={"medio"} background={"laranja"} tipo={'submit'} />
                        </div>

                    </Form>
                </div>
            </div>
        </div>
    )
}