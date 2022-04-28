import { useEffect, useState } from "react";

// Usage: import AdoptionHooks, then const { method } = AdoptionHooks(props);
export const useAddPet = (props) => {
  const adoption = props.contracts.adoption;
  const account = props.account;
  const [petCount, setPetCount] = useState(0);

  useEffect(() => {
    if (adoption && account && props.petsMetadata)
      adoption.totalSupply({ from: account }).then(setPetCount);
  }, [props.petsMetadata, account, adoption]);

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
