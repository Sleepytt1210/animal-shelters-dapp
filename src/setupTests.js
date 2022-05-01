// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
require("dotenv").config();
import "@testing-library/jest-dom";
import { MoralisProvider } from "react-moralis";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import App from "./App";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
global.IS_REACT_ACT_ENVIRONMENT = true;

global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  };

const petsMetadata = require("./utils/sample-data.json");
const mockGetAdoptionState = (petID) =>
  Promise.resolve(petsMetadata[petID].adoptable);
const mockApprove = (address, amount) => Promise.resolve();

global.setImmediate = jest.useRealTimers;
global.ResizeObserver = require("resize-observer-polyfill");
global.APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
global.SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;
global.props = {
  web3: jest.fn(),
  account: "0xc567d23F6b8d3ABBBE9c33Ad7C02651F30C0F99E",
  owner: "0xc567d23F6b8d3ABBBE9c33Ad7C02651F30C0F99E",
  petsMetadata: petsMetadata,
  contracts: {
    adoption: {
      address: "0x12345",
      addPet: jest.fn(),
      requestAdoption: jest.fn(),
      approveAdoption: jest.fn(),
      rejectAdoption: jest.fn(),
      confirmAdoption: jest.fn(),
      cancelAdoption: jest.fn(),
      pets: jest.fn(),
      tokenURI: jest.fn(),
      totalSupply: jest.fn(),
      getAdoptionState: mockGetAdoptionState,
      getPastEvents: jest.fn(),
    },
    donation: {
      address: "0x54321",
      donateSNOW: jest.fn(),
      donateETH: jest.fn(),
      getDonationOfDonor: jest.fn(),
      getTotalDonation: jest.fn(),
      getPastEvents: jest.fn(),
    },
    SNOW: {
      address: "0x33333",
      owner: jest.fn(() => "0xc567d23F6b8d3ABBBE9c33Ad7C02651F30C0F99E"),
      approve: mockApprove,
      balanceOf: jest.fn(() => "15000"),
    },
  },
};

global.routedApp = (initialPage, appProps) => {
  return render(
    <MoralisProvider
      initializeOnMount={false}
      appId={process.env.REACT_APP_MORALIS_APPLICATION_ID}
      serverUrl={process.env.REACT_APP_MORALIS_SERVER_URL}
    >
      <MemoryRouter initialEntries={[initialPage]}>
        <App {...appProps} />
      </MemoryRouter>
    </MoralisProvider>
  );
};
