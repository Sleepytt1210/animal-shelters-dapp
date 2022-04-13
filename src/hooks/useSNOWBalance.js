import { useCallback, useEffect, useState } from "react";
import { BN } from "../utils/util";

export const useSNOWBalance = (props) => {
  const [SNOW, setSNOW] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(BN(0));

  const getBalance = useCallback(() => {
    SNOW.balanceOf(account, { from: account })
      .then((res) => {
        setBalance(res);
      })
      .catch(console.error);
  }, [SNOW, account]);

  useEffect(() => {
    if (!account) setAccount(props.account);
    if (!SNOW) setSNOW(props.contracts.SNOW);
  }, [props.contracts.SNOW, props.account, account, SNOW]);

  useEffect(() => {
    if (SNOW && account) getBalance();
  }, [SNOW, account]);

  return {
    balance,
  };
};
