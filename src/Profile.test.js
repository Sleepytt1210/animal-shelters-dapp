import React from "react";
import { screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";
import { useMoralis, useMoralisQuery } from "./__mocks__/react-moralis";
import userEvent from "@testing-library/user-event";
import { tokenEnum, BN, SNOWDecimal, mockData } from "./utils/util";
import mockDonationEvents from "./utils/mockDonationEvents.json";
import mockAdoptionEvents from "./utils/mockAdoptionEvents.json";

const props = global.props;
const routedApp = global.routedApp;
describe("Profile component tests", () => {
  let debug_;
  let user;
  const _account = props.account;
  const _account2 = "0x10bC304C796f7EAfC1e7BaFdc1A79B89Fc1Aa55b";
  const statOption = {
    selector: "div.ant-statistic-title",
  };
  const _petsMetadata = props.petsMetadata;
  const ethBalance = "12345600000000000000";
  const snowBalance = BN(10000).mul(SNOWDecimal);
  const expectedSNOWBalance = "10,000";
  const expectedETHBalance = "12.3456";
  const fakeETH = BN("1000000000000000000");
  const fakeSNOW = BN(5000).mul(SNOWDecimal);
  const expectedSNOWDonated = "5,000";
  const expectedETHDonated = "1";
  const fakeDonations = {
    ETH: fakeETH,
    SNOW: fakeSNOW,
  };
  const testId = 3;
  const expectedTimestamp = 1651366800;
  const expectedDate = "01/05/2022";
  const mockFormData = {
    petID: testId,
    petName: _petsMetadata[testId].name,
    petType: _petsMetadata[testId].type,
    petBreed: _petsMetadata[testId].breed,
    adoptStatus: 2,
    txHash:
      "0x8e9eb1ece39ba106d9f54ee16625fbce68d51392c77b61483fbfc993d0079906",
    date: {
      iso: "2022-05-01T08:10:26+0000",
    },
    toJSON: () => mockFormData,
    ...mockData,
  };
  const expectedPet = _petsMetadata[testId];
  const expectedFormData = [
    mockFormData.txHash,
    expectedDate,
    mockFormData.petID,
    expectedPet.name,
    expectedPet.type,
    expectedPet.breed,
    _account2,
    mockFormData.fname,
    mockFormData.lname,
    mockFormData.age,
    mockFormData.email,
    mockFormData.phone,
    mockData.address.street1 + ", " + mockData.address.street2,
    mockData.address.code,
    mockData.address.city,
    mockData.houseType,
    mockData.hasFence ? "Yes" : "No",
    mockData.fenceHeight,
    mockData.hasOtherPets ? "Yes" : "No",
    mockData.numberOfPets || 0,
    mockData.friendliness || 0,
    mockData.petConfine,
    mockData.aloneHours,
    mockData.explanation,
    "Checked",
    "Checked",
  ];

  const mockSNOWBalanceOf = jest.fn(() => Promise.resolve(snowBalance));
  const mockGetBalance = jest.fn(() => Promise.resolve(ethBalance));
  const mockDonationOfDonor = jest.fn((account, token, { from: sender }) =>
    Promise.resolve(fakeDonations[tokenEnum[token]])
  );
  const mockDonationPastEvents = jest.fn(() =>
    Promise.resolve(mockDonationEvents)
  );
  const mockGetBlock = jest.fn((blockNumber) =>
    Promise.resolve({ timestamp: expectedTimestamp + blockNumber })
  );
  const mockApproveAdoption = jest.fn((adopter, petID) =>
    Promise.resolve({ tx: "0x12345" })
  );
  const mockGetAdoptionEvents = jest.fn(() =>
    Promise.resolve(mockAdoptionEvents)
  );
  const mockTotalSupply = jest.fn(() => {
    return Promise.resolve(34);
  });
  const useMoralisProp = {
    enableWeb3: jest.fn(() => Promise.resolve()),
    isAuthenticated: true,
    isWeb3Enabled: true,
    isWeb3Enabling: false,
    authenticate: jest.fn(() => Promise.resolve()),
    account: _account,
    chainId: 1337,
    user: {
      get: jest.fn(),
    },
    logout: jest.fn(),
    setUserData: jest.fn(),
  };

  const baseProp = {
    petsMetadata: _petsMetadata,
    web3: {
      eth: {
        getBalance: mockGetBalance,
        getBlock: mockGetBlock,
      },
    },
    contracts: {
      SNOW: {
        balanceOf: mockSNOWBalanceOf,
      },
      donation: {
        getPastEvents: mockDonationPastEvents,
        getDonationOfDonor: mockDonationOfDonor,
        getTotalDonation: jest.fn(() => Promise.resolve()),
      },
      adoption: {
        approveAdoption: mockApproveAdoption,
        getPastEvents: mockGetAdoptionEvents,
        totalSupply: mockTotalSupply,
      },
    },
  };

  beforeEach(async () => {
    user = userEvent.setup();
    BrowserRouter.mockImplementation(({ children }) => {
      return <div>{children}</div>;
    });
    useMoralis.mockImplementation(() => ({ ...useMoralisProp }));
  });

  test("Profile is locked when user is unauthenticated", async () => {
    useMoralis.mockImplementation(() => ({
      ...useMoralisProp,
      isAuthenticated: false,
      isWeb3Enabled: false,
      account: "",
    }));
    await act(async () => {
      const { debug } = await routedApp("/profile", {
        ...baseProp,
        account: "",
      });
      debug_ = debug;
    });

    const message = await screen.findByText(/Please connect/i);
    expect(message).toBeInTheDocument();
  });

  describe("Test the extra profile features of shelter owner", () => {
    beforeEach(async () => {
      useMoralis.mockImplementation(() => ({
        ...useMoralisProp,
        isAuthenticated: true,
        account: _account2,
        user: {
          get: jest.fn(() => "Dylon Wong"),
        },
      }));
      await act(async () => {
        const { debug } = await routedApp("/profile", {
          ...baseProp,
          account: _account2,
          owner: _account,
        });
        debug_ = debug;
      });
    });

    afterEach(() => jest.clearAllMocks());

    test("Profile renders with 3 tabs with authenticated normal user", async () => {
      const profileCard = (await screen.findByText(/profile/i)).parentElement
        .parentElement;
      expect(profileCard).toBeInTheDocument();
      const tabs = await screen.findAllByRole("tab");
      expect(tabs).toHaveLength(3);
      const [wallet, , ,] = tabs;
      expect(wallet.parentElement).toHaveClass("ant-tabs-tab-active");
    });

    test("Profile renders with correct wallet details with authenticated normal user", async () => {
      const SNOWBal = (await screen.findByText(/^SNOW Balance$/, statOption))
        .nextSibling;
      const ETHBal = screen.getByText(/^ETH Balance$/, statOption).nextSibling;
      const totalSNOW = screen.getByText(/^Total SNOW/, statOption).nextSibling;
      const totalETH = screen.getByText(/^Total ETH/, statOption).nextSibling;
      expect(SNOWBal).toHaveTextContent(expectedSNOWBalance);
      expect(ETHBal).toHaveTextContent(expectedETHBalance);

      expect(mockDonationOfDonor).toHaveBeenCalled();

      expect(totalSNOW).toHaveTextContent(expectedSNOWDonated);
      expect(totalETH).toHaveTextContent(expectedETHDonated);
    });

    test("Profile renders donation history correctly", async () => {
      const tabs = await screen.findAllByRole("tab");
      const [, donation] = tabs;
      await act(async () => await user.click(donation));
      const donationTable = await screen.findByTestId("donationTable");
      const data = [
        /0x335e3\.\.\.e94bc48/i,
        /ETH/i,
        "0.766",
        /Lovely works/i,
        expectedDate,
      ];
      const rows = donationTable.querySelectorAll("table > tbody > tr");
      expect(rows).toHaveLength(3);
      rows
        .item(0)
        .querySelectorAll("td")
        .forEach((td, idx) => {
          expect(td).toHaveTextContent(data[idx]);
        });
    });

    test("Profile renders adoption history correctly", async () => {
      const tabs = await screen.findAllByRole("tab");
      const [, , adoption] = tabs;
      await act(async () => await user.click(adoption));
      const adoptionTable = await screen.findByTestId("adoptionTable");
      const data = [
        [6, _petsMetadata[6].img, /approved/i, expectedDate, "ConfirmCancel"],
        [5, _petsMetadata[5].img, /cancel/i, expectedDate, /No Action/i],
        [4, _petsMetadata[4].img, /reject/i, expectedDate, /No Action/i],
        [2, _petsMetadata[2].img, /adopt/i, expectedDate, /No Action/i],
        [3, _petsMetadata[3].img, /pending/i, expectedDate, /No Action/i],
      ];
      const rows = adoptionTable.querySelectorAll("table > tbody > tr");
      expect(rows).toHaveLength(5);
      rows.forEach((tr, trid) => {
        const expectedRow = data[trid];
        const cells = tr.querySelectorAll("td");
        cells.forEach((cell, cid) => {
          if (cid != 1) expect(cell).toHaveTextContent(expectedRow[cid]);
          else
            expect(cell.querySelector("img")).toHaveAttribute(
              "src",
              expectedRow[cid]
            );
        });
      });
    });
  });

  describe("Profile renders extra features correctly for owner user", () => {
    beforeEach(async () => {
      useMoralis.mockImplementation(() => ({
        ...useMoralisProp,
        isAuthenticated: true,
        account: _account,
        user: {
          get: jest.fn(() => "ShelterNOW"),
        },
      }));
      await act(async () => {
        const { debug } = await routedApp("/profile", {
          ...baseProp,
          account: _account,
          owner: _account,
        });
        debug_ = debug;
      });
    });

    afterEach(() => jest.clearAllMocks());

    test("Profile renders with 4 tabs with authenticated owner user", async () => {
      const profileCard = (await screen.findByText(/profile/i)).parentElement
        .parentElement;
      expect(profileCard).toBeInTheDocument();
      const tabs = await screen.findAllByRole("tab");
      expect(tabs).toHaveLength(4);
      const [wallet, , ,] = tabs;
      expect(wallet.parentElement).toHaveClass("ant-tabs-tab-active");
    });

    test("Profile renders with correct wallet details with authenticated owner user", async () => {
      const SNOWBal = (await screen.findByText(/^SNOW Balance$/, statOption))
        .nextSibling;
      const ETHBal = screen.getByText(/^ETH Balance$/, statOption).nextSibling;
      const totalSNOW = screen.getByText(/^Total SNOW/, statOption).nextSibling;
      const totalETH = screen.getByText(/^Total ETH/, statOption).nextSibling;
      expect(SNOWBal).toHaveTextContent(expectedSNOWBalance);
      expect(ETHBal).toHaveTextContent(expectedETHBalance);

      expect(mockDonationOfDonor).toHaveBeenCalled();

      expect(totalSNOW).toHaveTextContent(expectedSNOWDonated);
      expect(totalETH).toHaveTextContent(expectedETHDonated);
    });

    test("Profile renders pending approval correctly", async () => {
      useMoralisQuery.mockImplementation(() => ({
        data: [{ ...mockFormData }],
      }));
      const tabs = await screen.findAllByRole("tab");
      const [, , , approval] = tabs;
      await act(async () => await user.click(approval));
      const approvalTable = await screen.findByTestId("approvalTable");
      const data = [
        /0x10bC30...Fc1Aa55b/i,
        /0x8e9eb1...d0079906/i,
        "3",
        /Review Application/i,
        "8",
      ];
      const rows = approvalTable.querySelectorAll("table > tbody > tr");
      expect(rows).toHaveLength(1);
      rows
        .item(0)
        .querySelectorAll("td")
        .forEach((td, idx) => {
          expect(td).toHaveTextContent(data[idx]);
        });
    });

    const statisticCheck = (label, expected) => {
      debug_(label.nextSibling);
      expect(label.nextSibling).toHaveTextContent(expected);
    };

    test("Profile renders application form details correctly", async () => {
      useMoralisQuery.mockImplementation(() => ({
        data: [{ ...mockFormData }],
      }));
      const tabs = await screen.findAllByRole("tab");
      const [, , , approval] = tabs;
      await act(async () => await user.click(approval));
      const reviewButton = await screen.findByText(/Review Application/i);
      await act(async () => await user.click(reviewButton));
      const reviewForm = await screen.findByTestId("reviewForm");
      expect(reviewForm).toBeVisible();
      const labels = reviewForm.querySelectorAll(
        ".ant-descriptions-item-label"
      );
      labels.forEach((label, idx) =>
        statisticCheck(label, expectedFormData[idx])
      );
    });
  });
});
