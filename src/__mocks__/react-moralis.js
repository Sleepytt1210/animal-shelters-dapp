module.exports = {
  ...jest.requireActual("react-moralis"),
  useMoralisQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
  })),
  // useMoralisFile: jest.fn(() => ({
  //   saveFile: jest.fn(() => ({
  //     onSuccess: jest.fn(),
  //     onError: jest.fn(),
  //   })),
  // })),
  useMoralis: jest.fn(() => ({
    enableWeb3: jest.fn(),
    isAuthenticated: false,
    isWeb3Enabled: false,
    isWeb3Enabling: false,
    authenticate: jest.fn(),
    account: "0xc567d23F6b8d3ABBBE9c33Ad7C02651F30C0F99E",
    chainId: 1337,
    user: {
      get: jest.fn(),
    },
    logout: jest.fn(),
    setUserData: jest.fn(),
  })),
};
