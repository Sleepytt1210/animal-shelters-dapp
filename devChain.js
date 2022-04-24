const { spawn } = require("child_process");
require("dotenv").config();

const run = () => {
  console.log("Starting local dev chain...");
  console.log(process.env.GANACHE_MNEMONIC);
  try {
    spawn(
      `ganache-cli -i 1337 --port 7545 -m "${process.env.GANACHE_MNEMONIC}"`,
      {
        shell: true,
        stdio: "inherit",
      }
    );
  } catch (e) {
    console.log(e);
  }
};

run();
