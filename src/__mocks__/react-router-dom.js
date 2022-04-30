import React from "react";

const reactRouterDom = require("react-router-dom");
reactRouterDom.BrowserRouter = jest.fn();

module.exports = reactRouterDom;
