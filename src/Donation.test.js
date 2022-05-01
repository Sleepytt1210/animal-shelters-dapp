import React from "react";
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";
import { useMoralis } from "./__mocks__/react-moralis";
import userEvent from "@testing-library/user-event";
import Web3 from "web3";

const props = global.props;
const routedApp = global.routedApp;
const mockDonateSNOW = jest.fn(() => Promise.resolve({ tx: "0x12345" }));
const mockDonateETH = jest.fn(() => Promise.resolve({ tx: "0x12345" }));
const mockApprove = props.contracts.SNOW.approve;
describe("Pet details component tests", () => {
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
      SNOW: {
        approve: mockApprove,
      },
      donation: {
        donateSNOW: mockDonateSNOW,
        donateETH: mockDonateETH,
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
      const { debug: _debug } = await routedApp(`/donation`, appProp);
      debug_ = _debug;
    });
  });

  // Details order: Name, Age, Gender, Type, Breed, Vaccinated, Descriptions, Suggestion
  test("Should successfully donate SNOW with valid amount", async () => {
    const donateAmount = "15000";
    const message = "Good luck.";
    const expectedAccount = _account;
    const expectedAmount = Web3.utils.toWei(donateAmount, "gwei");
    const numberInput = await screen.findByLabelText("Amount");
    const messageInput = screen.getByLabelText("Message");
    const submitButton = screen.getByText(/submit/i).parentElement;
    await user.type(numberInput, donateAmount);
    await user.type(messageInput, message);
    await act(async () => {
      await user.click(submitButton);
    });
    expect(mockDonateSNOW).toBeCalledWith(expectedAmount, message, {
      from: expectedAccount,
    });
    const resultModal = await screen.findByTestId("result-modal");
    expect(resultModal).toBeVisible();
    expect(resultModal).toHaveTextContent("0x12345");
  });

  test("Should successfully donate ETH with valid amount", async () => {
    const donateAmount = "0.015";
    const message = "Good luck.";
    const expectedAccount = _account;
    const expectedAmount = Web3.utils.toWei(donateAmount, "ether");
    // Select the ETH currency
    const currencyList = (await screen.findByRole("combobox")).parentElement;
    await act(async () => {
      await user.click(currencyList);
    });
    const ethOption = await screen.findByText("ETH", {
      selector: ".ant-select-item-option-content",
    });
    await act(async () => {
      await user.click(ethOption);
    });

    // Reset user event due to false positive of pointer-events: none bug
    // https://github.com/testing-library/user-event/issues/922
    user = userEvent.setup();
    // Donate
    const numberInput = await screen.findByLabelText("Amount");
    const messageInput = screen.getByLabelText("Message");
    const submitButton = screen.getByText(/^submit$/i, {
      selector: "span",
    }).parentElement;
    await user.type(numberInput, donateAmount);
    await user.type(messageInput, message);
    await act(async () => {
      await user.click(submitButton);
    });
    expect(mockDonateETH).toBeCalledWith(message, {
      from: expectedAccount,
      value: expectedAmount,
    });
    const resultModal = await screen.findByTestId("result-modal");
    expect(resultModal).toBeVisible();
    expect(resultModal).toHaveTextContent("0x12345");
  });
});
