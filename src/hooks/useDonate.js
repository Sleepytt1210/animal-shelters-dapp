import { useEffect, useState } from "react";
import Web3 from "web3";

// Usage: import AdoptionHooks, then const { method } = AdoptionHooks(props);
export const useDonate = (props) => {
  const [donation, setDonation] = useState(null);
  const [account, setAccount] = useState(null);
  const [SNOW, setSNOW] = useState(null);

  useEffect(() => {
    if (!account) setAccount(props.account);
    if (!SNOW) setSNOW(props.contracts.SNOW);
    if (!donation) setDonation(props.contracts.donation);
  }, [
    props.contracts.SNOW,
    props.contracts.donation,
    props.account,
    account,
    SNOW,
    donation,
  ]);

  const donate = (amount, currency, message, callback) => {
    if (currency == "ETH") {
      return donation
        .donateETH(message, {
          from: account,
          value: Web3.utils.toWei(amount, "ether"),
        })
        .then(callback)
        .catch(console.error);
    } else if (currency == "SNOW") {
      const decimalised = Web3.utils.toWei(amount, "gwei");
      return SNOW.approve(donation.address, decimalised, { from: account })
        .then(() =>
          donation.donateSNOW(decimalised, message, {
            from: account,
          })
        )
        .then(callback)
        .catch(console.error);
    }
  };

  return {
    donate,
  };
};
