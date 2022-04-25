const Web3 = require("web3");

exports.adoptionStateToNum = {
  NOTAVAIL: 0,
  ADOPTABLE: 1,
  LOCKED: 2,
  APPROVED: 3,
  ADOPTED: 4,
  REJECTED: 5,
  CANCELLED: 6,
  ADDED: 7,
  REMOVED: 8,
  EUTHANISED: 9,
};

exports.tokenTypeToNum = {
  SNOW: 0,
  ETH: 1,
};

exports.emptyAddress = "0x0000000000000000000000000000000000000000";

exports.SNOWdenomination = (val) => {
  return Web3.utils.toBN(Web3.utils.toWei(val.toString(), "gwei"));
};
