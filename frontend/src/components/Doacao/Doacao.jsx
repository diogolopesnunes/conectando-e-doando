import css from './Doacao.module.css'
import {NumericFormat, PatternFormat} from "react-number-format";


export default function Doacao({ong, projeto, valor, data, tipoUsuario, nome, email, idOng, idDoador}){


    return(
        <div className={`row rounded shadow my-3 px-3 ${css.cardDoacao}`}>
            <div className={`${css.linha}`}></div>
            {tipoUsuario==1?(
                <>
                    <div className={'col-12 p-2'}>
                        <p className={'fw-bold'}>{projeto ? `Projeto: ${projeto}`: 'Geral'}</p>
                    </div>
                    <div className={'col-12 col-lg-6 p-2'}>
                        <p className={`fs-4 ${css.limite}`}>Nome: {nome}</p>
                    </div>
                    <div className={'col-12 col-lg-6 p-2'}>
                        <p className={`fs-4 fw-bold text-start text-lg-end ${css.limite}`}>Email: {email}</p>
                    </div>
                </>
            ):(
                projeto ? (
                    <>
                        <div className={'col-12 col-lg-6 p-2'}>
                            <p className={`fs-4 ${css.limite}`}>ONG: {ong}</p>
                        </div>
                        <div className={'col-12 col-lg-6 p-2'}>
                            <p className={`fs-4 fw-bold text-start text-lg-end ${css.limite}`}>Projeto: {projeto}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={'col-12 col-lg-6 p-2'}>
                            <p className={`fs-4 fw-bold ${css.limite}`}>ONG: {ong}</p>
                        </div>
                        <div className={'col-12 col-lg-6 p-2'}>
                            <p className={`fs-4 text-start text-lg-end ${css.limite}`}>Projeto: Nenhum</p>
                        </div>
                    </>
                )
            )}
            <div className={'col-12 col-sm-6 p-2'}>
                <NumericFormat
                    className={`fs-5 fs-sm-6 text-center text-sm-start ${css.textoMaior}`}
                    value={valor}
                    displayType="text"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={2}
                    fixedDecimalScale={true}
                />
            </div>
            <div className={'col-12 col-sm-6 p-2'}>
                <p className={`text-center text-sm-end fs-5 fs-sm-6 ${css.textoMaior}`}>{data}</p>
            </div>
        </div>
    )
}
