// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
require("dotenv").config();
import "@testing-library/jest-dom";

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

global.setImmediate = jest.useRealTimers;
global.ResizeObserver = require("resize-observer-polyfill");
global.APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
global.SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;
