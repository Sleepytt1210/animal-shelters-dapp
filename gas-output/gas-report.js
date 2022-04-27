const fs = require("fs");
const path = require("path");

const output = process.argv.includes("--output");

const report = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../gasReporterOutput.json"), "utf8")
);

const subConfig = (({ token, ethPrice, gasPrice, currency, blockLimit }) => ({
  token,
  ethPrice: parseFloat(ethPrice),
  gasPrice,
  currency,
  blockLimit,
}))(report.config);
const result = {
  config: {
    ...subConfig,
  },
};

const calledMethods = Object.values(report.info.methods).filter(
  (o) => o.numberOfCalls > 0
);

const gasPrice = result.config.gasPrice;
const ethPrice = result.config.ethPrice;
const pricePerEthToPerGwei = (price) => {
  var res = 0;
  var decimal = 2;
  while (res == 0) {
    res = parseFloat(price / 1e9).toFixed(decimal);
    decimal++;
  }
  return res;
};

const deployments = report.info.deployments.map((deployment) => {
  return { name: deployment.name, gasData: deployment.gasData };
});

const calculatedMethods = calledMethods.map((method) => {
  const n = method.numberOfCalls;
  let max = method.gasData[0],
    min = method.gasData[0],
    sum = 0;
  method.gasData.map((gas) => {
    if (gas > max) max = gas;
    if (gas < min) min = gas;
    sum += gas;
  });
  const avg = sum / n;
  method["Avg"] = avg;
  method["Min"] = max == min ? "-" : min;
  method["Max"] = max == min ? "-" : max;
  method["avgPrice"] = pricePerEthToPerGwei(avg * gasPrice * ethPrice);
  return method;
});

const calculatedDeployments = deployments.map((deployment) => {
  const n = deployment.gasData.length;
  let max = deployment.gasData[0],
    min = deployment.gasData[0],
    sum = 0;
  deployment.gasData.map((gas) => {
    if (gas > max) max = gas;
    if (gas < min) min = gas;
    sum += gas;
  });
  const avg = sum / n;
  deployment["Avg"] = avg;
  deployment["Min"] = max == min ? "-" : min;
  deployment["Max"] = max == min ? "-" : max;
  deployment["avgPrice"] = pricePerEthToPerGwei(avg * gasPrice * ethPrice);
  return deployment;
});

const groupedMethods = calculatedMethods.reduce((res, obj) => {
  const contractName = obj["contract"];
  const groupArray = res[contractName] ? res[contractName] : [];
  groupArray.push(obj);
  return Object.assign(res, { [contractName]: groupArray });
}, {});

result.methods = groupedMethods;
result.deployments = calculatedDeployments;

if (output) {
  fs.writeFileSync(
    path.join(
      __dirname,
      `./formatted-gas-output-token-${result.config.token}.json`
    ),
    JSON.stringify(result),
    "utf8"
  );
}
exports.result = result;
