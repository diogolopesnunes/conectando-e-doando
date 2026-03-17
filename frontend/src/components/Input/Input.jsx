import css from './Input.module.css'

export default function Input({tipoInp, label, htmlFor, placeholder, classe = '', value, funcao}) {
    if (classe == 'metade') {
        if (tipoInp == 'radio') {
            return (
                <div className={"d-inline-block my-2 text-center " + css.metade}>
                    <input type={tipoInp} id={htmlFor} name={htmlFor} value={value} onChange={funcao} required/>
                    <label htmlFor={htmlFor} className='mx-2'>{label}</label>
                </div>
            )
        }
        return (
            <div className={"d-inline-block my-2 " + css.metade}>
                <label htmlFor={htmlFor}>{label}</label>
                <input type={tipoInp} placeholder={placeholder} id={htmlFor} name={htmlFor} className={"d-block w-100 rounded px-2 py-1 " + css.input} required/>
            </div>
        )
    } else if (tipoInp == 'select') {
        return (
            <div className={"w-75 m-auto my-2"}>
                <label htmlFor={htmlFor}>{label}</label>
                {/* <input type={tipoInp} placeholder={placeholder} id={htmlFor} name={htmlFor} className={"w-100 d-block rounded px-2 py-1 " + css.input}/> */}
                <select id={htmlFor} className={"d-block w-100 rounded px-2 py-1 " + css.input} required>
                    <option selected disabled>Selecione um tipo de ONG</option>
                    <option value="">Opição 1</option>
                    <option value="">Opição 1</option>
                    <option value="">Opição 1</option>
                    <option value="">Opição 1</option>
                </select>
            </div>
        )
        
    } else if (tipoInp == 'textarea') {
        return (
            <div className={"w-75 m-auto my-2"}>
                <label htmlFor={htmlFor}>{label}</label>
                <textarea id={htmlFor} name={htmlFor} value={value} placeholder={placeholder} className={"d-block w-100 rounded px-2 py-1 " + css.input} required/>
            </div>
        )
    }

    console.log(tipoInp)


    return (
        <div className={"w-75 m-auto my-2"}>
            <label htmlFor={htmlFor}>{label} </label>
            <input type={tipoInp} placeholder={placeholder} id={htmlFor} name={htmlFor}
                   className={"w-100 d-block rounded px-2 py-1 " + css.input} required/>
        </div>
    )
}