import { screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "./__mocks__/react-router-dom";
import { useMoralis } from "./__mocks__/react-moralis";

const props = global.props;
const routedApp = global.routedApp;

describe("Home component tests", () => {
  const _account = props.account;
  const _petsMetadata = props.petsMetadata;
  let debug_;

  beforeEach(async () => {
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
      const { debug: _debug } = await routedApp("/", {
        account: _account,
        petsMetadata: _petsMetadata,
        contracts: {
          adoption: props.contracts.adoption,
        },
      });
      debug_ = _debug;
    });
  });

  test("Donate button has href to donation page", async () => {
    const donateButton = (await screen.findByText("Donate")).parentElement;
    expect(donateButton).toHaveAttribute("href", "/donation");
  });

  test("Home should render adoptable pets", async () => {
    const expectedNames = ["Tabby", "Puff", "Money", "Parker"];
    const petList = await screen.findByTestId("petlist");
    const petItemsList = petList.querySelectorAll("div.ant-list-item");
    expect(petItemsList).toHaveLength(4);
    petItemsList.forEach((list, idx) => {
      expect(list).toHaveTextContent(expectedNames[idx]);
    });
  });
});
