import SectionHome from "../../components/SectionHome/SectionHome.jsx";
import Banner from "../../components/Banner/Banner.jsx";
import Card from "../../components/Card/Card.jsx";
import Titulo from "../../components/Titulo/Titulo.jsx";
import OngCausa from "../../components/Componentes Home/OngCausa/OngCausa.jsx";
import css from "./Home.module.css"
import {Link} from "react-router-dom";

export default function Home({quemSomos, ongs, doacoes}) {

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <Banner
                        titulo={"Conheça o Conectando & Doando, a plataforma que conecta você a ONGs confiáveis e transforma solidariedade em ação."}/>
                </div>
                <div className={"col-12" + " " + css.quemSomos} ref={quemSomos}>
                    <SectionHome alt={"Mão ao redor de um globo"} Titulo={"Quem Somos ?"}
                                 Texto={"O Conectando e Doando é uma plataforma que aproxima ONGs e doadores, facilitando a conexão entre quem precisa de apoio e quem deseja fazer a diferença."}
                                 imagem={"/public/imagemPrimeiraSection.png"} estilo={"Quem_Somos"}
                                 estilo2={"Quem_Somos_text"}/>
                </div>
                <div className="col-12 mb-4" ref={doacoes}>
                    <SectionHome Titulo={"Invista em causas que importam. \n" + "Doe e faça a diferença!"}
                                 Texto={"Conecte sua marca a causas que transformam vidas e construa parcerias estratégicas com ONGs comprometidas. Nossa solução aproxima empresas e projetos sociais, facilitando ações que geram valor para a sociedade e fortalecem sua responsabilidade social corporativa."}
                                 estilo={"Baner2"}/>
                </div>
                <div className="col-12 d-flex w-100 flex-column align-items-center mb-3" ref={ongs}>
                    <Titulo texto={'Qual impacto você quer gerar no mundo? '} estilo={'categorias'}/>
                    <div className="w-100 d-flex justify-content-around flex-wrap gap-sm-0 gap-3">
                        <Card texto={'Meio Ambiente'} img={'/public/ongAmbiente.png'}/>
                        <Card texto={'Educação'} img={'/public/ongCrianca.png'}/>
                        <Card texto={'Pessoas com Deficiência'} img={'/public/ongDeficiencia.png'}/>
                    </div>
                </div>
                <div className="col-12 mb-5">
                    <OngCausa/>
                </div>
            </div>
        </div>
    )
}