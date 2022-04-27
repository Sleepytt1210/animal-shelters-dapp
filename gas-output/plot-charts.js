const chart = require("./render-chart");
const fs = require("fs");
const path = require("path");

let actualRes;
let token;
const tokens = ["ETH", "BNB", "MATIC"];
const sliced = process.argv.slice(2);
const inputIdx = sliced.indexOf("--token");
const isCost = sliced.includes("--cost");
if (inputIdx < 0 || !isCost) {
  const { result } = require("./gas-report");
  actualRes = result;
} else {
  token = sliced[inputIdx + 1];
  if (token == "-a") {
    actualRes = tokens.map((t) => {
      return JSON.parse(
        fs.readFileSync(
          path.resolve(__dirname, `formatted-gas-output-token-${t}.json`),
          "utf8"
        )
      );
    });
  } else {
    actualRes = [
      JSON.parse(
        fs.readFileSync(
          path.resolve(__dirname, `formatted-gas-output-token-${token}.json`),
          "utf8"
        )
      ),
    ];
  }
}

async function plot(res) {
  const { config, methods, deployments } = res;
  const scales = {
    y: {
      position: "left",
      ticks: {
        beginAtZero: true,
      },
      title: {
        display: true,
        text: isCost ? "Average Transaction Cost (USD)" : "Average Gas Used",
        font: {
          size: 14,
        },
      },
    },
  };
  const formatDataset = (contract, dataObject, isDeployment) => {
    const title =
      !contract && isDeployment
        ? isCost
          ? `Cost for Smart Contract Deployment, ${config.token} Price: ${config.ethPrice}, Gas Price: ${config.gasPrice}`
          : "Gas Used for Smart Contract Deployments"
        : isCost
        ? `Average Cost Per Method Transaction in ${contract}.sol, Token: ${config.token}`
        : `Average Gas Used by Methods in ${contract}.sol`;
    const labels = dataObject.map((obj) =>
      isDeployment ? obj.name : obj.method
    );
    const data = dataObject.map((obj) => (isCost ? obj.avgPrice : obj.Avg));
    return { title, labels, data };
  };

  const colorMaps = {
    2: ["#0071a5", "#ff1818"],
    3: ["#05469f", "#df3381", "#ff9400"],
    6: ["#003f5c", "#444e86", "#955196", "#dd5182", "#ff6e54", "#ffa600"],
  };

  const datasetGen = (data) => {
    return [
      {
        label: isCost ? `Cost ${config.currency}` : "Gas Used",
        backgroundColor: colorMaps[data.length],
        borderWidth: 0,
        data: data,
      },
    ];
  };

  const methodsConfigs = Object.entries(methods).map((obj) => {
    const { title, labels, data } = formatDataset(obj[0], obj[1]);
    return chart.configuration(title, labels, datasetGen(data), {
      scales: scales,
    });
  });

  const deploymentsConfig = (() => {
    const { title, labels, data } = formatDataset(null, deployments, true);
    return chart.configuration(title, labels, datasetGen(data), {
      scales: scales,
    });
  })();

  const allConfigs = [deploymentsConfig, ...methodsConfigs];

  for (const config of allConfigs) {
    await chart.render(config);
  }
}

actualRes.map(plot);
