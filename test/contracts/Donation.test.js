const { SNOWdenomination, tokenTypeToNum } = require("../utils");
const Web3 = require("web3");
const chai = require("chai");
const truffleAssert = require("truffle-assertions");
const BN = Web3.utils.toBN;
const ShelterNOW = artifacts.require("ShelterNOW");
const Donation = artifacts.require("Donation");

const assert = chai.assert;

contract("Donation Contract Unit Test", (accounts) => {
  const account1 = accounts[0];
  const account2 = accounts[1];

  let snow;
  let donation;

  before(async () => {
    snow = await ShelterNOW.deployed();
    donation = await Donation.deployed();
    const initialFund = (10e6).toString();
    await snow.transfer(account2, SNOWdenomination(BN(initialFund)), {
      from: account1,
    });
  });

  it("Should donate correct amount of SNOW with correct message to the owner", async () => {
    const account1StartingBalance = await snow.balanceOf(account1);
    const account2StartingBalance = await snow.balanceOf(account2);
    const expectedTokenType = tokenTypeToNum["SNOW"];
    const startingTotalDonation = await donation.getTotalDonation(
      expectedTokenType
    );
    const startingPersonalDonation = await donation.getDonationOfDonor(
      account2,
      expectedTokenType
    );
    const donateAmount = SNOWdenomination(BN("50000"));
    const donateMessage = "Good luck for your work";

    const expectedAccount1FinalBalance =
      account1StartingBalance.add(donateAmount);
    const expectedAccount2FinalBalance =
      account2StartingBalance.sub(donateAmount);
    const expectedTotalDonation = startingTotalDonation.add(donateAmount);
    const expectedPersonalDonation = startingPersonalDonation.add(donateAmount);

    await snow.approve(donation.address, donateAmount, { from: account2 });
    const result = await donation.donateSNOW(donateAmount, donateMessage, {
      from: account2,
    });
    const actualAccount1FinalBalance = await snow.balanceOf(account1);
    const actualAccount2FinalBalance = await snow.balanceOf(account2);
    const actualPersonalDonation = await donation.getDonationOfDonor(
      account2,
      expectedTokenType
    );
    const actualTotalDonation = await donation.getTotalDonation(
      expectedTokenType
    );

    truffleAssert.eventEmitted(result, "Donate", (ev) => {
      return (
        ev.donor === account2 &&
        ev.tokenType.eqn(expectedTokenType) &&
        ev.amount.eq(donateAmount) &&
        ev.message === donateMessage
      );
    });

    assert.isTrue(
      expectedAccount1FinalBalance.eq(actualAccount1FinalBalance),
      "Actual final balance of account 1 is not equal to the expected value after donation"
    );

    assert.isTrue(
      expectedAccount2FinalBalance.eq(actualAccount2FinalBalance),
      "Actual final balance of account 2 is not equal to the expected value after donation"
    );

    assert.isTrue(
      expectedTotalDonation.eq(actualTotalDonation),
      "Total donation is not equal to starting donation adds the donated amount"
    );

    assert.isTrue(
      expectedPersonalDonation.eq(actualPersonalDonation),
      "Personal donation is not equal to the starting personal donation adds the donated amount"
    );
  });

  it("Should donate correct amount of ETH with correct message to the owner", async () => {
    const account1StartingBalance = BN(await web3.eth.getBalance(account1));
    const account2StartingBalance = BN(await web3.eth.getBalance(account2));
    const expectedTokenType = tokenTypeToNum["ETH"];
    const startingTotalDonation = await donation.getTotalDonation(
      expectedTokenType
    );
    const startingPersonalDonation = await donation.getDonationOfDonor(
      account2,
      expectedTokenType
    );
    const donateAmount = BN(Web3.utils.toWei("0.05", "ether"));
    const donateMessage = "Good luck for your work";

    const expectedAccount1FinalBalance =
      account1StartingBalance.add(donateAmount);
    var expectedAccount2FinalBalance =
      account2StartingBalance.sub(donateAmount);
    const expectedTotalDonation = startingTotalDonation.add(donateAmount);
    const expectedPersonalDonation = startingPersonalDonation.add(donateAmount);

    const result = await donation.donateETH(donateMessage, {
      from: account2,
      value: donateAmount,
    });
    const actualAccount1FinalBalance = BN(await web3.eth.getBalance(account1));
    const actualAccount2FinalBalance = BN(await web3.eth.getBalance(account2));
    const actualPersonalDonation = await donation.getDonationOfDonor(
      account2,
      expectedTokenType
    );
    const actualTotalDonation = await donation.getTotalDonation(
      expectedTokenType
    );

    const gasPrice = BN(result.receipt.effectiveGasPrice);
    const gasUsed = BN(result.receipt.gasUsed);
    const gasCost = gasPrice.mul(gasUsed);

    expectedAccount2FinalBalance.isub(gasCost);

    truffleAssert.eventEmitted(result, "Donate", (ev) => {
      return (
        ev.donor === account2 &&
        ev.tokenType.eqn(expectedTokenType) &&
        ev.amount.eq(donateAmount) &&
        ev.message === donateMessage
      );
    });

    assert.isTrue(
      expectedAccount1FinalBalance.eq(actualAccount1FinalBalance),
      "Actual final balance of account 1 is not equal to the expected value after donation"
    );

    assert.isTrue(
      expectedAccount2FinalBalance.eq(actualAccount2FinalBalance),
      "Actual final balance of account 2 is not equal to the expected value after donation"
    );

    assert.isTrue(
      expectedTotalDonation.eq(actualTotalDonation),
      "Total donation is not equal to starting donation adds the donated amount"
    );

    assert.isTrue(
      expectedPersonalDonation.eq(actualPersonalDonation),
      "Personal donation is not equal to the starting personal donation adds the donated amount"
    );
  });

  /** REVERTS CHECK **/

  it("should revert on 0 amount donation", async () => {
    const message = "Good luck";
    await truffleAssert.fails(
      donation.donateETH(message, { from: account2, value: "0" }),
      truffleAssert.ErrorType.REVERT,
      "cannot be zero",
      "ETH donation incorrectly passed with amount 0"
    );

    await truffleAssert.fails(
      donation.donateSNOW("0", message, { from: account2 }),
      truffleAssert.ErrorType.REVERT,
      "cannot be zero",
      "SNOW donation incorrectly passed with amount 0"
    );
  });

  it("should revert on insufficient allowance", async () => {
    const message = "Good luck";
    const donateAmount = SNOWdenomination(BN("50000"));

    await snow.approve(donation.address, donateAmount.subn(1));

    await truffleAssert.fails(
      donation.donateSNOW(donateAmount, message, { from: account2 }),
      truffleAssert.ErrorType.REVERT,
      "insufficient allowance",
      "SNOW donation incorrectly passed with insufficient allowance"
    );
  });
});
