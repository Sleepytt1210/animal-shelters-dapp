import { useEffect, useState, useCallback } from "react";

export const useGetAdoptablePets = (props) => {
  const adoption = props.contracts.adoption;
  const account = props.account;
  const pets = props.petsMetadata;
  const [adoptablePets, setAdoptablePets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAdoptablePets = useCallback(async () => {
    const adoptableCheck = await Promise.all(
      pets.map(async (o) => {
        return adoption
          .getAdoptionState(o.petID, { from: account })
          .then((bnState) => {
            return bnState == 1;
          });
      })
    );
    const _adoptablePets = pets.filter((o, i) => adoptableCheck[i]);
    setAdoptablePets(_adoptablePets);
    setIsLoading(false);
  }, [account, pets, adoption]);

  useEffect(() => {
    if (adoption && pets?.length > 0) getAdoptablePets();
  }, [adoption, pets, getAdoptablePets]);

  return {
    getAdoptablePets,
    adoptablePets,
    isLoading,
  };
};
