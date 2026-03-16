import Sectionhome from "../components/SectionHome/SectionHome.jsx";

export default function Home() {
    return (
        <div>
            <Sectionhome alt={"Mão ao redor de um globo"} Titulo={"Quem Somos ?"}
                         Texto={"O Conectando e Doando é uma plataforma que aproxima ONGs e doadores, facilitando a conexão entre quem precisa de apoio e quem deseja fazer a diferença."}
                         imagem={"./public/img/Mundo_Mão.png"} estilo={"Quem_Somos"} />
        </div>
    )
}