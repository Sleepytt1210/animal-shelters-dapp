const mockMetadatas = require("../../utils/sample-data.json");

const adoptablePets = mockMetadatas.filter((o) => o.adoptable == 1);
const getAdoptablePets = jest.fn();
const useGetAdoptablePets = jest.fn(() => ({
  adoptablePets,
  getAdoptablePets,
  isLoading: false,
}));

module.exports = { useGetAdoptablePets };
