import css from "./uploadImagem.module.css";

export default function UploadImagem({textoUpload}) {
    return (
        <div className={css.container}>
            <button className={'p-2 ' + css.botao}>
                <img src="/public/upload.png" alt="Upload" className={css.iconeUpload}/>
                <span className={css.texto}>{textoUpload}</span>
            </button>

            <img src="/public/fotoPerfil.png" alt="Ícone perfil" className={css.icone}/>
        </div>
    );
}