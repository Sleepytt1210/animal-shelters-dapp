import { useEffect, useState } from "react";
import { tokenEnum } from "../utils/util";

// Usage: import AdoptionHooks, then const { method } = AdoptionHooks(props);
export const useGetUserDonation = (props) => {
  const { donation } = props.contracts;
  const account = props.account;
  const [totalETHDonation, setTotalETHDonation] = useState(0);
  const [totalSNOWDonation, setTotalSNOWDonation] = useState(0);
  const [donationEvents, setDonationEvents] = useState([]);

  useEffect(() => {
    if (donation && account) getDonation();
    if (donation && !donationEvents.length) getPastDonations();
  }, [account, donation, donationEvents]);

  const getDonation = () => {
    donation
      .getDonationOfDonor(account, tokenEnum["SNOW"], { from: account })
      .then(setTotalSNOWDonation)
      .catch(console.error);
    donation
      .getDonationOfDonor(account, tokenEnum["ETH"], { from: account })
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
    getDonation,
    totalETHDonation,
    totalSNOWDonation,
    donationEvents,
  };
};
