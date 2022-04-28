import Web3 from "web3";

// Usage: import AdoptionHooks, then const { method } = AdoptionHooks(props);
export const useDonate = (props) => {
  const { donation, SNOW } = props.contracts;
  const account = props.account;

  const donate = (amount, currency, message, callback) => {
    if (currency == "ETH") {
      return donation
        .donateETH(message, {
          from: account,
          value: Web3.utils.toWei(amount.toString(), "ether"),
        })
        .then(callback)
        .catch(console.error);
    } else if (currency == "SNOW") {
      const decimalised = Web3.utils.toWei(amount.toString(), "gwei");
      return SNOW.approve(donation.address, decimalised, { from: account })
        .then(() => {
          return donation.donateSNOW(decimalised, message, {
            from: account,
          });
        })
        .then(callback)
        .catch(console.error);
    }
  };

  return {
    donate,
  };
};
