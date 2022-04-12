import { useEffect, useState } from "react";

// Usage: import AdoptionHooks, then const { method } = AdoptionHooks(props);
export const useRequestAdoption = (props) => {
  const [adoption, setAdoption] = useState(null);
  const [SNOW, setSNOW] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (!account) setAccount(props.account);
    if (!adoption) setAdoption(props.contracts.adoption);
    if (!SNOW) setSNOW(props.contracts.SNOW);
  }, [props.contracts.adoption, props.contracts.SNOW, props.account]);

  const requestAdopt = async (petID, adoptionFee, callback) => {
    props.contracts.SNOW.approve(adoption.address, adoptionFee, {
      from: account,
    })
      .then(() => {
        return adoption.requestAdoption(petID, { from: account });
      })
      .then(callback)
      .catch(console.error);
  };

  return {
    requestAdopt,
  };
};
