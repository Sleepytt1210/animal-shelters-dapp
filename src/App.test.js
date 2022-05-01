import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";
import { useMoralis } from "./__mocks__/react-moralis";
const routedApp = global.routedApp;

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
});
