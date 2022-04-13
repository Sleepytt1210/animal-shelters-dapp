import { useCallback, useEffect, useState } from "react";
import { BN } from "../utils/util";

export const useSNOWBalance = (props) => {
  const { SNOW } = props.contracts;
  const account = props.account;
  const [balance, setBalance] = useState(BN(0));

  const getBalance = useCallback(() => {
    SNOW.balanceOf(account, { from: account })
      .then((res) => {
        setBalance(res);
      })
      .catch(console.error);
  }, [SNOW, account]);

  useEffect(() => {
    if (SNOW && account) getBalance();
  }, [SNOW, account]);

  return {
    balance,
  };
};
