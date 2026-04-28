import css from "./uploadImagem.module.css";

export default function UploadImagem({textoUpload, funcao, value}) {
    return (
        <div className={css.container}>
            <input type="file"  className={' ' + css.botao} placeholder={textoUpload} value={value} funcao={funcao}/>
            <img src="/public/uploadIcon.png" alt="Upload" className={css.iconeUpload}/>
            <img src="/public/fotoPerfil.png" alt="Ícone perfil" className={css.icone}/>
        </div>
    );
}