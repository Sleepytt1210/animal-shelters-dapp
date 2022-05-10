const {
  adoptionStateToNum,
  emptyAddress,
  SNOWdenomination,
} = require("../utils");
const chai = require("chai");
const truffleAssert = require("truffle-assertions");
const Adoption = artifacts.require("Adoption");
const ShelterNOW = artifacts.require("ShelterNOW");

const assert = chai.assert;

contract("Adoption Contract Unit and Integration Test", (accounts) => {
  let adoption;
  let snow;

  const account1 = accounts[0];
  const account2 = accounts[1];
  const petCount = 2;
  const adoptionStates = [0, 1];
  const fakeURI = "https://www.example.com";

  let adoptionFee;
  let expectedAdopter;
  let expectedAdoptionState;

  // Redeploy contract for each test
  beforeEach(async () => {
    snow = await ShelterNOW.new();
    adoption = await Adoption.new(snow.address);
    adoptionFee = await adoption.getAdoptionFee();

    const acc2Bal = await snow.balanceOf(account2);

    // Initialise account 2 with some funds.
    const initialFund = (1e6).toString();

    if (acc2Bal.lten(0))
      await snow.transfer(account2, SNOWdenomination(initialFund), {
        from: account1,
      });
  });

  it(`should successfully add 2 pets to the blockchain`, async () => {
    const startingPetCount = await adoption.totalSupply();
    assert.isTrue(startingPetCount.eqn(0), "Starting pet count should be 0");

    const expectedPetCount = 2;

    const result1 = await adoption.addPet(fakeURI, adoptionStates[0], {
      from: account1,
    });
    const result2 = await adoption.addPet(fakeURI, adoptionStates[0], {
      from: account1,
    });

    const actualPetCount = await adoption.totalSupply();

    truffleAssert.eventEmitted(result1, "AdoptionStatus", (ev) => {
      return (
        ev.adopter == account1 &&
        ev.petID.eqn(0) &&
        ev.status.eqn(adoptionStateToNum["ADDED"])
      );
    });

    truffleAssert.eventEmitted(result2, "AdoptionStatus", (ev) => {
      return (
        ev.adopter == account1 &&
        ev.petID.eqn(1) &&
        ev.status.eqn(adoptionStateToNum["ADDED"])
      );
    });

    assert.isTrue(
      actualPetCount.eqn(expectedPetCount),
      "Actual pet count is incorrect after pets are added"
    );
  });

  describe("Testing normal adoption operations", () => {
    beforeEach(async () => {
      // Initiliase pets.
      for (let i = 0; i < petCount; i++) {
        await adoption.addPet(fakeURI, adoptionStates[i], {
          from: account1,
        });
      }
    });

    it("should successfully request for adoption of an adoptable pet", async () => {
      const petID = 1;
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
      assert.equal(
        actualAdopter,
        expectedAdopter,
        "Temporary adopter is equal"
      );
      assert.isTrue(
        depositPaid.eq(adoptionFee),
        "Deposit paid should be equal to adoption fee"
      );
    });

    // Testing for action on pets that are already requested for adoption
    describe("Testing pets in locked state", () => {
      const petID = 1;

      beforeEach(async () => {
        await snow.approve(adoption.address, adoptionFee, { from: account2 });
        await adoption.requestAdoption(petID, { from: account2 });
      });

      it("should successfully approve a pet in LOCKED adoption status with correct arguments", async () => {
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

      it("should reject a requested adoption successfully and refund correct amount of penalty", async () => {
        const penalty = adoptionFee.divn(2);

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
    });

    // Testing for actions on pet that is already approved for adoption.
    describe("Testing pets in approved state", () => {
      const petID = 1;

      beforeEach(async () => {
        await snow.approve(adoption.address, adoptionFee, { from: account2 });
        await adoption.requestAdoption(petID, { from: account2 });
        await adoption.approveAdoption(account2, petID);
      });

      it("should successfully confirm adoption, transfer tip correctly and get deposit refunded", async () => {
        const tipAmount = SNOWdenomination(1000);
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
        const expectedAccount1Balance =
          account1StartingSNOWBalance.add(tipAmount);
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

      it("should cancel an approved adoption successfully and refund correct amount of penalty", async () => {
        const penalty = await adoption.getPenaltyRefundFee();
        const donation = adoptionFee.sub(penalty);

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
    });

    // Testing for pet state manipulation method (Making a pet adoptable or remove a pet)
    describe("Adoption Status manipulation methods", () => {
      it("should successfully change an adoption state of a non-available pet to adoptable", async () => {
        const petID = 0;
        const originalState = await adoption.getAdoptionState(petID);
        const result = await adoption.setPetAdoptable(petID);
        const actualState = await adoption.getAdoptionState(petID);
        const expectedState = 1;

        truffleAssert.eventEmitted(result, "AdoptionStatus", (ev) => {
          return (
            ev.adopter == account1 &&
            ev.petID.eqn(petID) &&
            ev.status.eqn(adoptionStateToNum["ADOPTABLE"])
          );
        });

        assert.isTrue(
          originalState.eqn(0),
          "Original state should be NONAVAIL"
        );
        assert.isTrue(
          actualState.eqn(expectedState),
          "Expected state should ADOPTABLE"
        );
      });

      it("should successfully change an adoption state of an adoptable pet to non-adoptable (REMOVED)", async () => {
        const petID = 1;
        const reason = adoptionStateToNum["REMOVED"];
        const originalState = await adoption.getAdoptionState(petID);
        const result = await adoption.setPetNotAdoptable(petID, reason);
        const actualState = await adoption.getAdoptionState(petID);
        const expectedState = 0;

        truffleAssert.eventEmitted(result, "AdoptionStatus", (ev) => {
          return (
            ev.adopter == account1 &&
            ev.petID.eqn(petID) &&
            ev.status.eqn(reason)
          );
        });

        assert.isTrue(
          originalState.eqn(1),
          "Original state should be ADOPTABLE"
        );
        assert.isTrue(
          actualState.eqn(expectedState),
          "Expected state should NONAVAIL"
        );
      });

      it("should successfully change an adoption state of an adoptable pet to non-adoptable (EUTHANISED)", async () => {
        const petID = 1;
        const reason = adoptionStateToNum["EUTHANISED"];
        const originalState = await adoption.getAdoptionState(petID);
        const result = await adoption.setPetNotAdoptable(petID, reason);
        const actualState = await adoption.getAdoptionState(petID);
        const expectedState = 0;

        truffleAssert.eventEmitted(result, "AdoptionStatus", (ev) => {
          return (
            ev.adopter == account1 &&
            ev.petID.eqn(petID) &&
            ev.status.eqn(reason)
          );
        });

        assert.isTrue(
          originalState.eqn(1),
          "Original state should be ADOPTABLE"
        );
        assert.isTrue(
          actualState.eqn(expectedState),
          "Expected state should NONAVAIL"
        );
      });
    });
  });
});

/** REVERT CHECKS **/
contract("Revert checks for Adoption Contract", (accounts) => {
  let snow;
  let adoption;

  const revertPetCount = 5;
  const account1 = accounts[0];
  const account2 = accounts[1];
  const account3 = accounts[2];
  const petIDs = [...Array(revertPetCount).keys()];
  const fakeURI = "https://www.example.com";

  let adoptionFee;

  // Redeploy contract for revert test
  before(async () => {
    snow = await ShelterNOW.new();
    adoption = await Adoption.new(snow.address);
    adoptionFee = await adoption.getAdoptionFee();

    const acc2Bal = await snow.balanceOf(account2);

    // Initialise account 2 with some funds.
    const initialFund = (1e6).toString();

    if (acc2Bal.lten(0))
      await snow.transfer(account2, SNOWdenomination(initialFund), {
        from: account1,
      });
  });
  describe("Test reverts for add pet method", () => {
    const badNewStatuses = Object.keys(adoptionStateToNum).filter(
      (o) => adoptionStateToNum[o] > 1
    );

    badNewStatuses.forEach((badStatus) => {
      it(`should revert on adding pet with invalid new status ${badStatus}`, async () => {
        await truffleAssert.fails(
          adoption.addPet(fakeURI, adoptionStateToNum[badStatus]),
          truffleAssert.ErrorType.REVERT,
          "Adoption status must be either adoptable or not available",
          `Add pet transaction passes with invalid status ${badStatus}`
        );
      });
    });
  });

  describe("Reverts with pet ID", () => {
    // Setup such that pet states are [NONAVAIL, ADOPTABLE, LOCKED, APPROVED, CONFIRMED]
    before(async () => {
      for (let i = 0; i < revertPetCount; i++) {
        await adoption.addPet(fakeURI, i && 1);
      }
      await snow.approve(adoption.address, adoptionFee * 4, {
        from: account2,
      });
      for (let i = 2; i < 5; i++) {
        await adoption.requestAdoption(i, { from: account2 });
      }
      for (let i = 3; i < 5; i++) {
        await adoption.approveAdoption(account2, i, { from: account1 });
      }
      await adoption.confirmAdoption(4, 0, { from: account2 });
    });
    describe("Test reverts for request method", () => {
      // Pet ID Checks
      it("should revert on requesting nonexistent pet ID", async () => {
        await truffleAssert.fails(
          adoption.requestAdoption(revertPetCount, { from: account2 }),
          truffleAssert.ErrorType.REVERT,
          "ERC721: Query for nonexistent pet",
          "Request adoption incorrectly passed with nonexistent pet"
        );
      });

      // Pet Adoption Status Checks
      petIDs.forEach((petID) => {
        it(`should revert a request on a non adoptable pet, pet ID: ${petID}`, async function () {
          const adoptionStatus = await adoption.getAdoptionState(petID);
          if (!adoptionStatus.eqn(adoptionStateToNum["ADOPTABLE"])) {
            await truffleAssert.fails(
              adoption.requestAdoption(petID, { from: account2 }),
              truffleAssert.ErrorType.REVERT,
              "Not available for adoption",
              "Request adoption incorrectly passed with non adoptable pet"
            );
          } else {
            this.skip();
          }
        });
      });
    });

    describe("Test reverts for approve and reject methods", () => {
      const lockedPet = 2;

      // Pet ID Checks
      it("should revert on approving nonexistent pet ID", async () => {
        await truffleAssert.fails(
          adoption.approveAdoption(account2, revertPetCount, {
            from: account1,
          }),
          truffleAssert.ErrorType.REVERT,
          "ERC721: Query for nonexistent pet",
          "Request adoption incorrectly passed with nonexistent pet"
        );
      });

      it("should revert on rejecting nonexistent pet ID", async () => {
        await truffleAssert.fails(
          adoption.rejectAdoption(account2, revertPetCount, { from: account1 }),
          truffleAssert.ErrorType.REVERT,
          "ERC721: Query for nonexistent pet",
          "Request adoption incorrectly passed with nonexistent pet"
        );
      });

      // Pet Adoption Status Checks
      petIDs.forEach((petID) => {
        it(`should revert an approval on a non requested pet, pet ID: ${petID}`, async function () {
          const adoptionStatus = await adoption.getAdoptionState(petID);
          if (!adoptionStatus.eqn(adoptionStateToNum["LOCKED"])) {
            await truffleAssert.fails(
              adoption.approveAdoption(account2, petID, { from: account1 }),
              truffleAssert.ErrorType.REVERT,
              "Not requested for adoption yet!",
              "Approve adoption incorrectly passed with non requested pet"
            );
          } else {
            this.skip();
          }
        });

        it(`should revert a rejection on a non requested pet, pet ID: ${petID}`, async function () {
          const adoptionStatus = await adoption.getAdoptionState(petID);
          if (!adoptionStatus.eqn(adoptionStateToNum["LOCKED"])) {
            await truffleAssert.fails(
              adoption.rejectAdoption(account2, petID, { from: account1 }),
              truffleAssert.ErrorType.REVERT,
              "Not requested for adoption yet!",
              "Reject adoption incorrectly passed with non requested pet"
            );
          } else {
            this.skip();
          }
        });
      });

      // Pet Adopter Matcher Checks
      it("should revert on approving unmatched adopter and pet ID", async () => {
        await truffleAssert.fails(
          adoption.approveAdoption(account3, lockedPet, { from: account1 }),
          truffleAssert.ErrorType.REVERT,
          "Pet does not match adopter!",
          "Request adoption incorrectly passed with nonexistent pet"
        );
      });

      it("should revert on rejecting unmatched adopter and pet ID", async () => {
        await truffleAssert.fails(
          adoption.rejectAdoption(account3, lockedPet, { from: account1 }),
          truffleAssert.ErrorType.REVERT,
          "Pet does not match adopter!",
          "Request adoption incorrectly passed with nonexistent pet"
        );
      });
    });

    describe("Test reverts for confirm and cancel methods", () => {
      const approvedPet = 3;

      // Pet ID Checks
      it("should revert on confirming nonexistent pet ID", async () => {
        await truffleAssert.fails(
          adoption.confirmAdoption(revertPetCount, 0, { from: account2 }),
          truffleAssert.ErrorType.REVERT,
          "ERC721: Query for nonexistent pet",
          "Request adoption incorrectly passed with nonexistent pet"
        );
      });

      it("should revert on cancelling nonexistent pet ID", async () => {
        await truffleAssert.fails(
          adoption.cancelAdoption(revertPetCount, { from: account2 }),
          truffleAssert.ErrorType.REVERT,
          "ERC721: Query for nonexistent pet",
          "Request adoption incorrectly passed with nonexistent pet"
        );
      });

      // Pet Adoption Status Checks
      petIDs.forEach((petID) => {
        it(`should revert a confirmation on a non approved pet, pet ID: ${petID}`, async function () {
          const adoptionStatus = await adoption.getAdoptionState(petID);
          if (!adoptionStatus.eqn(adoptionStateToNum["APPROVED"])) {
            await truffleAssert.fails(
              adoption.confirmAdoption(petID, 0, { from: account2 }),
              truffleAssert.ErrorType.REVERT,
              "Not approved for adoption!",
              "Confirm adoption incorrectly passed with non approved pet"
            );
          } else {
            this.skip();
          }
        });

        it(`should revert an cancellation on a non approved pet, pet ID: ${petID}`, async function () {
          const adoptionStatus = await adoption.getAdoptionState(petID);
          if (!adoptionStatus.eqn(adoptionStateToNum["APPROVED"])) {
            await truffleAssert.fails(
              adoption.cancelAdoption(petID, { from: account2 }),
              truffleAssert.ErrorType.REVERT,
              "Not approved for adoption!",
              "Cancel adoption incorrectly passed with non approved pet"
            );
          } else {
            this.skip();
          }
        });

        // Pet Adopter Matcher Checks
        it("should revert on confirming unmatched adopter and pet ID", async () => {
          await truffleAssert.fails(
            adoption.confirmAdoption(approvedPet, 0, { from: account3 }),
            truffleAssert.ErrorType.REVERT,
            "Pet does not match adopter!",
            "Request adoption incorrectly passed with nonexistent pet"
          );
        });

        it("should revert on cancelling unmatched adopter and pet ID", async () => {
          await truffleAssert.fails(
            adoption.cancelAdoption(approvedPet, { from: account3 }),
            truffleAssert.ErrorType.REVERT,
            "Pet does not match adopter!",
            "Request adoption incorrectly passed with nonexistent pet"
          );
        });
      });
    });
  });
});
