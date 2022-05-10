const { SNOWdenomination } = require("../utils");
const chai = require("chai");
const truffleAssert = require("truffle-assertions");
const ShelterNOW = artifacts.require("ShelterNOW");

const assert = chai.assert;

contract("ShelterNOW Contract Unit Test and Integration Test", (accounts) => {
  let snow;

  const account1 = accounts[0];
  const account2 = accounts[1];

  beforeEach(async () => {
    snow = await ShelterNOW.new();
  });

  describe("Testing normal ShelterNOW operations", () => {
    it("should transfer token and receive token correctly", async () => {
      const account1StartingBalance = await snow.balanceOf(account1);
      const account2StartingBalance = await snow.balanceOf(account2);
      const transferAmount = SNOWdenomination(100);

      const expectedAccount1FinalBalance =
        account1StartingBalance.sub(transferAmount);
      const expectedAccount2FinalBalance =
        account2StartingBalance.add(transferAmount);
      const result = await snow.transfer(account2, transferAmount, {
        from: account1,
      });
      const actualAccount1FinalBalance = await snow.balanceOf(account1);
      const actualAccount2FinalBalance = await snow.balanceOf(account2);

      truffleAssert.eventEmitted(result, "Transfer", (ev) => {
        return (
          ev.from == account1 &&
          ev.to == account2 &&
          ev.value.eq(transferAmount)
        );
      });

      assert.isTrue(
        expectedAccount1FinalBalance.eq(actualAccount1FinalBalance),
        "Balance of account 1 is incorrect after transfer"
      );
      assert.isTrue(
        expectedAccount2FinalBalance.eq(actualAccount2FinalBalance),
        "Balance of account 2 is incorrect after transfer"
      );
    });

    it("should correctly approve spending allowance to another account", async () => {
      const owner = account1;
      const spender = account2;
      const startingAllowance = await snow.allowance(owner, spender);
      const givenAllowance = SNOWdenomination(200);
      const expectedAllowance = SNOWdenomination(200);
      const result = await snow.approve(spender, givenAllowance, {
        from: owner,
      });
      const actualAllowance = await snow.allowance(owner, spender);

      truffleAssert.eventEmitted(result, "Approval", (ev) => {
        return (
          ev.owner == owner &&
          ev.spender == spender &&
          ev.value.eq(expectedAllowance)
        );
      });

      assert.isTrue(
        startingAllowance.eqn(0),
        "Starting allowance should be equal to 0"
      );
      assert.isTrue(
        expectedAllowance.eq(actualAllowance),
        "Expected allowance is not equal to the actual allowance"
      );
    });

    it("should transfer token and receive token correctly by approved spender", async () => {
      const owner = account1;
      const spender = account2;
      const account1StartingBalance = await snow.balanceOf(owner);
      const account2StartingBalance = await snow.balanceOf(spender);
      const transferAmount = SNOWdenomination(200);

      const expectedAccount1FinalBalance =
        account1StartingBalance.sub(transferAmount);
      const expectedAccount2FinalBalance =
        account2StartingBalance.add(transferAmount);

      await snow.approve(spender, transferAmount, { from: owner });
      const approvedAllowance = await snow.allowance(owner, spender);
      const expectedFinalAllowance = approvedAllowance.sub(transferAmount);
      const result = await snow.transferFrom(owner, spender, transferAmount, {
        from: spender,
      });
      const actualAccount1FinalBalance = await snow.balanceOf(owner);
      const actualAccount2FinalBalance = await snow.balanceOf(spender);
      const actualFinalAllowance = await snow.allowance(owner, spender);

      truffleAssert.eventEmitted(result, "Transfer", (ev) => {
        return (
          ev.from == account1 &&
          ev.to == account2 &&
          ev.value.eq(transferAmount)
        );
      });

      assert.isTrue(
        expectedAccount1FinalBalance.eq(actualAccount1FinalBalance),
        "Balance of account 1 is incorrect after transfer"
      );
      assert.isTrue(
        expectedAccount2FinalBalance.eq(actualAccount2FinalBalance),
        "Balance of account 2 is incorrect after transfer"
      );
      assert.isTrue(
        approvedAllowance.eq(transferAmount),
        "Allowance is not increased after approval"
      );
      assert.isTrue(
        actualFinalAllowance.eq(expectedFinalAllowance),
        "Final allowance is not spent by the transfer amount"
      );
    });
  });

  /** REVERT CHECKS **/
  describe("Revert checks for ShelterNOW Contract", () => {
    it("should revert on insufficient balance", async () => {
      const account2Balance = await snow.balanceOf(account2);
      truffleAssert.fails(
        snow.transfer(account1, account2Balance.addn(1), { from: account2 }),
        truffleAssert.ErrorType.REVERT,
        "transfer amount exceeds balance",
        "ShelterNOW transfer incorrectly passes with insufficient balance"
      );
    });

    it("should revert on insufficient allowance", async () => {
      const transferAmount = "15000000000000";
      truffleAssert.fails(
        snow.transferFrom(account1, account2, transferAmount, {
          from: account2,
        }),
        truffleAssert.ErrorType.REVERT,
        "insufficient allowance",
        "ShelterNOW transfer incorrectly passes with insufficient allowance"
      );
    });
  });
});
