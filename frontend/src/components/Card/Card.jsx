import css from './Card.module.css'

export default function Card({texto, img}) {
    return (
        <div style={{backgroundImage: `url(${img})`, backgroundSize: 'cover',}} className={"imgFundo " + css.card}>
            <div className={"d-flex align-items-center justify-content-center " + css.titulo}>
                <p>{texto}</p>
            </div>
        </div>
    )
}