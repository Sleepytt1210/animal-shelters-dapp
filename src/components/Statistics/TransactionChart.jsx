import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import mockDonation from "../../utils/mockDonation";
import { tokenEnum } from "../../utils/util";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const data = mockDonation.reduce(
  (res, data) => {
    if (!res.labels.includes(data.date)) res.labels.push(data.date);
    const datasetIndex = res.datasets.findIndex((o) => o.label === data.txType);
    let datasetData;
    if (datasetIndex < 0) {
      datasetData = {
        label: data.txType,
        data: [],
        borderColor: tokenEnum[data.txType]
          ? "rgb(255, 99, 132)"
          : "rgb(51, 162, 255)",
        backgroundColor: tokenEnum[data.txType]
          ? "rgba(255, 0, 102, 0.5)"
          : "rgba(51, 51, 255, 0.5)",
        borderWidth: 1.5,
      };
      datasetData.data.push(data.value);
      res.datasets.push(datasetData);
    } else {
      datasetData = res.datasets[datasetIndex];
      datasetData.data.push(data.value);
      res.datasets[datasetIndex] = datasetData;
    }
    return res;
  },
  {
    labels: [],
    datasets: [],
  }
);

const options = {
  plugins: {
    title: {
      display: true,
      text: "History Amount of Donation in USD",
    },
  },
  animation: false,
  scales: {
    x: {
      stacked: true,
      title: {
        text: "Year",
      },
    },
    y: {
      stacked: true,
      title: {
        text: "Amount (USD)",
      },
    },
  },
};

const TransactionChart = () => {
  return <div>{<Bar options={options} data={data} />}</div>;
};
export default TransactionChart;
