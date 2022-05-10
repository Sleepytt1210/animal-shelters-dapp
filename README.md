<img src="./src/snowy512.svg" width="200">

# The ShelterNOW DApp

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts
### Deployment
1. `npm run devchain` - To start the local commandline [ganache](https://github.com/trufflesuite/ganache) blockchain. Alternatively, [ganache-ui](https://github.com/trufflesuite/ganache-ui) can be used.
2. `truffle migrate` - To deploy the smart contracts onto the blockchain at default network.
3. `npm run start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### Smart Contract Testing
1. `npm run testchain`
2. `npm run truffle:test` - To run all the smart contract tests normally.
3. `npm run truffle:test-log` - To generate a mochawesome html report after tests.
4. `npm run truffle:test-gas` - To generate a gas consumption report for each smart contract.

### Gas Analysis
To generate gas usage report of each smart contract, the **eth-gas-reporter** package is used. The gas used are based on the smart conract tests and the raw report is output as [gasReporterOutput.json](gasReporterOutput.json) at the root directory.

Generate formatted gas report: *[ETH Example](./gas-output/formatted-gas-output-token-ETH.json)*.
```
npm run gasreport
```

Plot graphs base on gas reports
```
npm run plotgas --token [ETH|BNB|MATIC|-a] --cost --grouped
```
### Front-end Testing
`npm run test`

Launches the jest test runner in the interactive watch mode. Then, jest report can be found [here](jest-report/jest-report.html).

### Build App
`npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### Advanced Configuration
The following configurations should be added to the [.env](.env) file.
```properties
# MORALIS VARIABLES
## Development server configuration
REACT_APP_MORALIS_APPLICATION_ID=""
REACT_APP_MORALIS_SERVER_URL=""
REACT_APP_MORALIS_MASTER_KEY=""

## Test server configuration
REACT_APP_MORALIS_TEST_APPLICATION_ID=""
REACT_APP_MORALIS_TEST_SERVER_URL=""
GANACHE_MNEMONIC="MNEMONIC_HERE"
COINMARKETCAP_API_KEY="coinmarketcap_api_for_gas_report"
```

### Connecting Local Ganache to Moralis
1.  Download [frpc](https://github.com/fatedier/frp/releases) to build a proxy connection.
2.  Replace the following content in "frpc.ini", based on your devchain. The configuration can be found in the **Devchain Proxy Server** tab of your moralis server dashboard.
3.  Run `frpc.exe -c frpc.ini` (Windows) or `./frpc -c frpc.ini` (Linux).
