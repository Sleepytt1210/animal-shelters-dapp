const { spawn } = require("child_process");
require("dotenv").config();

const run = () => {
  console.log("Starting local dev chain...");
  const isTest = process.argv.slice(2).includes("--test");
  const isJest = process.argv.slice(2).includes("--jest");
  const port = isTest ? 8545 : isJest ? 7646 : 7545;
  const mnemonic = isTest ? [] : ["-m", `"${process.env.GANACHE_MNEMONIC}"`];
  try {
    spawn("ganache-cli", ["-i", "1337", "--port", port].concat(mnemonic), {
      shell: true,
      stdio: "inherit",
    });
  } catch (e) {
    console.log(e);
  }
};

run();
