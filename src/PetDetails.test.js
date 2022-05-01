import React from "react";
import { screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";
import { useMoralis } from "./__mocks__/react-moralis";
import userEvent from "@testing-library/user-event";

const props = global.props;
const routedApp = global.routedApp;
describe("Pet details component tests", () => {
  let debug_;
  let user;
  const expectedPage1Names = ["Tabby", "Puff", "Money", "Parker"];
  const expectedPage2Names = ["Huahua", "Lucky", "Luna", "Tom"];
  const _account = props.account;
  const _petsMetadata = props.petsMetadata;
  const appProp = {
    account: _account,
    petsMetadata: _petsMetadata,
    contracts: {
      adoption: props.contracts.adoption,
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
  });

  test("Pet details show correct details", async () => {
    await act(async () => {
      const { debug: _debug } = await routedApp("/adoptpet/2", appProp);
      debug_ = _debug;
    });
    const imgCard = await screen.findByTestId("imgcard");
    const descCard = await screen.findByTestId("desccard");
    debug_(imgCard);
    debug_(descCard);
  });
});
