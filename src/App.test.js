import React from "react";
require("dotenv").config();
import { screen, render, fireEvent, renderHook } from "@testing-library/react";
import App from "./App";
import { act } from "react-dom/test-utils";
import { MemoryRouter, BrowserRouter } from "react-router-dom";
import { MoralisProvider } from "react-moralis";
import { useMoralis } from "./__mocks__/react-moralis";

jest.mock("./hooks/useGetAdoptablePets");
import { useGetAdoptablePets } from "./hooks/useGetAdoptablePets";

const APP_ID = global.APP_ID;
const SERVER_URL = global.SERVER_URL;

const props = {
  web3: jest.fn(),
  account: "0xc567d23F6b8d3ABBBE9c33Ad7C02651F30C0F99E",
  owner: "0xc567d23F6b8d3ABBBE9c33Ad7C02651F30C0F99E",
  petsMetadata: require("./utils/sample-data.json"),
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
      getAdoptionState: jest.fn(),
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
      approve: jest.fn(() => Promise.resolve()),
      balanceOf: jest.fn(() => "15000"),
    },
  },
};

const routedApp = (initialPage, appProps) => {
  return render(
    <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
      <MemoryRouter initialEntries={[initialPage]}>
        <App {...appProps} />
      </MemoryRouter>
    </MoralisProvider>
  );
};

describe("Test Application Pages", () => {
  const pagesTitle = [
    { menu: "Home", expected: "Introduction" },
    { menu: "Pet Finder", expected: "Find a Pet" },
    { menu: "Donation", expected: "Donation" },
    { menu: "Statistics", expected: "Statistics" },
    { menu: "About", expected: "About Us" },
  ];

  beforeEach(() => {
    BrowserRouter.mockImplementation(({ children }) => {
      return <div>{children}</div>;
    });
    useMoralis.mockImplementation(() => ({
      enableWeb3: jest.fn(),
      isAuthenticated: false,
      isWeb3Enabled: false,
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

  test("Renders app correctly and default is home page", async () => {
    routedApp("/");
    const logoText = await screen.findByTitle("Animal Shelter DApp");
    const introText = await screen.findByText("Introduction");
    const homeTab = await screen.findByText("Home");
    const authButton = await screen.findByText("Authenticate");
    const adoptionRow = await screen.findByText("Adopt a Pet Now!");
    const petList =
      adoptionRow.parentElement.parentElement.querySelector("div.ant-skeleton");
    expect(introText).toBeVisible();
    expect(logoText).toHaveClass("logo");
    expect(homeTab).toHaveClass("active");
    expect(authButton).toHaveClass("auth-text");
    expect(petList).toBeInTheDocument();
  });

  test.each(pagesTitle)(
    "Page is changed correctly on navigation menu $menu click",
    async ({ menu, expected }) => {
      routedApp("/");
      await act(async () => {
        const element = await screen.findByText(menu);
        fireEvent.click(element);
      });
      const menuTab = await screen.findByText(menu, { selector: "a" });
      const title = await screen.findByText(expected, { selector: "h1" });
      expect(menuTab).toHaveClass("active");
      expect(title).toBeInTheDocument();
    }
  );

  test("Page should be redirected to home page for invalid path", async () => {
    routedApp("/random");
    const introText = await screen.findByText("Introduction");
    expect(introText).toBeVisible();
  });

  test("UseMoralis authenticate is called on wallet button click", async () => {
    routedApp("/");
    let auth = jest.fn();
    useMoralis.mockImplementation(() => ({
      authenticate: auth,
    }));
    const authButton = await screen.findByText("Authenticate");
    fireEvent.click(authButton);
    const modal = (await screen.findByText("Connect Wallet")).parentElement;
    expect(modal).toHaveClass("ant-modal-body");
    const metamaskCont = (await screen.findByText("Metamask")).parentElement;
    await act(async () => {
      fireEvent.click(metamaskCont);
    });
    expect(auth).toHaveBeenCalled();
  });

  test("Button text should be account ellipsis if authenticated", async () => {
    const addressEllipsis = /0xc567...c0f99e/i;
    useMoralis.mockImplementation(() => ({
      isAuthenticated: true,
      account: "0xc567d23F6b8d3ABBBE9c33Ad7C02651F30C0F99E",
      enableWeb3: jest.fn(),
      isWeb3Enabled: true,
    }));
    routedApp("/", {
      account: "0xc567d23F6b8d3ABBBE9c33Ad7C02651F30C0F99E",
    });
    const authText = await screen.findByTestId("auth-text");
    expect(authText).toHaveTextContent(addressEllipsis);
  });

  test("Home should render adoptable pets", async () => {
    const expectedNames = ["Tabby", "Puff", "Money", "Parker"];
    useMoralis.mockImplementation(() => ({
      isAuthenticated: true,
      account: "0xc567d23F6b8d3ABBBE9c33Ad7C02651F30C0F99E",
      enableWeb3: jest.fn(),
      isWeb3Enabled: true,
    }));
    useGetAdoptablePets.mockImplementation(() => ({
      adoptablePets: props.petsMetadata.filter((o) => o.adoptable == 1),
      isLoading: false,
      getAdoptablePets: jest.fn(),
    }));
    routedApp("/", {
      account: "0xc567d23F6b8d3ABBBE9c33Ad7C02651F30C0F99E",
      isLoading: false,
      petsMetadata: props.petsMetadata,
    });
    const adoptionRow = await screen.findByText("Adopt a Pet Now!");
    const petList =
      adoptionRow.parentElement.parentElement.querySelectorAll(
        "div.ant-list-item"
      );
    expect(petList).toHaveLength(4);
    petList.forEach((list, idx) => {
      expect(list).toHaveTextContent(expectedNames[idx]);
    });
  });
});
