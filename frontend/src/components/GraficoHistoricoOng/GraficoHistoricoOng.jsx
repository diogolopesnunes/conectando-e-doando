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
        seriesType: "bars",
        vAxes: {
            0: {title: "Valor recebido (R$)",},
            1: {title: "Quantidade de doadores",},
        },
        hAxis: {
            title: "Meses",
            slantedText: true,
            slantedTextAngle: 45,
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
                color:"#730662",
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
        />
    );
}
