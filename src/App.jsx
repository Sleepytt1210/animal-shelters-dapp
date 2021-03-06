import React, { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Moralis from "moralis";
import { useMoralis } from "react-moralis";
import MenuItems from "./components/MenuItems";
import Home from "./components/Home/Home.jsx";
import Account from "./components/Account/Account";
import { Layout, ConfigProvider, Empty } from "antd";
import Text from "antd/lib/typography/Text";
import "antd/dist/antd.css";
import PetFinder from "./components/PetFinder/PetFinder";
import PetDetails from "./components/Adoption/PetDetails";
import Donation from "./components/Donation";
import "./App.css";
import AdoptionForm from "./components/Adoption/AdoptionForm";
import contract from "@truffle/contract";
import AdoptionAbi from "./contracts/Adoption.json";
import ShelterNOWAbi from "./contracts/ShelterNOW.json";
import DonationAbi from "./contracts/Donation.json";
import Web3 from "web3";
import { useGetMetadata } from "./hooks/useGetMetadata";
import UserProfile from "./components/Profile/UserProfile";
import Statistics from "./components/Statistics/Statistics";
import About from "./components/About";

const { Header, Content, Footer } = Layout;

const empComp = () => {
  return (
    <Empty
      description={
        <span style={{ fontSize: "20px", color: "black" }}>No Data</span>
      }
    />
  );
};

const styles = {
  content: {
    display: "block",
    justifyContent: "center",
    fontFamily: "Roboto, sans-serif",
    color: "#041836",
    margin: "64px 0 0",
    padding: "10px 0",
    minHeight: "250px",
    alignContent: "center",
    flexDirection: "column",
    flexWrap: "wrap",
  },
  headerRight: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "600",
  },
};

