const ShelterNOW = artifacts.require("ShelterNOW");
const Adoption = artifacts.require("Adoption");
const Donation = artifacts.require("Donation");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(ShelterNOW);
  const SNOW = await ShelterNOW.deployed();
  await deployer.deploy(Adoption, SNOW.address);
  const adoption = await Adoption.deployed();
  await deployer.deploy(Donation, SNOW.address);
  const donation = await Donation.deployed();
};
