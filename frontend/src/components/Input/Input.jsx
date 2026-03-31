import css from './Input.module.css'

export default function Input({tipoInp, label, htmlFor, placeholder, classe = '', value, funcao, checado, opcoeslabel, opcoes}) {

if (classe == 'metade') {
        if (tipoInp == 'radio') {
            return (
                <div className={"d-inline-block my-3 text-center " + css.metade}>
                    <input type={tipoInp} id={htmlFor} name={htmlFor} value={value} onChange={funcao} checked={checado} required/>
                    <label htmlFor={htmlFor} className='mx-2'>{label}</label>
                </div>
            )
        }
        return (
            <div className={"d-inline-block my-3 " + css.metade}>
                <label htmlFor={htmlFor}>{label}</label>
                <input type={tipoInp} placeholder={placeholder} id={htmlFor} name={htmlFor} className={"d-block w-100 rounded px-2 py-1 " + css.input} value={value} onChange={funcao} required/>
            </div>
        )
    } else if (tipoInp == 'select') {
        return (
            <div className={"w-75 m-auto my-3"}>
                <label htmlFor={htmlFor}>{label}</label>
                {/* <input type={tipoInp} placeholder={placeholder} id={htmlFor} name={htmlFor} className={"w-100 d-block rounded px-2 py-1 " + css.input}/> */}
                <select id={htmlFor} onChange={funcao} className={"d-block w-100 rounded px-2 py-1 " + css.input} required>
                    <option value="" disabled>
                        {opcoeslabel}
                    </option>

                    {opcoes.map((opcao, i) => (
                        <option key={i} value={opcao} selected={value === opcao}>
                            {opcao}
                        </option>
                    ))}
                </select>
            </div>
        )
        
    } else if (tipoInp == 'textarea') {
        return (
            <div className={"w-75 m-auto my-3"} >
                <label htmlFor={htmlFor}>{label}</label>
                <textarea id={htmlFor} name={htmlFor} value={value} onChange={funcao} placeholder={placeholder} className={"d-block w-100 rounded px-2 py-1 " + css.input} required/>
            </div>
        )
    }

    return (
        <div className={"w-75 m-auto my-3"} >
            <label htmlFor={htmlFor}>{label} </label>
            <input type={tipoInp} placeholder={placeholder} id={htmlFor} name={htmlFor}
                   className={"w-100 d-block rounded px-2 py-1 " + css.input} value={value} onChange={funcao} required/>
        </div>
    )
}