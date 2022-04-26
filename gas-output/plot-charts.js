const chart = require("./render-chart");
const { result } = require("./gas-report");

const { methods, deployments } = result;

const formatDataset = (contract, dataObject, isDeployment) => {
  const title =
    !contract && isDeployment
      ? "Gas Used for Smart Contract Deployments"
      : `Average Gas Used by Methods in ${contract}.sol`;
  const labels = dataObject.map((obj) =>
    isDeployment ? obj.name : obj.method
  );
  const data = dataObject.map((obj) => obj.Avg);
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
      label: "Gas Used",
      backgroundColor: colorMaps[data.length],
      borderWidth: 0,
      data: data,
    },
  ];
};

const methodsConfigs = Object.entries(methods).map((obj) => {
  const { title, labels, data } = formatDataset(obj[0], obj[1]);
  return chart.configuration(title, labels, datasetGen(data));
});

const deploymentsConfig = (() => {
  const { title, labels, data } = formatDataset(null, deployments, true);
  return chart.configuration(title, labels, datasetGen(data));
})();

const allConfigs = [deploymentsConfig, ...methodsConfigs];

(async function () {
  for (const config of allConfigs) {
    await chart.render(config);
  }
})();
