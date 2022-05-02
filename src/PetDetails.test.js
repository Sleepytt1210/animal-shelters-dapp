import React from "react";
import { screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";
import { useMoralis } from "./__mocks__/react-moralis";
import userEvent from "@testing-library/user-event";
import { displayAge } from "./utils/util";

const props = global.props;
const routedApp = global.routedApp;
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

  // Details order: Name, Age, Gender, Type, Breed, Vaccinated, Descriptions, Suggestion
  test.each(_petsMetadata)(
    "Pet details show correct details for $petID: $name (Adoption state: $adoptable)",
    async ({
      petID,
      name,
      age,
      gender,
      type,
      breed,
      vaccinated,
      description,
      suggestion,
      img,
      adoptable,
    }) => {
      const expectedVac = vaccinated ? "check-square" : "close-square";
      const expectedDetails = [
        name,
        displayAge(age),
        gender,
        type,
        breed,
        expectedVac,
      ];
      await act(async () => {
        const { debug: _debug } = await routedApp(
          `/adoptpet/${petID}`,
          appProp
        );
        debug_ = _debug;
      });
      const imgCard = await screen.findByTestId("imgcard");
      const pageImg = imgCard.querySelector("img");
      const title = imgCard.querySelector("h1");
      const descCard = await screen.findByTestId("desccard");
      const availability = screen.getByTestId("availability");
      const detailsList = descCard.querySelectorAll(
        "div.ant-descriptions-item-container"
      );
      const pageDescription = screen.getByTestId("description");
      const pageSuggestion = screen.getByTestId("suggestion");
      expect(pageImg).toHaveAttribute("src", img);
      expect(title).toHaveTextContent(name);
      expect(availability).toHaveTextContent(
        adoptable == 1 ? "Available" : "Not Available"
      );
      detailsList.forEach((detail, idx) => {
        if (
          detail.querySelector(".ant-descriptions-item-label").innerHTML !=
          "Vaccinated"
        ) {
          expect(detail).toHaveTextContent(expectedDetails[idx]);
        } else {
          expect(detail.querySelector("span.anticon")).toHaveAttribute(
            "aria-label",
            expectedDetails[idx]
          );
        }
      });
      expect(pageDescription).toHaveTextContent(description);
      expect(pageSuggestion).toHaveTextContent(suggestion);
    }
  );
});
