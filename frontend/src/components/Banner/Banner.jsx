// import css from './Banner.module.css';
// import Titulo from "../Titulo/Titulo.jsx";
// import Buton from "../Buton/Buton.jsx";
//
// export default function Banner({titulo}) {
//     return (
//         <div className={'px-4 py-2 d-flex flex-wrap align-items-center ' + css.banner}>
//             <div className={'px-sm-4 text-sm-start text-center'}>
//                 <Titulo texto={titulo} estilo={'banner'}/>
//             </div>
//             <div
//                 className={'px-4 py-2 d-flex gap-3 gap-sm-5 flex-wrap justify-content-sm-start justify-content-center'}>
//                 <Buton background={'laranja'} texto={'Conheça as Ongs'} tamanho={'medio'}/>
//                 <Buton rota={"/login"} background={'roxo'} texto={'Fazer doação'} tamanho={'medio'}/>
//             </div>
//         </div>
//     )
// }

import css from './Banner.module.css';
import Titulo from "../Titulo/Titulo.jsx";
import Buton from "../Buton/Buton.jsx";

export default function Banner({titulo}) {
    return (
        <div className={'px-4 py-2 d-flex flex-wrap align-items-center ' + css.banner}>
            <div className={'px-sm-4 text-sm-start text-center w-sm-75 w-100'}>
                <Titulo texto={titulo} estilo={'banner'}/>
            </div>
            <div className={'px-4 py-2 d-flex gap-3 gap-sm-5 flex-wrap justify-content-sm-start justify-content-center'}>
                <Buton background={'laranja'} texto={'Conheça as Ongs'} tamanho={'medio'}/>
                <Buton rota={"/login"} background={'roxo'} texto={'Fazer doação'} tamanho={'medio'}/>
            </div>
        </div>
    )
}