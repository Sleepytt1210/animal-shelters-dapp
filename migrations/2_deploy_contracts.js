const ShelterNOW = artifacts.require("ShelterNOW");
const Adoption = artifacts.require("Adoption");
const Donation = artifacts.require("Donation");

const tokenURIs = [
  "https://ipfs.moralis.io:2053/ipfs/QmXSNWeHBHaP461RU9yfB7eN5uZ2ARbnnehtLFKu323ZWE",
  "https://ipfs.moralis.io:2053/ipfs/QmZz9VPUB4psEPiZ5DFZsMfwJbosf3GnEyU6ixDvVjWcuu",
  "https://ipfs.moralis.io:2053/ipfs/QmXQt98FfgttvxEGMhzWpCPsa6Cngdm7taqgE1UJUFogwa",
  "https://ipfs.moralis.io:2053/ipfs/QmaMgHRpcvxRemYxUAEqRjU7Y6La9d11jnWVoWFJPgcorb",
  "https://ipfs.moralis.io:2053/ipfs/QmaGhtpdF5J2czJSAyxam4TGBKMg6d5tymdFF1YUS3uHqY",
  "https://ipfs.moralis.io:2053/ipfs/QmVtwVrDBJcZTb8aQThgfeML29i1yvoZd8V6UPJgvpLUGq",
  "https://ipfs.moralis.io:2053/ipfs/QmZxmPmM6ojkt18Wn7JojoMumQhySMXosnsjoN3HdbfF8Z",
  "https://ipfs.moralis.io:2053/ipfs/QmdK1YK5EsV96rRD1e9X5Pn461fHyPQMxoxTsZzwTHerhH",
  "https://ipfs.moralis.io:2053/ipfs/QmNjoVvrYctmbKtPBUA61FeZXtJ4qL49eWy9JRas22hhwu",
  "https://ipfs.moralis.io:2053/ipfs/QmQPVJ4y87zhcaA7Ua2qakeZQ6jt136dnwpVk3PgyAG2in",
];
const adoptionStates = [0, 0, 1, 1, 1, 1, 1, 1, 1, 1];

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(ShelterNOW);
  const SNOW = await ShelterNOW.deployed();
  await deployer.deploy(Adoption, SNOW.address);
  const adoption = await Adoption.deployed();
  await deployer.deploy(Donation, SNOW.address);
  await Donation.deployed();

  if (network == "development" || network == "jest") {
    for (let i = 0; i < adoptionStates.length; i++) {
      console.log(`Adding pet ${i}, metadata: ${tokenURIs[i]}`);
      await adoption.addPet(tokenURIs[i], adoptionStates[i]);
    }

    console.log("Adding fund to account", accounts[1]);
    const initialFund = (1e15).toString();
    await SNOW.transfer(accounts[1], initialFund);
  }
};
