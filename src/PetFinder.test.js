import React from "react";
import { screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";
import { useMoralis } from "./__mocks__/react-moralis";
import userEvent from "@testing-library/user-event";

const props = global.props;
const routedApp = global.routedApp;
describe("Pet Finder component tests", () => {
  let debug_;
  let user;
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
    await act(async () => {
      const { debug: _debug } = await routedApp("/findpet", appProp);
      debug_ = _debug;
    });
  });

  const testPetList = (expectedNames, length) => {
    const petList = screen.getByTestId("petlist");
    const petItemsList = petList.querySelectorAll("div.ant-list-item");
    expect(petItemsList).toHaveLength(length);
    petItemsList.forEach((list, idx) => {
      expect(list).toHaveTextContent(expectedNames[idx]);
    });
  };

  test("Pet Finder should render two pages of adoptable pets", async () => {
    const expectedPage1Names = ["Tabby", "Puff", "Money", "Parker"];
    const expectedPage2Names = ["Huahua", "Lucky", "Luna", "Tom"];
    await screen.findByTestId("petlist");
    testPetList(expectedPage1Names, 4);
    var nextPageButton = screen.getByTitle("Next Page").firstChild;
    expect(nextPageButton).not.toBeDisabled();
    await act(async () => {
      await user.click(nextPageButton);
    });
    nextPageButton = (await screen.findByTitle("Next Page")).firstChild;
    expect(nextPageButton).toBeDisabled();
    testPetList(expectedPage2Names, 4);
  });

  describe("Filter test cases", () => {
    afterEach(async () => {
      const searchButton = (await screen.findByText("Search")).parentElement;
      const clearButton = screen.getByText("Clear").parentElement;
      await act(async () => {
        await user.click(clearButton);
        await user.click(searchButton);
      });
    });

    const getOption = (text) => {
      return screen.getByText(text, {
        selector: ".ant-select-item-option-content",
      });
    };

    test("Pet Finder should return correct results of dog type", async () => {
      const expectedDogsName = ["Money", "Huahua"];
      const [petTypeInput, , ,] = await screen.findAllByRole("combobox");
      await act(async () => {
        await user.click(petTypeInput);
      });
      const optionEle = getOption("Dog");
      await act(async () => {
        const searchButton = screen.getByText("Search").parentElement;
        await user.click(optionEle);
        await user.click(searchButton);
      });
      testPetList(expectedDogsName, 2);
    });

    test("Pet Finder should return correct results of cat type", async () => {
      const expectedCatsNames = ["Tabby", "Puff", "Parker", "Lucky"];
      const expectedCatsNames2 = ["Luna", "Tom"];

      const [petTypeInput, , ,] = await screen.findAllByRole("combobox");
      await act(async () => {
        await user.click(petTypeInput);
      });
      const optionEle = getOption("Cat");
      await act(async () => {
        const searchButton = screen.getByText("Search").parentElement;
        await user.click(optionEle);
        await user.click(searchButton);
      });
      testPetList(expectedCatsNames, 4);

      // Next page
      var nextPageButton = screen.getByTitle("Next Page").firstChild;
      expect(nextPageButton).not.toBeDisabled();
      await act(async () => {
        await user.click(nextPageButton);
      });

      nextPageButton = (await screen.findByTitle("Next Page")).firstChild;
      expect(nextPageButton).toBeDisabled();

      // Check Pets Detail
      testPetList(expectedCatsNames2, 2);
    });

    const ageFilters = [
      { option: "0 to 6 Months", length: 1, expected: ["Tabby"] },
      { option: "6 to 12 Months", length: 1, expected: ["Lucky"] },
      { option: "1 to 2 Years", length: 2, expected: ["Parker", "Luna"] },
      {
        option: "2 to 5 Years",
        length: 3,
        expected: ["Money", "Huahua", "Tom"],
      },
      { option: "5 to 7 Years", length: 1, expected: ["Puff"] },
      { option: "Over 8 Years", length: 0, expected: [] },
    ];

    test.each(ageFilters)(
      "Pet Finder should return correct result on $option age range",
      async ({ option, length, expected }) => {
        const [, ageRangeInput, ,] = screen.getAllByRole("combobox");
        await act(async () => {
          await user.click(ageRangeInput);
        });
        const optionEle = getOption(option);
        await act(async () => {
          const searchButton = screen.getByText("Search").parentElement;
          await user.click(optionEle);
          await user.click(searchButton);
        });
        testPetList(expected, length);
      }
    );

    const sizeFilters = [
      { option: "Small", length: 2, expected: ["Huahua", "Lucky"] },
      {
        option: "Medium",
        length: 4,
        expected: ["Puff", "Money", "Parker", "Luna"],
      },
      { option: "Large", length: 2, expected: ["Tabby", "Tom"] },
    ];

    test.each(sizeFilters)(
      "Pet Finder should return correct result of $option size",
      async ({ option, length, expected }) => {
        const [, , sizeInput] = await screen.findAllByRole("combobox");
        await act(async () => {
          await user.click(sizeInput);
        });
        const optionEle = getOption(option);
        await act(async () => {
          const searchButton = screen.getByText("Search").parentElement;
          await user.click(optionEle);
          await user.click(searchButton);
        });
        testPetList(expected, length);
      }
    );

    const breedFilters = [
      {
        type: "Cat",
        option: "American Shorthair",
        length: 1,
        expected: ["Tabby"],
      },
      {
        type: "Cat",
        option: "British Shorthair",
        length: 2,
        expected: ["Puff", "Tom"],
      },
      { type: "Cat", option: "Persian Cat", length: 1, expected: ["Parker"] },
      {
        type: "Cat",
        option: "Ragdoll",
        length: 2,
        expected: ["Lucky", "Luna"],
      },
      { type: "Dog", option: "Chihuahua", length: 1, expected: ["Huahua"] },
      { type: "Dog", option: "Pomeranian", length: 1, expected: ["Money"] },
    ];

    test.each(breedFilters)(
      "Pet Finder should return correct result of $option breed",
      async ({ type, option, length, expected }) => {
        const [petTypeInput, , , breedInput] = await screen.findAllByRole(
          "combobox"
        );
        const opposite = type == "Cat" ? "Dog" : "Cat";
        var optionEle;
        await act(async () => {
          await user.click(breedInput);
        });
        const toBeDisappeared = screen.getByText(opposite);
        await act(async () => {
          await user.click(petTypeInput);
        });
        optionEle = getOption(type);
        await act(async () => {
          await user.click(optionEle);
          await user.click(breedInput);
        });
        expect(toBeDisappeared).not.toBeInTheDocument();
        optionEle = getOption(option);
        await act(async () => {
          const searchButton = screen.getByText("Search").parentElement;
          await user.click(optionEle);
          await user.click(searchButton);
        });
        testPetList(expected, length);
      }
    );
  });
});
