// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Adoption {

  address public owner;
  event AdoptionStatus(address _adopter, uint256 _petID, AdoptionState _status);
  mapping(uint256 => address) public petToAdopter;
  mapping(uint256 => AdoptionState) public petToAdoptionState;
  Pet[] public pets;
  uint256 adoptionFee;
  uint256 public counter;

  // REJECTED, CANCELLED and REMOVED are for event emission such that the frontend knows what happened to the function calls.
  // The other enum shows the state of the pet in the adoption procedure.
  enum AdoptionState{AVAILABLE, LOCKED, APPROVED, REJECTED, CANCELLED, ADOPTED, REMOVED}

  constructor () {
    owner = msg.sender;
    counter = 0;
    // 0.0000001 Eth
    adoptionFee = 10 ** 10;
    string[4] memory names = ["Lucky", "Luna", "Momo", "Money"];
    for(uint8 i = 0; i < names.length; i++) {
      addPetForAdoption(names[i]);
    }
  }

  struct Pet {
    uint256 petID;
    string tokenURI;
  }

  modifier onlyOwner {
    require(msg.sender == owner, "Only owner can call this function!");
    _;
  }

  modifier petIDIsValid(uint256 petID) {
    // 4 billion pet id until overload, probably impossible
    require(petID == uint256(uint32(petID)), "Pet ID overloads!");
    require(petID < counter, "This pet does not exist!");
    // The pet should not be already adopted.
    require(petToAdoptionState[petID] != AdoptionState.ADOPTED, "This pet has already been adopted!");
    _;
  }

  modifier petIDNotReviewed(address adopter, uint256 petID) {
    // The pet should be in locked state to be approved.
    require(petToAdoptionState[petID] != AdoptionState.APPROVED, "This pet has already been approved for adoption!");
    require(petToAdoptionState[petID] == AdoptionState.LOCKED, "This pet is not requested for adoption yet!");
    _;
  }

  modifier onlyApprovedNotConfirmedAdopter(uint256 petID) {
    // Pet should already be requested for adoption.
    require(petToAdopter[petID] != address(0), "The pet has not been requested for adoption yet.");
    // Function caller is not the approved adopter of the pet.
    require(msg.sender == petToAdopter[petID], "The pet has been requested for adoption by another adopter.");
    require(petToAdoptionState[petID] != AdoptionState.ADOPTED, "This pet has already been adopted!");
    // The pet is either adopted or removed if not locked.
    require(petToAdoptionState[petID] == AdoptionState.APPROVED, "This pet is not approved for adoption!");
    _;
  }

  // Add a pet for adoption
  function addPetForAdoption(string memory _name) public onlyOwner returns(uint256){
    uint256 newPetID = counter++;
    require(newPetID == uint256(uint32(newPetID)));

    Pet memory _pet = Pet({
    petID: newPetID,
    tokenURI: _name
    });

    pets.push(_pet);
    return newPetID;
  }

  // Adopting a pet
  function requestAdoption(uint256 petID) public petIDIsValid(petID) {
    require(petToAdoptionState[petID] == AdoptionState.AVAILABLE, "This pet is not available for adoption!");
    petToAdopter[petID] = msg.sender;
    petToAdoptionState[petID] = AdoptionState.LOCKED;
    emit AdoptionStatus(msg.sender, petID, AdoptionState.LOCKED);
  }

  // Approve an adoption application request
  function approveAdoption(address adopter, uint256 petID) public onlyOwner petIDIsValid(petID) petIDNotReviewed(adopter, petID) {
    petToAdoptionState[petID] = AdoptionState.APPROVED;
    emit AdoptionStatus(adopter, petID, AdoptionState.APPROVED);
  }

  // Reject an adoption application request
  function rejectAdoption(address adopter, uint256 petID) public onlyOwner petIDIsValid(petID) petIDNotReviewed(adopter, petID) {
    resetAdoption(adopter, petID, AdoptionState.REJECTED);
  }

  // Cancel an approved adoption
  function cancelAdoption(uint256 petID) public petIDIsValid(petID) onlyApprovedNotConfirmedAdopter(petID) {
    resetAdoption(msg.sender, petID, AdoptionState.CANCELLED);
  }

  // Reset a pet adoption to the default state
  function resetAdoption(address adopter, uint256 petID, AdoptionState status) private {
    petToAdoptionState[petID] = AdoptionState.AVAILABLE;
    petToAdopter[petID] = address(0);
    emit AdoptionStatus(adopter, petID, status);
  }

  // Confirm adoption
  function confirmAdoption(uint256 petID) public payable petIDIsValid(petID) onlyApprovedNotConfirmedAdopter(petID) {
    require(msg.value >= adoptionFee, "The adoption fee is insufficient!");
    address adopter = msg.sender;

    petToAdoptionState[petID] = AdoptionState.ADOPTED;

    emit AdoptionStatus(adopter, petID, AdoptionState.ADOPTED);
  }

  function withdraw() public payable onlyOwner {
    require(address(this).balance > 0, "Nothing to be withdrawn from the smart contract!");
    payable(owner).transfer(address(this).balance);
  }

  function getPets() public view returns (Pet[] memory) {
    return pets;
  }

  function getAdoptionFee() public view returns (uint256) {
    return adoptionFee;
  }

}
