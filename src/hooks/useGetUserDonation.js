import { useEffect, useState } from "react";
import { tokenEnum } from "../utils/util";

// Usage: import AdoptionHooks, then const { method } = AdoptionHooks(props);
export const useGetUserDonation = (props) => {
  const [donation, setDonation] = useState(null);
  const [SNOW, setSNOW] = useState(null);
  const [account, setAccount] = useState(null);
  const [totalETHDonation, setTotalETHDonation] = useState(0);
  const [totalSNOWDonation, setTotalSNOWDonation] = useState(0);
  const [donationEvents, setDonationEvents] = useState([]);

  useEffect(() => {
    if (!account) setAccount(props.account);
    if (!SNOW) setSNOW(props.contracts.SNOW);
    if (!donation) setDonation(props.contracts.donation);
    if (donation && account) getDonation();
    if (donation && !donationEvents.length) getPastDonations();
  }, [
    props.contracts.SNOW,
    props.contracts.donation,
    props.account,
    account,
    SNOW,
    donation,
    donationEvents,
  ]);

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
