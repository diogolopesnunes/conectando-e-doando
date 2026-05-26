import { Chart } from "react-google-charts";

export default function GraficoHistoricoOng({dados}) {
    const valores = dados.map((dado) => [
        dado.mes,
        dado.valor_doacao_ano_passado,
        dado.valor_doacao_ano,
        dado.quantidade_de_doadores_ano_passado,
        dado.quantidade_de_doadores_ano,
    ]);

    const data = [
        [
            "Mês",
            "Doações no ano passado",
            "Doações deste ano",
            "Doadores do ano passado",
            "Doadores deste ano",
        ],
        ...valores
    ];

    const options = {
        title: "Doações e Doadores por Mês neste Ano e Ano Passado",
        vAxes: {
            0: {title: "Valor recebido (R$)",},
            1: {title: "Quantidade de doadores",},
        },
        hAxis: {
            title: "Meses",
            slantedText: true,
            slantedTextAngle: 45,
        },
        seriesType: "bars",
        series: {
            0: {
                type: "bars",
                targetAxisIndex: 0,
                color: "#FF9900",
            },
            1: {
                type: "bars",
                targetAxisIndex: 0,
                color: "#1E88E5",
            },
            2: {
                type: "line",
                targetAxisIndex: 1,
                color: "#FF9900",
                lineWidth: 3,
                pointSize: 5,
            },
            3: {
                type: "line",
                targetAxisIndex: 1,
                color: "#1E88E5",
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
        />
    );
}
