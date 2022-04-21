# The ShelterNOW DApp

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm run start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### Advanced Configuration

.env

### Connecting Local Ganache to Moralis
1.  Download [frpc](https://github.com/fatedier/frp/releases) to build a proxy connection.
2.  Replace the following content in "frpc.ini", based on your devchain. The configuration can be found in the **Devchain Proxy Server** tab of your moralis server dashboard.
3.  Run `frpc.exe -c frpc.ini` (Windows) or `./frpc -c frpc.ini` (Linux).

### Deployment

npm run start
