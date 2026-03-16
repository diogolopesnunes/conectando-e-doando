import css from './Card.module.css'

export default function Card({texto, img, alt}){
    return (
        <div className={"card " + css.cardc} >
            <div className={css.titulo} >
                <p>{texto}</p>
                <img src={img} alt={alt}/>
            </div>

        </div>
    )
}