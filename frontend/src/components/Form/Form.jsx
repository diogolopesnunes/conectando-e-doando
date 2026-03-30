import css from "./Form.module.css"

export default function Form({children, titulo, method, onSubmit}) {
    return (
        <form className={"w-75 bg-white m-auto my-5 rounded-5 py-4 " + css.borda} method={method} onSubmit={onSubmit}>
            <h1 className="text-center">{titulo}</h1>
            {children}
        </form>
    )
}