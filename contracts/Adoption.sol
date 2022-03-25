// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Adoption {

  address public _owner;
  event AdoptionStatus(address _adopter, uint256 _petID, AdoptionState _status);
  mapping(uint256 => address) private _petToAdopter;
  mapping(uint256 => AdoptionState) private _petToAdoptionState;
  mapping(uint256 => Pet) private _pets;
  IERC20 public SNOW;

  uint256 public _adoptionFee;
  uint256 public _petCount;
  // REJECTED, CANCELLED, EUTHANISED and REMOVED are not assignable to the _petToAdoptionState, only for event emission.
  // The other enum shows the state of the pet in the adoption procedure.
  enum AdoptionState{NOTAVAIL, ADOPTABLE, LOCKED, APPROVED, ADOPTED, REJECTED, CANCELLED, EUTHANISED, REMOVED}

  constructor (address _SNOWAddress) {
    _owner = msg.sender;
    _petCount = 0;
    // 0.0000001 Eth
    _adoptionFee = 10 ** 10;
    SNOW = IERC20(_SNOWAddress);
    string[4] memory names = ["Lucky", "Luna", "Momo", "Money"];
    for(uint8 i = 0; i < names.length; i++) {
      if(i & 1 == 0) addPet(names[i], AdoptionState.ADOPTABLE);
      else addPet(names[i], AdoptionState.NOTAVAIL);
    }
  }

  struct Pet {
    uint256 petID;
    string tokenURI;
  }

  modifier onlyOwner {
    require(msg.sender == _owner, "Only _owner can call this function!");
    _;
  }

  modifier petIDIsValid(uint256 _petID) {
    // 4 billion pet id until overload, probably impossible
    require(_petID == uint256(uint32(_petID)), "Pet ID overloads!");
    require(_petID < _petCount, "This pet does not exist!");
    _;
  }

  // The pet is adoptable but not yet adopted.
  modifier petIDIsAvailable(uint256 _petID) {
    // The pet should be an available one.
    require(_petToAdoptionState[_petID] != AdoptionState.NOTAVAIL, "The pet is not available for adoption!");
    // The pet should not be already adopted.
    require(_petToAdoptionState[_petID] != AdoptionState.ADOPTED, "This pet has already been adopted!");
    _;
  }

  // The application is submitted but not yet approved.
  modifier petIDNotReviewed(uint256 _petID) {
    // The pet should be in locked state to be approved.
    require(_petToAdoptionState[_petID] != AdoptionState.APPROVED, "This pet has already been approved for adoption!");
    require(_petToAdoptionState[_petID] == AdoptionState.LOCKED, "This pet is not requested for adoption yet!");
    _;
  }

  modifier onlyApprovedNotConfirmedAdopter(uint256 _petID) {
    // Pet should already be requested for adoption.
    require(_petToAdopter[_petID] != address(0), "The pet has not been requested for adoption yet.");
    // Function caller is not the approved adopter of the pet.
    require(msg.sender == _petToAdopter[_petID], "The pet has been requested for adoption by another adopter.");
    require(_petToAdoptionState[_petID] != AdoptionState.ADOPTED, "This pet has already been adopted!");
    // The pet is either adopted or removed if not locked.
    require(_petToAdoptionState[_petID] == AdoptionState.APPROVED, "This pet is not approved for adoption!");
    _;
  }

  function addPet(string memory _name, AdoptionState _newStatus) public onlyOwner returns(uint256) {
    require(_newStatus == AdoptionState.ADOPTABLE || _newStatus == AdoptionState.NOTAVAIL, "Adoption status must be either adoptable or not available");

    uint256 newPetID = _petCount;
    require(newPetID == uint256(uint32(newPetID)));

    _pets[newPetID] = Pet({
    petID: newPetID,
    tokenURI: _name
    });

    if(_newStatus == AdoptionState.ADOPTABLE) _petToAdoptionState[newPetID] = AdoptionState.ADOPTABLE;

    _petCount++;
    return newPetID;
  }

  // Adopting a pet
  function requestAdoption(uint256 _petID) public petIDIsValid(_petID) petIDIsAvailable(_petID) {
    require(_petToAdoptionState[_petID] == AdoptionState.ADOPTABLE, "This pet is not ADOPTABLE for adoption!");
    _petToAdopter[_petID] = msg.sender;
    _petToAdoptionState[_petID] = AdoptionState.LOCKED;
    emit AdoptionStatus(msg.sender, _petID, AdoptionState.LOCKED);
  }

  // Approve an adoption application request
  function approveAdoption(address _adopter, uint256 _petID) public onlyOwner petIDIsValid(_petID) petIDIsAvailable(_petID) petIDNotReviewed(_petID) {
    _petToAdoptionState[_petID] = AdoptionState.APPROVED;
    emit AdoptionStatus(_adopter, _petID, AdoptionState.APPROVED);
  }

  // Reject an adoption application request
  function rejectAdoption(address _adopter, uint256 _petID) public onlyOwner petIDIsValid(_petID) petIDIsAvailable(_petID) petIDNotReviewed(_petID) {
    resetAdoption(_adopter, _petID, AdoptionState.REJECTED);
  }

  // Cancel an approved adoption
  function cancelAdoption(uint256 _petID) public petIDIsValid(_petID) petIDIsAvailable(_petID) onlyApprovedNotConfirmedAdopter(_petID) {
    resetAdoption(msg.sender, _petID, AdoptionState.CANCELLED);
  }

  // Reset a pet adoption to the default state
  function resetAdoption(address _adopter, uint256 _petID, AdoptionState _reason) private {
    _petToAdoptionState[_petID] = AdoptionState.ADOPTABLE;
    _petToAdopter[_petID] = address(0);
    emit AdoptionStatus(_adopter, _petID, _reason);
  }

  // Confirm adoption
  function confirmAdoption(uint256 _petID) public payable petIDIsValid(_petID) petIDIsAvailable(_petID) onlyApprovedNotConfirmedAdopter(_petID) {
    require(msg.value >= _adoptionFee, "The adoption fee is insufficient!");
    address adopter = msg.sender;

    _petToAdoptionState[_petID] = AdoptionState.ADOPTED;

    emit AdoptionStatus(adopter, _petID, AdoptionState.ADOPTED);
  }

  function withdraw() public payable onlyOwner {
    require(address(this).balance > 0, "Nothing to be withdrawn from the smart contract!");
    payable(_owner).transfer(address(this).balance);
  }

  function getOwner() public view returns (address) {
    return _owner;
  }

  function getAdoptionFee() public view returns (uint256) {
    return _adoptionFee;
  }

  function getPetCount() public view returns (uint256) {
    return _petCount;
  }

  function getPets() public view returns (Pet[] memory) {
    Pet[] memory result = new Pet[](_petCount);
    for(uint i = 0; i < _petCount; i++) {
      result[i] = _pets[i];
    }
    return result;
  }

  function getAdoptablePets() public view returns (Pet[] memory) {
    Pet[] memory holder = new Pet[](_petCount);
    uint256 filterCount = 0;
    for(uint i = 0; i < _petCount; i++) {
      if(_petToAdoptionState[i] == AdoptionState.ADOPTABLE) {
        holder[filterCount] = _pets[i];
        filterCount++;
      }
    }

    Pet[] memory result = new Pet[](filterCount);
    for(uint i = 0; i < filterCount; i++) {
      result[i] = holder[i];
    }

    return result;
  }

  // Get the assigned adopter of a pet can be empty.
  function getAdopterOfPet(uint256 _petID) public view petIDIsValid(_petID) returns(address) {
    return _petToAdopter[_petID];
  }

  // Get the adoption state of a pet (including non available one)
  function getAdoptionStateOfPet(uint256 _petID) public view petIDIsValid(_petID) returns(AdoptionState) {
    return _petToAdoptionState[_petID];
  }

  // Set a pet to be adoptable from a not adoptable state.
  function setPetAdoptable(uint256 _petID) public onlyOwner petIDIsValid(_petID) {
    require(_petToAdoptionState[_petID] != AdoptionState.ADOPTED, "The pet is already adopted!");
    require(_petToAdoptionState[_petID] == AdoptionState.NOTAVAIL, "The pet is already adoptable!");
    _petToAdoptionState[_petID] = AdoptionState.ADOPTABLE;
    emit AdoptionStatus(_owner, _petID, AdoptionState.ADOPTABLE);
  }

  // Set a pet to not available in the adoption option with given reason.
  function setPetNotAdoptable(uint256 _petID, AdoptionState _reason) public petIDIsValid(_petID) onlyOwner {
    require(_petToAdoptionState[_petID] != AdoptionState.NOTAVAIL && _petToAdoptionState[_petID] != AdoptionState.ADOPTED, "The pet is already not adoptable!");
    require(_reason == AdoptionState.REMOVED || _reason == AdoptionState.EUTHANISED, "The state should be a removal state!");

    // Simply set the status to one of the removal status and remove the adopter if exist.
    _petToAdoptionState[_petID] = AdoptionState.NOTAVAIL;

    // Only change state if adopter is set to save gas fee.
    if(_petToAdopter[_petID] != address(0)) _petToAdopter[_petID] = address(0);

    emit AdoptionStatus(_owner, _petID, _reason);
  }

}
