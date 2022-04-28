import { useCallback, useEffect, useState } from "react";

// Usage: import AdoptionHooks, then const { method } = AdoptionHooks(props);
export const useGetPetStats = (props) => {
  const adoption = props.contracts.adoption;
  const account = props.account;
  const [petCount, setPetCount] = useState(0);
  const [adoptionEvents, setAdoptionEvents] = useState([]);

  useEffect(() => {
    if (adoption && account && props.petsMetadata)
      adoption.totalSupply({ from: account }).then(setPetCount);
  }, [adoption, account, props.petsMetadata]);

  useEffect(() => {
    if (adoption) {
      getAdoptionEvents();
    }
  }, [adoption]);

  const getAdoptionEvents = () => {
    console.log("Adoption Event function called");
    adoption
      .getPastEvents("AdoptionStatus", { fromBlock: 0, toBlock: "latest" })
      .then(setAdoptionEvents);
  };

  return {
    petCount,
    getAdoptionEvents,
    adoptionEvents,
  };
};
