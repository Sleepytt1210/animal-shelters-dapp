import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const colors = ["#FF0066", "#6897a7", "#00CC99", "#fecd59"];

export default function PetsStatsChart({ data, isIntake }) {
  const options = {
    animation: false,
    plugins: {
      tooltip: {
        mode: "index",
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: isIntake ? "Intake" : "Outcome",
        },
      },
    },
  };

  let typeIndex = 0;

  const chartData = data.reduce(
    (res, data) => {
      if (!res.labels.includes(data.date)) res.labels.push(data.date);
      const val = data.intake || data.outcome;
      const datasetIndex = res.datasets.findIndex((o) => o.label === data.type);
      let datasetData;
      if (datasetIndex < 0) {
        datasetData = {
          label: data.type,
          data: [],
          borderWidth: 2,
          borderColor: colors[typeIndex],
          backgroundColor: colors[typeIndex] + "80",
          fill: true,
          tension: 0.3,
        };
        datasetData.data.push(val);
        res.datasets.push(datasetData);
        typeIndex++;
      } else {
        datasetData = res.datasets[datasetIndex];
        datasetData.data.push(val);
        res.datasets[datasetIndex] = datasetData;
      }
      return res;
    },
    {
      labels: [],
      datasets: [],
    }
  );
  return <Line options={options} data={chartData} />;
}
