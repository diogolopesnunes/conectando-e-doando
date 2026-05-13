export default function Comentario({comentario}){
    return (
        <div className={'border p-2 rounded'}>
            <div className={'d-flex justify-content-between'}>
                <p>{comentario.usuario}</p>
                <p>{comentario.data}</p>
            </div>
            <p>{comentario.mensagem}</p>
        </div>
    )
}