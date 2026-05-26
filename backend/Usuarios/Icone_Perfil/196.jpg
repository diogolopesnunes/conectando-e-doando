import React, { useEffect, useState } from 'react';
import css from './Footer.module.css';
import { Link } from "react-router-dom";
import Botao from "../Botao/Botao.jsx";

export default function Footer({ api }) {
    const api_url = api;

    const [empresa, setEmpresa] = useState({});

    async function buscar_info() {
        try {
            let resposta = await fetch(`${api_url}/buscar_info`, {
                method: 'GET',
                credentials: 'include'
            });

            let informacoes = await resposta.json();

            if (informacoes.empresa) {
                console.log(informacoes.empresa);
                setEmpresa(informacoes.empresa);
            }
        } catch (erro) {
            console.error("Erro na requisição:", erro);
        }
    }

    useEffect(() => {
        buscar_info();
    }, []);

    return (
        <footer className={`pt-5 pb-4 ${css.footerDoarBg}`}>
            <div className="container mt-4">
                <div className="row text-center text-md-start">

                    <div className={`col-md-6 mb-5 mb-md-0 pe-md-5 border-0 border-md-end ${css.borderCustomFaint}`}>

                        <div className={css.footerLogo}>
                            {empresa.nome} <span>{empresa.span_nome}</span>
                        </div>

                        <h4 className="mb-3 fw-bold">Sobre a {empresa.nome} {empresa.span_nome}</h4>

                        <p className={`mb-4 ${css.textoCinza}`} style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                            {empresa.descricao}
                        </p>

                        <p className={`d-none d-md-block mb-0 ${css.textoCinza}`} style={{ fontSize: '1.1rem' }}>
                            Compartilhe com seus amigos!
                        </p>
                    </div>

                    <div className="col-md-6 ps-md-5 d-flex flex-column align-items-center align-items-md-start">
                        <h4 className="mb-4 fw-bold">Explore</h4>

                        <div className="row w-100 text-start justify-content-center justify-content-md-start mb-4" style={{maxWidth: '350px'}}>
                            <div className="col-6 col-md-12">
                                <a href="#" className={`d-block mb-3 ${css.textoCinza}`} style={{fontSize: '1.1rem'}}>Home</a>
                                <a href="#" className={`d-block mb-3 ${css.textoCinza}`} style={{fontSize: '1.1rem'}}>Benefícios</a>
                                <a href="#" className={`d-block mb-3 ${css.textoCinza}`} style={{fontSize: '1.1rem'}}>Junte-se a Nós</a>
                            </div>

                            <div className="col-6 col-md-12">
                                <a href="/ongs" className={`d-block mb-3 ${css.textoCinza}`} style={{fontSize: '1.1rem'}}>ONGs</a>
                                <a href="/projetos" className={`d-block mb-3 ${css.textoCinza}`} style={{fontSize: '1.1rem'}}>Projetos</a>
                            </div>
                        </div>
                        <Link to="/feed">
                            <Botao pagina={"/feed"}
                                   texto={"Doar agora"}
                                   cor={"rosa"}
                            />
                        </Link>
                    </div>
                </div>

                <div className={`border-top mt-5 mb-4 ${css.borderCustomFaint}`}></div>

                <div className="row">
                    <div className="col-12 px-4 px-md-3 text-center text-md-start">
                        <p className={`mb-0 ${css.textoCinza}`} style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                            © 2026 Todos os direitos a Campanha {empresa.NOME} . Todos os direitos reservados.
                        </p>
                    </div>
                </div>

            </div>
        </footer>
    );
}
