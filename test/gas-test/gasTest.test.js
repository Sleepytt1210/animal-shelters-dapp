const { SNOWdenomination } = require("../utils");

const Adoption = artifacts.require("Adoption");
const ShelterNOW = artifacts.require("ShelterNOW");
const Donation = artifacts.require("Donation");

contract("Adoption Contract Gas Test", (accounts) => {
  let snow;
  let adoption;
  let adoptionFee;

  const iteration = 10;
  const [, account2, , , , , , , ,] = accounts;
  beforeEach(async () => {
    snow = await ShelterNOW.new();
    adoption = await Adoption.new(snow.address);
    adoptionFee = await adoption.getAdoptionFee();
  });

  describe("Adoption.addPet", () => {
    it(`Add Pets ${iteration} Times`, async () => {
      for (let i = 0; i < iteration; i++) {
        await adoption.addPet("http://www.example.com", i & 1);
      }
    });
  });

  describe("Adoption.requestAdoption", () => {
    beforeEach(async () => {
      for (let i = 0; i < iteration; i++) {
        await adoption.addPet("http://www.example.com", 1);
      }
      await snow.transfer(account2, SNOWdenomination(String(1e7)));
      await snow.approve(
        adoption.address,
        SNOWdenomination(adoptionFee * iteration),
        { from: account2 }
      );
    });

    it(`Request Pets ${iteration} Times`, async () => {
      for (let i = 0; i < iteration; i++) {
        await adoption.requestAdoption(i, { from: account2 });
      }
    });
  });

  describe("Adoption.approveAdoption", () => {
    beforeEach(async () => {
      for (let i = 0; i < iteration; i++) {
        await adoption.addPet("http://www.example.com", 1);
      }
      await snow.transfer(account2, SNOWdenomination(String(1e7)));
      await snow.approve(
        adoption.address,
        SNOWdenomination(adoptionFee * iteration),
        { from: account2 }
      );
      for (let i = 0; i < iteration; i++) {
        await adoption.requestAdoption(i, { from: account2 });
      }
    });

    it(`Approve Pets ${iteration} Times`, async () => {
      for (let i = 0; i < iteration; i++) {
        await adoption.approveAdoption(account2, i);
      }
    });
  });

  describe("Adoption.rejectAdoption", () => {
    beforeEach(async () => {
      for (let i = 0; i < iteration; i++) {
        await adoption.addPet("http://www.example.com", 1);
      }
      await snow.transfer(account2, SNOWdenomination(String(1e7)));
      await snow.approve(
        adoption.address,
        SNOWdenomination(adoptionFee * iteration),
        { from: account2 }
      );
      for (let i = 0; i < iteration; i++) {
        await adoption.requestAdoption(i, { from: account2 });
      }
    });

    it(`Approve Pets ${iteration} Times`, async () => {
      for (let i = 0; i < iteration; i++) {
        await adoption.rejectAdoption(account2, i);
      }
    });
  });

  describe("Adoption.confirmAdoption", () => {
    beforeEach(async () => {
      for (let i = 0; i < iteration; i++) {
        await adoption.addPet("http://www.example.com", 1);
      }
      await snow.transfer(account2, SNOWdenomination(String(1e7)));
      await snow.approve(
        adoption.address,
        SNOWdenomination(adoptionFee * iteration),
        { from: account2 }
      );
      for (let i = 0; i < iteration; i++) {
        await adoption.requestAdoption(i, { from: account2 });
        await adoption.approveAdoption(account2, i);
      }
    });

    it(`Confirm Adoption ${iteration} Times`, async () => {
      for (let i = 0; i < iteration; i++) {
        await adoption.confirmAdoption(i, 0, { from: account2 });
      }
    });
  });

  describe("Adoption.cancelAdoption", () => {
    beforeEach(async () => {
      for (let i = 0; i < iteration; i++) {
        await adoption.addPet("http://www.example.com", 1);
      }
      await snow.transfer(account2, SNOWdenomination(String(1e7)));
      await snow.approve(
        adoption.address,
        SNOWdenomination(adoptionFee * iteration),
        { from: account2 }
      );
      for (let i = 0; i < iteration; i++) {
        await adoption.requestAdoption(i, { from: account2 });
        await adoption.approveAdoption(account2, i);
      }
    });

    it(`Cancel Adoption ${iteration} Times`, async () => {
      for (let i = 0; i < iteration; i++) {
        await adoption.cancelAdoption(i, { from: account2 });
      }
    });
  });
});

contract("Adoption Contract Gas Test", (accounts) => {
  let snow;
  let donation;

  const iteration = 10;
  const [account1, account2, , , , , , , ,] = accounts;
  beforeEach(async () => {
    snow = await ShelterNOW.new();
    donation = await Donation.new(snow.address);
    const acc2Bal = await snow.balanceOf(account2);

    // Initialise account 2 with some funds.
    const initialFund = (1e6).toString();

    if (acc2Bal.lten(0))
      await snow.transfer(account2, SNOWdenomination(initialFund), {
        from: account1,
      });
  });

  describe("Donation.donateETH", () => {
    it(`Donate ETH ${iteration} Times`, async () => {
      for (let i = 0; i < iteration; i++) {
        await donation.donateETH("Good luck", {
          from: account2,
          value: web3.utils.toWei("0.01", "ether"),
        });
      }
    });
  });

  describe("Donation.donateSNOW", () => {
    const amount = "10000";
    beforeEach(async () => {
      await snow.approve(
        donation.address,
        SNOWdenomination(amount) * iteration,
        {
          from: account2,
        }
      );
    });
    it(`Donate SNOW ${iteration} Times`, async () => {
      for (let i = 0; i < iteration; i++) {
        await donation.donateSNOW(SNOWdenomination(amount), "Good luck", {
          from: account2,
        });
      }
    });
  });
});

contract("ShelterNOW Contract Gas Test", (accounts) => {
  let snow;

  const iteration = 10;
  const [account1, account2, , , , , , , ,] = accounts;
  beforeEach(async () => {
    snow = await ShelterNOW.new();
  });

  describe("ShelterNOW.transfer", () => {
    it(`Transfer ${iteration} Times`, async () => {
      for (let i = 0; i < iteration; i++) {
        await snow.transfer(account2, SNOWdenomination("1000"), {
          from: account1,
        });
      }
    });
  });

  describe("ShelterNOW.approve", () => {
    it(`Approve ${iteration} Times`, async () => {
      for (let i = 0; i < iteration; i++) {
        await snow.approve(account2, SNOWdenomination("10000"), {
          from: account1,
        });
      }
    });
  });

  describe("ShelterNOW.transferFrom", () => {
    const amount = "10000";
    beforeEach(async () => {
      await snow.approve(account2, SNOWdenomination(amount) * iteration, {
        from: account1,
      });
    });

    it(`Transfer from ${iteration} Times`, async () => {
      for (let i = 0; i < iteration; i++) {
        await snow.transferFrom(account1, account2, SNOWdenomination(amount), {
          from: account2,
        });
      }
    });
  });
});
