import React from "react";
import { screen, render } from "@testing-library/react";
import App from "./App";
import { MoralisProvider } from "react-moralis";

const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;

test("Renders app correctly and default is home page", async () => {
  const { debug } = render(
    <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
      <App />
    </MoralisProvider>
  );
  const logoText = await screen.findByTitle("Animal Shelter DApp");
  const introText = await screen.findByText("Introduction");
  const homeTab = await screen.findByText("Home");
  expect(introText).toBeVisible();
  expect(logoText).toHaveClass("logo");
  expect(homeTab).toHaveClass("active");
  debug();
});
