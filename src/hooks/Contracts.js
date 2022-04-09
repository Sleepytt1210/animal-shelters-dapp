// Usage: import AdoptionHooks, then const { method } = AdoptionHooks(props);
export const AdoptionHooks = (props) => {
  const contracts = props.contracts;
  const account = props.account;
  console.log(props);
  return {
    addPet: async (tokenURI, status, callback) => {
      contracts.adoption
        .addPet(tokenURI, status, { from: account })
        .then((result) => callback && callback(result))
        .catch(console.error);
    },
    requestAdopt: async (petID, adoptionFee, callback) => {
      contracts.SNOW.approve(contracts.adoption.address, adoptionFee, {
        from: account,
      })
        .then((res) => {
          return contracts.adoption.requestAdoption(petID, { from: account });
        })
        .then((receipt) => {
          callback && callback(receipt);
        })
        .catch(console.error);
    },
    getAdoptionFee: (callback) => {
      return contracts.adoption
        .getAdoptionFee({ from: account })
        .then((fee) => callback && callback(fee));
    },
    getAdoptionState: (petID, callback) => {
      return contracts.adoption
        .getAdoptionState(petID)
        .then((state) => callback && callback(state))
        .catch(console.error);
    },
    getAdoptablePets: () => {
      return contracts.adoption
        .totalSupply({ from: account })
        .then(async (ts) => {
          const res = [];
          for (let i = 0; i < ts; i++) {
            if ((await contracts.getAdoptionState(i, { from: account })) == 1) {
              res.push(i);
            }
          }
          return res;
        })
        .catch(console.error);
    },
    getTotalSupply: () => {
      return contracts.adoption.totalSupply({ from: account });
    },
  };
};
