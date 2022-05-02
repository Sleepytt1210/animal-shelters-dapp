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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (donation && account) getUserDonation();
    if (donation && account) getTotalDonation();
    if (donation && !donationEvents.length) getPastDonations();
  }, [donation, account]);

  const getUserDonation = () => {
    setIsLoading(true);
    donation
      .getDonationOfDonor(account, tokenEnum["SNOW"], { from: account })
      .then(setUserSNOWDonation)
      .catch(console.error);
    donation
      .getDonationOfDonor(account, tokenEnum["ETH"], { from: account })
      .then(setUserETHDonation)
      .catch(console.error);
    setIsLoading(false);
  };

  const getTotalDonation = () => {
    setIsLoading(true);
    donation
      .getTotalDonation(tokenEnum["SNOW"], { from: account })
      .then(setTotalSNOWDonation)
      .catch(console.error);
    donation
      .getTotalDonation(tokenEnum["ETH"], { from: account })
      .then(setTotalETHDonation)
      .catch(console.error);
    setIsLoading(false);
  };

  const getPastDonations = () => {
    setIsLoading(true);
    donation
      .getPastEvents("Donate", { fromBlock: 0, toBlock: "latest" })
      .then(setDonationEvents)
      .catch(console.error);
    setIsLoading(false);
  };

  return {
    getUserDonation,
    getTotalDonation,
    getPastDonations,
    userETHDonation,
    userSNOWDonation,
    totalETHDonation,
    totalSNOWDonation,
    donationEvents,
    isLoading,
  };
};
