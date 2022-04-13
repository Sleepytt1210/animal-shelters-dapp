import { useEffect, useState } from "react";

// Usage: import AdoptionHooks, then const { method } = AdoptionHooks(props);
export const useRequestAdoption = (props) => {
  const { adoption, SNOW } = props.contracts;
  const account = props.account;

  const requestAdopt = async (petID, adoptionFee, callback) => {
    SNOW.approve(adoption.address, adoptionFee, {
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
