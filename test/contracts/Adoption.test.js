const { adoptionStateToNum, emptyAddress } = require("./utils");
const Web3 = require("web3");
const chai = require("chai");
const truffleAssert = require("truffle-assertions");
const BN = Web3.utils.BN;
const Adoption = artifacts.require("Adoption");
const ShelterNOW = artifacts.require("ShelterNOW");

const assert = chai.assert;

contract("Adoption Contract Unit Test", (accounts) => {
  let adoption;
  let snow;

  const account1 = accounts[0];
  const account2 = accounts[1];
  const petCount = 10;
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

  let adoptionFee;
  let expectedAdopter;
  let expectedAdoptionState;

  let firstResult;

  before(async () => {
    snow = await ShelterNOW.deployed();
    adoption = await Adoption.deployed();
    adoptionFee = await adoption.getAdoptionFee();

    // Initialise account 2 with some funds.
    snow.transfer(account2, adoptionFee * 10, { from: account1 });

    firstResult = await adoption.addPet(tokenURIs[0], adoptionStates[0], {
      from: account1,
    });

    // Initiliase pets.
    for (let i = 1; i < petCount; i++) {
      await adoption.addPet(tokenURIs[i], adoptionStates[i], {
        from: account1,
      });
    }
  });

  it("should add pet to the blockchain", async () => {
    const contractPetcount = (
      await adoption.totalSupply({ from: account1 })
    ).toNumber();
    assert.equal(contractPetcount, petCount, "Pet count is equal");
    truffleAssert.eventEmitted(firstResult, "AdoptionStatus", (ev) => {
      return (
        ev.adopter == account1 &&
        ev.petID.eqn(0) &&
        ev.status.eqn(adoptionStateToNum["ADDED"])
      );
    });
  });

  it("should successfully request for adoption of an adoptable pet", async () => {
    const petID = 2;
    expectedAdoptionState = adoptionStateToNum["LOCKED"];
    expectedAdopter = account2;
    await snow.approve(adoption.address, adoptionFee, { from: account2 });
    const result = await adoption.requestAdoption(petID, { from: account2 });
    const actualState = await adoption.getAdoptionState(petID);
    const actualAdopter = await adoption.getTempAdopterOf(petID);
    const depositPaid = await adoption.getAdopterDeposit(account2);

    truffleAssert.eventEmitted(result, "AdoptionStatus", (ev) => {
      return (
        ev.adopter == account2 &&
        ev.petID.eqn(petID) &&
        ev.status.eqn(adoptionStateToNum["LOCKED"])
      );
    });

    assert.equal(
      actualState.toNumber(),
      expectedAdoptionState,
      "Adoption state is equal"
    );
    assert.equal(actualAdopter, expectedAdopter, "Temporary adopter is equal");
    assert.isTrue(
      depositPaid.eq(adoptionFee),
      "Deposit paid should be equal to adoption fee"
    );
  });

  it("should successfully approve a pet in LOCKED adoption status with correct arguments", async () => {
    const petID = 2;
    expectedAdoptionState = adoptionStateToNum["LOCKED"];
    var actualState = await adoption.getAdoptionState(petID);

    assert.equal(
      actualState.toNumber(),
      expectedAdoptionState,
      "Adoption State should be LOCKED"
    );

    expectedAdoptionState = adoptionStateToNum["APPROVED"];
    const expectedApproval = account2;
    const result = await adoption.approveAdoption(account2, petID, {
      from: account1,
    });
    actualState = await adoption.getAdoptionState(petID);
    const actualApproval = await adoption.getApproved(petID);

    truffleAssert.eventEmitted(result, "AdoptionStatus", (ev) => {
      return (
        ev.adopter == account2 &&
        ev.petID.eqn(petID) &&
        ev.status.eqn(adoptionStateToNum["APPROVED"])
      );
    });

    assert.equal(
      actualState,
      expectedAdoptionState,
      "Adoption State should be APPROVED"
    );
    assert.equal(
      actualApproval,
      expectedApproval,
      "Account 2 should be approved for adoption"
    );
  });

  it("should successfully confirm adoption, transfer tip correctly and get deposit refunded", async () => {
    const petID = 2;
    const tipAmount = new BN(Web3.utils.toWei("1000", "gwei"));
    expectedAdoptionState = adoptionStateToNum["APPROVED"];
    var actualState = await adoption.getAdoptionState(petID);

    assert.equal(
      actualState.toNumber(),
      expectedAdoptionState,
      "Adoption State should be APPROVED"
    );

    const account1StartingSNOWBalance = await snow.balanceOf(account1);
    const account2StartingSNOWBalance = await snow.balanceOf(account2);

    expectedAdoptionState = adoptionStateToNum["ADOPTED"];
    const expectedDeposit = 0;
    const expectedApproval = emptyAddress;
    const expectedAccount1Balance = account1StartingSNOWBalance.add(tipAmount);
    const expectedAccount2Balance = account2StartingSNOWBalance
      .sub(tipAmount)
      .add(adoptionFee);

    await snow.approve(adoption.address, tipAmount, { from: account2 });
    const result = await adoption.confirmAdoption(petID, tipAmount, {
      from: account2,
    });
    actualState = await adoption.getAdoptionState(petID);
    const actualApproval = await adoption.getApproved(petID);
    const actualDepositFee = await adoption.getAdopterDeposit(account2);
    const actualAccount1FinalBalance = await snow.balanceOf(account1);
    const actualAccount2FinalBalance = await snow.balanceOf(account2);

    truffleAssert.eventEmitted(result, "AdoptionStatus", (ev) => {
      return (
        ev.adopter == account2 &&
        ev.petID.eqn(petID) &&
        ev.status.eqn(adoptionStateToNum["ADOPTED"])
      );
    });

    truffleAssert.eventEmitted(result, "TipsReceived", (ev) => {
      return (
        ev.adopter == account2 &&
        ev.owner == account1 &&
        ev.amount.eq(tipAmount)
      );
    });

    assert.equal(
      actualState,
      expectedAdoptionState,
      "Adoption State should be ADOPTED"
    );
    assert.equal(
      actualApproval,
      expectedApproval,
      "Approval of pet should be an empty address"
    );
    assert.isTrue(
      actualDepositFee.eqn(expectedDeposit),
      "Deposit should be fully cleared"
    );
    assert.isTrue(
      actualAccount1FinalBalance.eq(expectedAccount1Balance),
      "Final balance of account 1 should be increased by tip amount"
    );
    assert.isTrue(
      actualAccount2FinalBalance.eq(expectedAccount2Balance),
      "Final balance of account 2 should be increased by adoption fee and decreased by tip amount"
    );
  });

  it("should reject a requested adoption successfully and refund correct amount of penalty", async () => {
    const petID = 3;
    const penalty = adoptionFee.divn(2);

    await snow.approve(adoption.address, adoptionFee, { from: account2 });
    await adoption.requestAdoption(petID, { from: account2 });

    const account1StartingBalance = await snow.balanceOf(account1);
    const account2StartingBalance = await snow.balanceOf(account2);

    expectedAdoptionState = adoptionStateToNum["ADOPTABLE"];
    expectedAdopter = account1;
    const expectedAccount1Balance = account1StartingBalance.add(penalty);
    const expectedAccount2Balance = account2StartingBalance.add(penalty);

    const result = await adoption.rejectAdoption(account2, petID, {
      from: account1,
    });
    const actualState = await adoption.getAdoptionState(petID);
    const actualAdopter = await adoption.getTempAdopterOf(petID);
    const actualAccount1FinalBalance = await snow.balanceOf(account1);
    const actualAccount2FinalBalance = await snow.balanceOf(account2);

    truffleAssert.eventEmitted(result, "AdoptionStatus", (ev) => {
      return (
        ev.adopter == account2 &&
        ev.petID.eqn(petID) &&
        ev.status.eqn(adoptionStateToNum["REJECTED"])
      );
    });

    assert.equal(
      actualState.toNumber(),
      expectedAdoptionState,
      "Adoption Status should be ADOPTABLE"
    );
    assert.equal(
      actualAdopter,
      expectedAdopter,
      "Adopter should be the shelter owner"
    );
    assert.isTrue(
      expectedAccount1Balance.eq(actualAccount1FinalBalance),
      "Owner account balance after rejection is incorrect"
    );
    assert.isTrue(
      expectedAccount2Balance.eq(actualAccount2FinalBalance),
      "Adopter account balance after rejection is incorrect"
    );
  });

  it("should cancel an approved adoption successfully and refund correct amount of penalty", async () => {
    const petID = 4;
    const penalty = await adoption.getPenaltyRefundFee();
    const donation = adoptionFee.sub(penalty);

    await snow.approve(adoption.address, adoptionFee, { from: account2 });
    await adoption.requestAdoption(petID, { from: account2 });
    await adoption.approveAdoption(account2, petID, { from: account1 });

    const account1StartingBalance = await snow.balanceOf(account1);
    const account2StartingBalance = await snow.balanceOf(account2);

    expectedAdoptionState = adoptionStateToNum["ADOPTABLE"];
    expectedAdopter = account1;
    const expectedAccount1Balance = account1StartingBalance.add(donation);
    const expectedAccount2Balance = account2StartingBalance.add(penalty);

    const result = await adoption.cancelAdoption(petID, { from: account2 });
    const actualState = await adoption.getAdoptionState(petID);
    const actualAdopter = await adoption.getTempAdopterOf(petID);
    const actualAccount1FinalBalance = await snow.balanceOf(account1);
    const actualAccount2FinalBalance = await snow.balanceOf(account2);

    truffleAssert.eventEmitted(result, "AdoptionStatus", (ev) => {
      return (
        ev.adopter == account2 &&
        ev.petID.eqn(petID) &&
        ev.status.eqn(adoptionStateToNum["CANCELLED"])
      );
    });

    assert.equal(
      actualState.toNumber(),
      expectedAdoptionState,
      "Adoption Status should be ADOPTABLE"
    );
    assert.equal(
      actualAdopter,
      expectedAdopter,
      "Adopter should be the shelter owner"
    );
    assert.isTrue(
      expectedAccount1Balance.eq(actualAccount1FinalBalance),
      "Owner account balance after cancellation is incorrect"
    );
    assert.isTrue(
      expectedAccount2Balance.eq(actualAccount2FinalBalance),
      "Adopter account balance after cancellation is incorrect"
    );
  });

  const badPetIDs = [0, 1, 2];

  badPetIDs.forEach((petID) => {
    it("should reject a request on a non adoptable pet", async () => {
      const adoptionStatus = await adoption.getAdoptionState(petID);
      if (adoptionStatus.toNumber() == 1)
        this.skip("Skip because adoption status of this pet is ADOPTABLE");
      await truffleAssert.fails(
        adoption.requestAdoption(petID, { from: account2 }),
        truffleAssert.ErrorType.REVERT,
        "Not available for adoption",
        "Request adoption incorrectly passed with non adoptable pet"
      );
    });
  });
});
