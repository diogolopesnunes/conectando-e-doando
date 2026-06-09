import { Chart } from "react-google-charts";

export default function GraficoEstatisticasAdm({ dados }) {

    const valores = dados.map((dado) => [
        dado.mes,

        dado.valor_doacao_ano_passado || 0,
        dado.valor_doacao_ano || 0,

        dado.quantidade_doacoes_ano_passado || 0,
        dado.quantidade_doacoes_ano || 0,
    ]);

    const formatarTooltip = (mes, titulo, valor) =>
        `${mes}
    ${titulo}: R$ ${valor.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const formatarReal = (valor) =>
        `R$ ${valor.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const data = [
        [
            "Mês",

            "Valor Ano Passado",
            { type: "string", role: "tooltip" },

            "Valor Ano Atual",
            { type: "string", role: "tooltip" },

            "Doações Ano Passado",
            "Doações Ano Atual",
        ],

        ...dados.map((dado) => [
            dado.mes,

            dado.valor_doacao_ano_passado || 0,
            formatarTooltip(
                dado.mes,
                "Valor Ano Passado",
                dado.valor_doacao_ano_passado || 0
            ),

            dado.valor_doacao_ano || 0,
            formatarTooltip(
                dado.mes,
                "Valor Ano Atual",
                dado.valor_doacao_ano || 0
            ),

            dado.quantidade_doacoes_ano_passado || 0,
            dado.quantidade_doacoes_ano || 0,
        ]),
    ];

    const options = {

        title: "Comparativo de Doações",

        seriesType: "bars",

        legend: {
            position: "bottom"
        },

        hAxis: {
            title: "Meses",
            slantedText: true,
            slantedTextAngle: 45,
        },

        vAxes: {

            0: {
                title: "Valor arrecadado (R$)"
            },

            1: {
                title: "Quantidade de doações"
            }
        },

        series: {

            0: {
                type: "bars",
                targetAxisIndex: 0,
                color: "#850038",
            },

            1: {
                type: "bars",
                targetAxisIndex: 0,
                color: "#730662",
            },

            2: {
                type: "line",
                targetAxisIndex: 1,
                color: "#E03E36",
                lineWidth: 3,
                pointSize: 5,
            },

            3: {
                type: "line",
                targetAxisIndex: 1,
                color: "#F1731F",
                lineWidth: 3,
                pointSize: 5,
            },
        },
    };

    return (
        <Chart
            chartType="ComboChart"
            width="100%"
            height="500px"
            data={data}
            options={options}
            language="pt-BR"
            chartLanguage="pt-BR"
        />
    );
}