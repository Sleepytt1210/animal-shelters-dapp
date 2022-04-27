const path = require("path");
require("dotenv").config();

const tokenArgIdx = process.argv.indexOf("--token");
const token = tokenArgIdx > 0 ? process.argv[tokenArgIdx + 1] : "ETH";
const priceApi = {
  ETH: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
  BNB: "https://api.bscscan.com/api?module=proxy&action=eth_gasPrice",
  MATIC: "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
  AVAX: "https://api.snowtrace.io/api?module=proxy&action=eth_gasPrice",
  HT: "https://api.hecoinfo.com/api?module=proxy&action=eth_gasPrice",
  MOVR: "https://api-moonriver.moonscan.io/api?module=proxy&action=eth_gasPrice",
};
/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

// const HDWalletProvider = require('@truffle/hdwallet-provider');
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 7545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
    test: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    timeout: 100000,
    reporter: "eth-gas-reporter",
    reporterOptions: {
      currency: "USD",
      token: token,
      gasPriceApi: priceApi[token],
      coinmarketcap: process.env.COINMARKETCAP_API_KEY,
      outputFile: `./gas-output/gas-output-${token}.txt`,
      noColors: true,
      excludeContracts: ["Migrations", "Pet"],
    },
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.11", // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        // optimizer: {
        //   enabled: false,
        //   runs: 200
        // },
        evmVersion: "byzantium",
      },
    },
  },

  plugins: ["truffle-contract-size"],
  contracts_build_directory: path.join(__dirname, "src/contracts"),
};
