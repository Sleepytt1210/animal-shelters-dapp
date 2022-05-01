import React from "react";
import { screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";
import { useMoralis } from "./__mocks__/react-moralis";
import userEvent from "@testing-library/user-event";
import Web3 from "web3";
import { tokenEnum } from "./utils/util";

const props = global.props;
const routedApp = global.routedApp;

const mockTotalDonations = {
  ETH: Web3.utils.toWei("15", "ether"),
  SNOW: Web3.utils.toWei("99999", "gwei"),
};
const mockGetTotalDonation = jest.fn((token) =>
  Promise.resolve(mockTotalDonations[tokenEnum[token]])
);
const mockGetAdoptionEvents = jest.fn(() => {
  return Promise.resolve([
    { returnValues: { status: 7 } },
    { returnValues: { status: 7 } },
    { returnValues: { status: 7 } },
    { returnValues: { status: 7 } },
    { returnValues: { status: 2 } },
    { returnValues: { status: 3 } },
    { returnValues: { status: 4 } },
    { returnValues: { status: 2 } },
    { returnValues: { status: 3 } },
    { returnValues: { status: 4 } },
    { returnValues: { status: 8 } },
    { returnValues: { status: 9 } },
  ]);
});
const mockTotalSupply = jest.fn(() => {
  return Promise.resolve(4);
});
describe("Statistics component tests", () => {
  let debug_;
  let user;
  const _account = props.account;
  const _petsMetadata = props.petsMetadata.map((pet, idx) => {
    pet.adoptable = idx % 5;
    return pet;
  });
  const appProp = {
    account: _account,
    petsMetadata: _petsMetadata,
    contracts: {
      donation: {
        getTotalDonation: mockGetTotalDonation,
        getDonationOfDonor: jest.fn(() => Promise.resolve("10000000000000")),
        getPastEvents: jest.fn(() => Promise.resolve({})),
      },
      adoption: {
        totalSupply: mockTotalSupply,
        getPastEvents: mockGetAdoptionEvents,
      },
    },
  };

  beforeEach(async () => {
    user = userEvent.setup();
    BrowserRouter.mockImplementation(({ children }) => {
      return <div>{children}</div>;
    });

    useMoralis.mockImplementation(() => ({
      enableWeb3: jest.fn(() => Promise.resolve()),
      isAuthenticated: false,
      isWeb3Enabled: true,
      isWeb3Enabling: false,
      authenticate: jest.fn(() => Promise.resolve()),
      account: "0xc567d23F6b8d3ABBBE9c33Ad7C02651F30C0F99E",
      chainId: 1337,
      user: {
        get: jest.fn(),
      },
      logout: jest.fn(),
      setUserData: jest.fn(),
    }));

    await act(async () => {
      const { debug: _debug } = await routedApp(`/statistics`, appProp);
      debug_ = _debug;
    });
  });

  test("Should show the correct transaction overview", async () => {
    const statOption = {
      selector: "div.ant-statistic-title",
    };
    const expectedPrice = "$0.0451";
    const expectedSNOW = "99,999";
    const expectedETH = "15";
    const totalSNOW = await screen.findByText(
      /^Total SNOW Donation$/,
      statOption
    );
    const totalETH = screen.getByText(/^Total ETH Donation$/, statOption);
    const snowPrice = screen.getByText(/^SNOW Price/, statOption);
    const totalSNOWToday = screen.getByText(
      /^Total SNOW Donation Today$/,
      statOption
    );
    expect(totalSNOW.nextSibling).toHaveTextContent(expectedSNOW);
    expect(totalETH.nextSibling).toHaveTextContent(expectedETH);
    expect(snowPrice.nextSibling).toHaveTextContent(expectedPrice);
    expect(totalSNOWToday.nextSibling).toHaveTextContent(expectedSNOW);
  });

  test("Should render the transaction chart successfully", async () => {
    const chartTitle = await screen.findByText("Annual Donation by Token Type");
    const chart = screen.getByTestId("txChart").querySelector("canvas");
    expect(chartTitle).toBeInTheDocument();
    expect(chart).toBeInTheDocument();
  });

  test("Should render the transaction table successfully", async () => {
    const tableCard = await screen.findByTestId("txTable");
    // const chart = screen.getByTestId("txChart");
    expect(tableCard).toHaveTextContent(
      "Transactions History of Shelter Wallet"
    );
    const data = ["2022", "323222", "SNOW"];
    const row = tableCard.querySelectorAll(
      "table > tbody > tr:first-of-type td"
    );
    row.forEach((td, idx) => {
      expect(td).toHaveTextContent(data[idx]);
    });
  });

  describe("Pet statistics test", () => {
    beforeEach(async () => {
      const pRadio = await screen.findByTestId("pRadio");
      await act(async () => {
        await user.click(pRadio);
      });
    });

    test("Should show the correct pet stats overview", async () => {
      console.log(await mockTotalSupply());
      const statOption = {
        selector: "div.ant-statistic-title",
      };
      const expectedIntake = "4";
      const expectedTransactions = "12";
      const expectedOutcome = "4";
      const expectedAdopted = "2";
      const totalIntake = await screen.findByText(
        /^Total Pet Intake$/,
        statOption
      );
      const totalTx = screen.getByText(/^Total Transactions$/, statOption);
      const totalOutcome = screen.getByText(/^Total Outcome/, statOption);
      const totalAdopted = screen.getByText(/^Total Adopted$/, statOption);
      expect(totalIntake.nextSibling).toHaveTextContent(expectedIntake);
      expect(totalTx.nextSibling).toHaveTextContent(expectedTransactions);
      expect(totalOutcome.nextSibling).toHaveTextContent(expectedOutcome);
      expect(totalAdopted.nextSibling).toHaveTextContent(expectedAdopted);
    });

    test("Should render the pet statistic charts successfully", async () => {
      const intakeCard = await screen.findByTestId("petIntake");
      const outcomeCard = screen.getByTestId("petOutcome");
      const intakeChart = intakeCard.querySelector("canvas");
      const outcomeChart = outcomeCard.querySelector("canvas");
      expect(intakeChart).toBeInTheDocument();
      expect(outcomeChart).toBeInTheDocument();
    });

    test("Should render the pet statistics table successfully", async () => {
      const tableCard = await screen.findByTestId("txTable");
      expect(tableCard).toHaveTextContent("Adoption History");
      const data = [
        "0xb4e663d4...5f3739b669",
        "29/12/2021",
        "Cancelled",
        "0x099379e9ac5c4cab83184908b603c5d45e9adc23",
        "8",
      ];
      const row = tableCard.querySelectorAll(
        "table > tbody > tr:first-of-type td"
      );
      row.forEach((td, idx) => {
        expect(td).toHaveTextContent(data[idx]);
      });
    });
  });
});
