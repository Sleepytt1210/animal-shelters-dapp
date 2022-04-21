import { useEffect, useState } from "react";
import { tokenEnum } from "../utils/util";

export const useGetDonation = (props) => {
  const { donation } = props.contracts;
  const account = props.account;
  const [totalETHDonation, setTotalETHDonation] = useState(0);
  const [totalSNOWDonation, setTotalSNOWDonation] = useState(0);
  const [userETHDonation, setUserETHDonation] = useState(0);
  const [userSNOWDonation, setUserSNOWDonation] = useState(0);
  const [donationEvents, setDonationEvents] = useState([]);

  useEffect(() => {
    if (donation && account) getUserDonation();
    if (donation && account) getTotalDonation();
    if (donation && !donationEvents.length) getPastDonations();
  }, [account, donation, donationEvents]);

  const getUserDonation = () => {
    donation
      .getDonationOfDonor(account, tokenEnum["SNOW"], { from: account })
      .then(setUserSNOWDonation)
      .catch(console.error);
    donation
      .getDonationOfDonor(account, tokenEnum["ETH"], { from: account })
      .then(setUserETHDonation)
      .catch(console.error);
  };

  const getTotalDonation = () => {
    donation
      .getTotalDonation(tokenEnum["SNOW"], { from: account })
      .then(setTotalSNOWDonation)
      .catch(console.error);
    donation
      .getTotalDonation(tokenEnum["ETH"], { from: account })
      .then(setTotalETHDonation)
      .catch(console.error);
  };

  const getPastDonations = () => {
    donation
      .getPastEvents("Donate", { fromBlock: 0, toBlock: "latest" })
      .then(setDonationEvents)
      .catch(console.error);
  };

  return {
    getUserDonation,
    getTotalDonation,
    userETHDonation,
    userSNOWDonation,
    totalETHDonation,
    totalSNOWDonation,
    donationEvents,
  };
};