const App = (props) => {
  const [web3, setWeb3] = useState(props.web3 || null);
  const [contracts, setContracts] = useState(
    props.contracts || {
      adoption: null,
      SNOW: null,
      donation: null,
    }
  );
  const [account, setAccount] = useState(props.account || "");
  const [petCount, setPetCount] = useState(props.petCount || 0);
  const [petsMetadata, setPetsMetadata] = useState(props.petsMetadata || []);
  const [owner, setOwner] = useState(props.owner || "");
  const { getMetadataHook } = useGetMetadata();

  const initContract = useCallback(
    async (provider) => {
      console.log("Init contracts called!");
      const SNOWInstance = contract(ShelterNOWAbi);
      SNOWInstance.setProvider(provider);
      const SNOW = await SNOWInstance.deployed();

      const adoptionInstance = contract(AdoptionAbi, SNOWInstance.address);
      adoptionInstance.setProvider(provider);
      const adoption = await adoptionInstance.deployed();

      const donationInstance = contract(DonationAbi, SNOWInstance.address);
      donationInstance.setProvider(provider);
      const donation = await donationInstance.deployed();

      setContracts({
        adoption: adoption,
        donation: donation,
        SNOW: SNOW,
      });

      const _owner = await SNOW.owner();
      setOwner(_owner.toLowerCase());
      setPetCount(await adoption.pets({ from: account }));
    },
    [account]
  );

  const { enableWeb3, isAuthenticated, account: account_ } = useMoralis();

  useEffect(() => {
    const connectorId = window.localStorage.getItem("connectorId");
    if (window.ethereum)
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });
    if (isAuthenticated && !web3) {
      console.log("Initialising web3");
      const initWeb3 = async () => {
        await enableWeb3({ provider: connectorId });
        // console.log("Enabling web3", Moralis.provider);
        setWeb3(new Web3(Moralis.provider));
      };
      initWeb3();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => setAccount(account_), [account_]);

  useEffect(() => {
    console.log("Web3 Effect", web3);
    if (web3?.givenProvider) {
      initContract(web3.givenProvider);
    }
  }, [web3]);

  const getPetsMetadata = useCallback(async () => {
    const _pets = await Promise.all(
      await contracts.adoption?.pets({ from: account }).then(async (ids) => {
        return ids.map(async (id) => {
          return await contracts.adoption.tokenURI(id);
        });
      })
    )
      .then((uris) => {
        return uris.map(getMetadataHook);
      })
      .then((promises) => {
        return Promise.all(promises);
      })
      .then((metadatas) => {
        return metadatas.map((metadata) => {
          const { attributes, ...rest } = metadata;
          const item = { ...attributes, ...rest };
          return item;
        });
      });

    setPetsMetadata(_pets);
  }, [contracts.adoption, account, getMetadataHook]);

  useEffect(() => {
    console.log("Fetching pets from App");
    if (contracts.adoption && petCount) getPetsMetadata();
  }, [contracts.adoption, petCount]);

  return (
    <ConfigProvider renderEmpty={empComp}>
      <Layout className="layout">
        <Router>
          <Header className="header" style={{ background: "#141414" }}>
            <Logo theme="dark" />
            <MenuItems />
            <div style={styles.headerRight}>
              <Account />
            </div>
          </Header>
          <Content style={styles.content}>
            <Routes>
              <Route
                path="/home"
                element={
                  <Home
                    contracts={contracts}
                    account={account}
                    petsMetadata={petsMetadata}
                  />
                }
              />
              <Route
                path="/findpet"
                element={
                  <PetFinder
                    contracts={contracts}
                    account={account}
                    petsMetadata={petsMetadata}
                  />
                }
              />
              <Route
                path="/adoptpet/:petID"
                element={
                  <PetDetails
                    contracts={contracts}
                    account={account}
                    petsMetadata={petsMetadata}
                    owner={owner}
                  />
                }
              />
              <Route
                path="/donation"
                element={
                  <Donation
                    contracts={contracts}
                    account={account}
                    petsMetadata={petsMetadata}
                  />
                }
              />
              <Route
                path="/adoptionForm/:petID"
                element={
                  <AdoptionForm
                    contracts={contracts}
                    account={account}
                    petsMetadata={petsMetadata}
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <UserProfile
                    web3={web3}
                    contracts={contracts}
                    account={account}
                    owner={owner}
                    petsMetadata={petsMetadata}
                  />
                }
              />
              <Route
                path="/statistics"
                element={
                  <Statistics
                    contracts={contracts}
                    account={account}
                    petsMetadata={petsMetadata}
                    owner={owner}
                  />
                }
              />
              <Route path="/about" element={<About />} />
              <Route path="/*" element={<Navigate to="/home" />} />
            </Routes>
          </Content>
        </Router>
        <Footer style={{ textAlign: "center" }}>
          <Text style={{ display: "block" }}>
            ShelterNOW DApp ??2022 Created by Dylon Wong
          </Text>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

const Logo = () => (
  <div className="logo">
    <a href="/" title="Animal Shelter DApp" className="logo">
      <svg
        version="1.2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width="80"
        height="50"
      >
        <style>
          {`.a{fill:#fff;stroke:#272727;stroke-width:6}`}
          {`.b{fill:#dedede;stroke:#dedede;stroke-width:3}`}
          {`.c{fill:#fff}`}
          {`.d{fill:#e58390}`}
        </style>
        <path
          className="a"
          d="m225.6 481.2c-185.8-21.9-192.1-206.2-194-240.1-3.2-58.1 12.2-62.7 13-73.4 2.5-29.9 38.1-145.3 59-137.4 28.3 10.7 75 67.8 75 67.8l46.4-1.8m0 0l46.4 1.8c0 0 46.7-57.1 75-67.8 20.9-7.9 56.5 107.5 59 137.4 0.9 10.7 16.2 15.3 13 73.4-1.9 33.9-7.7 218.2-193.4 240.2"
        />
        <path
          className="b"
          d="m133.5 109.1c0 0-34.8 37.5-38.9 26.5-4-11.1 3.6-67.8 10.8-73.2 7.1-5.4 28.1 46.7 28.1 46.7zm211.1-46.7c7.2 5.4 14.8 62.1 10.8 73.2-4.1 11-38.9-26.5-38.9-26.5 0 0 21-52.1 28.1-46.7z"
        />
        <path d="m159 217.1c4.9-0.1 7.7 0.5 11.5 2.3 2.8 1.3 6.5 4.1 8.4 6.2 1.9 2.2 4.3 5.7 5.3 7.9 1 2.4 1.8 6.4 1.8 10 0 3.6-0.8 7.6-1.8 10-1 2.2-3.4 5.7-5.3 7.9-1.9 2.1-5.7 4.9-8.4 6.2-3.6 1.8-6.7 2.4-11.3 2.4-4.7 0-7.3-0.6-10.9-2.6-2.7-1.4-6.1-3.7-7.6-5.2-1.5-1.5-3.9-5.1-5.3-7.9-1.5-3.3-2.4-7.1-2.4-10 0-2.7 0.6-6.8 1.5-9.3 0.8-2.5 3.1-6.4 5.2-8.8 2.1-2.3 5.8-5.3 8.3-6.6 3.4-1.8 6.1-2.5 11-2.5zm131.3 0c5.4-0.1 7.6 0.4 11.4 2.5 2.7 1.4 6.1 3.7 7.6 5.2 1.5 1.5 3.9 5.1 5.3 8 1.5 3.2 2.4 7 2.4 10 0 2.6-0.6 6.7-1.5 9.2-0.8 2.5-3 6.3-4.8 8.5-1.9 2.2-5.7 5.2-8.5 6.8-4.1 2.1-6.6 2.7-11.5 2.7-4.5 0-7.6-0.6-11.2-2.4-2.8-1.3-6.5-4.1-8.4-6.2-1.9-2.2-4.3-5.7-5.3-7.9-1-2.4-1.8-6.4-1.8-10 0-3.6 0.8-7.6 1.8-10 1-2.2 3.4-5.8 5.3-7.9 1.9-2.1 5.4-4.9 7.9-6.1 3.2-1.7 6.4-2.3 11.2-2.4z" />
        <path
          className="c"
          d="m167.5 229c1.4 0 3.4 0.9 4.5 2 1.1 1.1 2 3.1 2 4.5 0 1.4-0.9 3.4-2 4.5-1.1 1.1-3.1 2-4.5 2-1.4 0-3.4-0.9-4.5-2-1.1-1.1-2-3.1-2-4.5 0-1.4 0.9-3.4 2-4.5 1.1-1.1 3.1-2 4.5-2zm115 0c1.4 0 3.4 0.9 4.5 2 1.1 1.1 2 3.1 2 4.5 0 1.4-0.9 3.4-2 4.5-1.1 1.1-3.1 2-4.5 2-1.4 0-3.4-0.9-4.5-2-1.1-1.1-2-3.1-2-4.5 0-1.4 0.9-3.4 2-4.5 1.1-1.1 3.1-2 4.5-2z"
        />
        <path d="m225.4 353.5c0 0-2.1 0.8-9.3-0.3-18.3-2.7-25.8-20.4-27.6-25.3-1.2-3.4 0-8.6 0.3-10.7 3.2-21.9 36.2-19.3 36.2-19.3m-0.6 0c0 0 33-2.6 36.2 19.3 0.3 2.1 1.5 7.3 0.3 10.7-1.8 4.9-9.3 22.6-27.6 25.3-7.2 1.1-9.3 0.3-9.3 0.3" />
        <path d="m225 372.9c0 0-34.9 1.8-39.3 7.1-1 1.1 10.4 32 0.4 30.5-3.2-0.5-24-28-24-28 0 0-31.2-56.2-25-58.7 3.2-1.4 13.8 11.5 18.1 23.7 6.6 18.5 15.6 17.7 19.1 19.6 4.3 2.5 26.6 1.4 29.6 0.5 6.7-1.8 21.1-2.2 21.1-2.2zm0-7.5c0 0 14.4 0.4 21.1 2.3 3 0.8 25.3 2 29.6-0.5 3.5-2 12.5-1.2 19.1-19.7 4.3-12.2 14.9-25.1 18.1-23.7 6.2 2.5-25 58.7-25 58.7 0 0-20.8 27.5-24 28-10 1.5 1.3-29.3 0.4-30.5-4.4-5.2-39.3-7.1-39.3-7.1z" />
        <path
          className="d"
          d="m225 440.3c-35 0.8-38.2-37.2-38.2-37.2 0 0-1.5-19-1.2-23.5 0.3-5 39.4-6.7 39.4-6.7zm0-67.5c0 0 39.1 1.7 39.4 6.8 0.3 4.4-1.2 23.5-1.2 23.5 0 0-3.2 37.9-38.2 37.2z"
        />
      </svg>
      <div className="logo-text">ShelterNOW</div>
    </a>
  </div>
);

export default App;
