import { useEffect, useState } from "react";

// Usage: import AdoptionHooks, then const { method } = AdoptionHooks(props);
export const useAddPet = (props) => {
  const [adoption, setAdoption] = useState(null);
  const [account, setAccount] = useState(null);
  const [petCount, setPetCount] = useState(0);

  useEffect(() => {
    if (!account) setAccount(props.account);
    if (!adoption) setAdoption(props.contracts.adoption);
  }, [props.contracts.adoption, props.account, account, adoption]);

  useEffect(() => {
    if (adoption && account)
      adoption.totalSupply({ from: account }).then(setPetCount);
  }, []);

  const addPet = async (tokenURI, adoptionState, callback) => {
    return adoption
      .addPet(tokenURI, adoptionState, { from: account })
      .then(callback)
      .catch(console.error);
  };

  return {
    addPet,
    petCount,
  };
};
