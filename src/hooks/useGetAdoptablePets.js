import { useEffect, useState } from "react";

export const useGetAdoptablePets = (props) => {
  const adoption = props.contracts.adoption;
  const account = props.account;
  const pets = props.petsMetadata;
  const [adoptablePets, setAdoptablePets] = useState([]);

  useEffect(() => {
    if (adoption && pets?.length > 0 && adoptablePets.length == 0)
      getAdoptablePets();
  }, [adoption, account, pets]);

  const getAdoptablePets = async () => {
    const adoptableCheck = await Promise.all(
      pets.map(async (o) => {
        return props.contracts.adoption
          .getAdoptionState(o.petID, { from: account })
          .then((bnState) => {
            return bnState == 1;
          });
      })
    );
    const _adoptablePets = pets.filter((o, i) => adoptableCheck[i]);
    setAdoptablePets(_adoptablePets);
    props.setIsLoading(false);
  };

  return {
    getAdoptablePets,
    adoptablePets,
  };
};
