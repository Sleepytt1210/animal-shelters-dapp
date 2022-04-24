const { adoptionStateToNum } = require("./utils");
const Adoption = artifacts.require("Adoption");
const ShelterNOW = artifacts.require("ShelterNOW");

var assert = require("chai").assert;

contract("Adoption", (accounts) => {
  let adoption;
  let snow;

  let account1;
  let account2;

  let petCount;
  let adoptionFee;
  let expectedAdopter;
  let expectedAdoptionState;

  let tokenURIs = [
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
  let adoptionStates = [0, 0, 1, 1, 1, 1, 1, 1, 1, 1];

  before(async () => {
    account1 = accounts[0];
    account2 = accounts[1];
    petCount = 10;

    snow = await ShelterNOW.deployed();
    adoption = await Adoption.deployed();
    adoptionFee = await adoption.getAdoptionFee();

    // Initialise account 2 with some funds.
    snow.transfer(account2, adoptionFee * 10, { from: account1 });

    // Initiliase pets.
    for (let i = 0; i < petCount; i++) {
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
  });

  it("should successfully request for adoption of an adoptable pet", async () => {
    const petID = 2;
    expectedAdoptionState = adoptionStateToNum["LOCKED"];
    expectedAdopter = account2;
    await snow.approve(adoption.address, adoptionFee, { from: account2 });
    await adoption.requestAdoption(petID, { from: account2 });
    const actualState = await adoption.getAdoptionState(petID);
    const actualAdopter = await adoption.getTempAdopterOf(petID);
    const depositPaid = await adoption.getAdopterDeposit(account2);

    assert.equal(
      actualState.toNumber(),
      expectedAdoptionState,
      "Adoption state is equal"
    );
    assert.equal(actualAdopter, expectedAdopter, "Temporary adopter is equal");
    assert.equal(
      depositPaid.toNumber(),
      adoptionFee.toNumber(),
      "Deposit paid is equal to adoption fee"
    );
  });

  it("should successfully approve a pet in LOCKED adoption status with correct arguments", async () => {
    const petID = 2;
    expectedAdoptionState = adoptionStateToNum["LOCKED"];
    var actualState = await adoption.getAdoptionState(petID);

    assert.equal(
      actualState.toNumber(),
      expectedAdoptionState,
      "Adoption State is LOCKED"
    );

    expectedAdoptionState = adoptionStateToNum["APPROVED"];
    const expectedApproval = account2;
    await adoption.approveAdoption(account2, petID, { from: account1 });
    actualState = await adoption.getAdoptionState(petID);
    const actualApproval = await adoption.getApproved(petID);

    assert.equal(
      actualState,
      expectedAdoptionState,
      "Adoption State is APPROVED"
    );
    assert.equal(
      actualApproval,
      expectedApproval,
      "Account 2 is approved for adoption"
    );
  });
});
