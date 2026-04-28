import css from './Input.module.css'
import {IMaskInput} from "react-imask";
//
// // 1. Dicionário de máscaras (fora da função para performance)
// const MASKS = {
//     cpf: (v) => {
//         const n = v.replace(/\D/g, "");
//         if (n.length <= 3) return n;
//         if (n.length <= 6) return `${n.slice(0, 3)}.${n.slice(3)}`;
//         if (n.length <= 9) return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6)}`;
//         return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9, 11)}`;
//     },
//     cnpj: (v) => {
//         const n = v.replace(/\D/g, "");
//         if (n.length <= 2) return n;
//         if (n.length <= 5) return `${n.slice(0, 2)}.${n.slice(2)}`;
//         if (n.length <= 8) return `${n.slice(0, 2)}.${n.slice(2, 5)}.${n.slice(5)}`;
//         if (n.length <= 12) return `${n.slice(0, 2)}.${n.slice(2, 5)}.${n.slice(5, 8)}/${n.slice(8)}`;
//         return `${n.slice(0, 2)}.${n.slice(2, 5)}.${n.slice(5, 8)}/${n.slice(8, 12)}-${n.slice(12, 14)}`;
//     },
//     telefone: (v) => {
//
//         const n = v.replace(/\D/g, "");
//         if (n.length <= 2) return n.length > 0 ? `(${n}` : n;
//         if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
//         return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
//     }
// };

export default function Input({tipoInp, label, htmlFor, placeholder, classe = '', value, funcao, maxlength, checado, opcoeslabel, opcoes, disabled=false, minLength, mask, required=true}) {

    // 2. Lógica que transforma o valor puro em valor com máscara para a tela
    // const valorParaExibir = (mask && MASKS[mask]) ? MASKS[mask](String(value || "")) : value;

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
                <input type={tipoInp} placeholder={placeholder} id={htmlFor} name={htmlFor} className={"d-block w-100 rounded px-2 py-1 " + css.input} value={value} onChange={funcao} required={required}/>
            </div>
        )
    } else if (tipoInp == 'select') {
        return (
            <div className={"w-75 m-auto my-3"}>
                <label htmlFor={htmlFor}>{label}</label>
                <select id={htmlFor} onChange={funcao} className={"d-block w-100 rounded px-2 py-1 " + css.input} required value={value}>
                    <option value="" disabled>{opcoeslabel}</option>
                    {opcoes.map((opcao, i) => (
                        <option key={i} value={opcao}>{opcao}</option>
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

            {mask === "cnpj" ? (
                <IMaskInput
                    mask={"00.000.000-0000-00"}
                    placeholder={"Digite o CNPJ"}
                    onChange={funcao}
                    value={value}
                    className={"w-100 d-block rounded px-2 py-1 " + css.input}
                    id={htmlFor}
                    name={htmlFor}
                />
            ) : mask === "cpf" ? (
                <IMaskInput
                    mask={"000.000.000-00"}
                    placeholder={"Digite o Cpf"}
                    onChange={funcao}
                    value={value}
                    className={"w-100 d-block rounded px-2 py-1 " + css.input}
                    id={htmlFor}
                    name={htmlFor}
                />
                ) : mask === "telefone" ? (
                    <IMaskInput
                        mask={"(00) 00000-0000"}
                        placeholder={"Digite o telefone"}
                        onChange={funcao}
                        value={value}
                        className={"w-100 d-block rounded px-2 py-1 " + css.input}
                        id={htmlFor}
                        name={htmlFor}
                    />
                ) :(
                <input type={tipoInp} placeholder={placeholder} id={htmlFor} name={htmlFor}
                       className={"w-100 d-block rounded px-2 py-1 " + css.input}
                       value={value} // Usa o valor formatado aqui
                       onChange={funcao}
                       maxLength={maxlength}
                       minLength={minLength}
                       required
                       disabled={disabled}/>
            )}




        </div>
    )
}
