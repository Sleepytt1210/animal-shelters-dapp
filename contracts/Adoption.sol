// SPDX-License-Identifier: MIT

import "./ShelterNOW.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.8.0;

/// @author Dylon Wong Chung Yee
/// @title An adoption contract to facilitate and keep track of adoptions in an animal shelter.
contract Adoption is Ownable {

  // A Pet struct that represents a pet, the metadata is stored in the tokenURI variable.
  struct Pet {
    uint256 petID;
    string tokenURI;
  }

  // Mapping from pet ID to the associated pet struct.
  mapping(uint256 => Pet) private _pets;

  // Mapping from pet ID to the associated adopter.
  mapping(uint256 => address) private _petToAdopter;

  // Mapping from pet ID to the pet's adoption state.
  mapping(uint256 => AdoptionState) private _petToAdoptionState;

  // Mapping from adopters to their deposit.
  mapping(address => uint256) private _adopterToDeposit;

  // Number of pets added.
  uint256 private _petCount;

  // An adoption fee to be paid upon confirmation.
  uint256 private _adoptionFee;

  // A refund fee for a successful adoption.
  uint256 private _refundFee;

  // A refund fee for a unsuccessful adoption.
  uint256 private _penaltyRefundFee;

  uint8 private _decimals;

  // The contract address to the SNOW.
  ShelterNOW public SNOW;

  /// REJECTED, CANCELLED, EUTHANISED and REMOVED are not assignable to the _petToAdoptionState, only for event emission.
  /// The other enum shows the state of the pet in the adoption procedure.
  enum AdoptionState{NOTAVAIL, ADOPTABLE, LOCKED, APPROVED, ADOPTED, REJECTED, CANCELLED, EUTHANISED, REMOVED}

  // An event to notify stage changes of an animal.
  event AdoptionStatus(address adopter, uint256 petID, AdoptionState status);

  // An event to notify tips received from adoption fee.
  event TipsReceived(address adopter, uint256 petID, uint256 amount);


  /**
   * @dev Initializes the contract by setting a token contract address to the adoption contract.
   * This contract should be excluded from the reflection such that it does not get taxed for refund.
   *
   * @param _SNOWAddress: The address to the SNOW token contract.
   */
  constructor (address _SNOWAddress) {
    _petCount = 0;

    SNOW = ShelterNOW(_SNOWAddress);
    _decimals = SNOW.decimals();

    /// An adoption fee to be paid upon confirmation, defaults to 10000 SNOW (without decimals) gross amount.
    /// 4% of the adoption fee will be taxed.
    _adoptionFee = _normaliseSNOW(1 * 10 ** 4);

    // A refund fee for a successful adoption, defaults to 5000 SNOW gross amount.
    _refundFee = SNOW.calculateNetAmount(_normaliseSNOW(5 * 10 ** 3));

    // A refund fee for a unsuccessful adoption, defaults to 2000 SNOW gross amount.
    _penaltyRefundFee =  SNOW.calculateNetAmount(_normaliseSNOW(2 * 10 ** 3));

    string[4] memory names = ["Lucky", "Luna", "Momo", "Money"];
    for(uint8 i = 0; i < names.length; i++) {
      if(i & 1 == 0) addPet(names[i], AdoptionState.ADOPTABLE);
      else addPet(names[i], AdoptionState.NOTAVAIL);
    }
  }

  /**
  * @dev Ensure a pet ID parameter pass to a function is valid.
  */
  modifier petIDIsValid(uint256 petID) {
    // 4 billion pet id until overload, probably impossible
    require(petID == uint256(uint32(petID)), "Pet ID overloads!");
    require(petID < _petCount, "This pet does not exist!");
    _;
  }

  /**
  * @dev Ensure a pet is available for adoption, which excludes `NOTAVAIL` and `ADOPTED`.
  */
  modifier petIDIsAvailable(uint256 petID) {
    // The pet should be an available one.
    require(_petToAdoptionState[petID] != AdoptionState.NOTAVAIL, "The pet is not available for adoption!");
    // The pet should not be already adopted.
    require(_petToAdoptionState[petID] != AdoptionState.ADOPTED, "This pet has already been adopted!");
    _;
  }

  /**
  * @dev Ensure the pet adoption application is submitted but not yet approved.
  */
  modifier petIDNotReviewed(uint256 petID) {
    // The pet should be in locked state to be approved.
    require(_petToAdoptionState[petID] != AdoptionState.APPROVED, "This pet has already been approved for adoption!");
    require(_petToAdoptionState[petID] == AdoptionState.LOCKED, "This pet is not requested for adoption yet!");
    _;
  }

  /**
  * @dev Ensure a pet is approved for adoption but not confirmed to be fully adopted.
  */
  modifier onlyApprovedNotConfirmedAdopter(uint256 petID) {
    require(_petToAdoptionState[petID] != AdoptionState.ADOPTED, "This pet has already been adopted!");
    // The pet is either adopted or removed if not locked.
    require(_petToAdoptionState[petID] == AdoptionState.APPROVED, "This pet is not approved for adoption!");
    _;
  }

  /**
  * @dev Ensure the pet ID matches the adopter associated.
  */
  modifier adopterIsMatch(address adopter, uint256 petID) {
    // Pet should already be requested for adoption.
    require(_petToAdopter[petID] != address(0), "The pet has not been requested for adoption yet.");
    // The address of adopter must match the adopter who submitted the adoption request.
    require(adopter == _petToAdopter[petID], "The pet ID does not match the adopter!");
    _;
  }

  /**
   * @dev Add a new pet to the blockchain.
   * The pet must be set to either adoptable or not.
   * This function should only be called by the animal shelter.
   *
   * @param URI_: An URI that links to the metadata of the pet.
   * @param newStatus: The status of adoption of the new pet.
   * @return An ID of the new pet added.
   */
  function addPet(string memory URI_, AdoptionState newStatus) public onlyOwner returns(uint256) {
    require(newStatus == AdoptionState.ADOPTABLE || newStatus == AdoptionState.NOTAVAIL,
    "Adoption status must be either adoptable or not available");

    uint256 newPetID = _petCount;
    require(newPetID == uint256(uint32(newPetID)), "Pet ID overflow!");

    _pets[newPetID] = Pet({
      petID: newPetID,
      tokenURI: URI_
    });

    _petToAdoptionState[newPetID] = newStatus;

    _petCount++;
    return newPetID;
  }

  /**
  * @dev Request a pet to be adopted. The pet must be in an adoptable status. 
  * Besides that a fixed amount of deposit will be collected to prevent abusive request application.
  *
  * **NOTE**: The adopter must approve the contract as a spender with an allowance as the `_adoptionFee`,
  * to perform a successful transaction via ERC-20 standard.
  * This should be done in the front-end using the SNOW contract directly
  * because `msg.sender` will be the adoption contract if {SNOW.approve} is called here.
  *
  * @param petID: The pet ID to be adopted.
  */
  function requestAdoption(uint256 petID) public petIDIsValid(petID) petIDIsAvailable(petID) {
    require(_petToAdoptionState[petID] == AdoptionState.ADOPTABLE, "This pet is not available for adoption!");
    address adopter = msg.sender;

    _adopterToDeposit[adopter] = _adoptionFee;

    _petToAdopter[petID] = adopter;
    _petToAdoptionState[petID] = AdoptionState.LOCKED;

    SNOW.transferFrom(adopter, address(this), _adoptionFee);
    
    emit AdoptionStatus(adopter, petID, AdoptionState.LOCKED);
  }

  /**
  * @dev Approve an adoption request.
  * The pet must be requested for adoption and still in LOCKED state.
  * This suggests that the pet is still waiting for an approval.
  * This function also requires the `adopter` parameter to match the actual adopter requesting.
  * This function should only be called by the animal shelter.
  *
  * @param adopter: The address of the adopter.
  * @param petID: The pet ID to be adopted.
  */
  function approveAdoption(address adopter, uint256 petID)
    public
    onlyOwner
    petIDIsValid(petID)
    petIDIsAvailable(petID)
    petIDNotReviewed(petID)
    adopterIsMatch(adopter, petID)
  {
    _petToAdoptionState[petID] = AdoptionState.APPROVED;
    emit AdoptionStatus(adopter, petID, AdoptionState.APPROVED);
  }

  /**
  * @dev Reject an adoption application request. The requirements of this function is same as `approveAdoption`.
  * This action is at the same phase as `approveAdoption` in the adoption procedure.
  * The pet will be set back to `ADOPTABLE` state and this function will emit a `REJECTED` status.
  * The pet will also be removed from the associated adopter.
  *
  * @param adopter: The adopter who applied for adoption.
  * @param petID: The associated pet ID applied for adoption.
  */
  function rejectAdoption(
    address adopter,
    uint256 petID
  )
    public
    onlyOwner
    petIDIsValid(petID)
    petIDIsAvailable(petID)
    petIDNotReviewed(petID)
    adopterIsMatch(adopter, petID)
  {
    resetAdoption(adopter, petID, AdoptionState.REJECTED);
  }

  /**
  * @dev Cancel an approved adoption. This function should be called by an adopter.
  * The adopter can cancel their adoptiona at anytime between approval and confirmation.
  * The pet will be set to adoptable state and removed from the associated adopter.
  *
  * @param petID: The pet adoption to be cancelled.
  */
  function cancelAdoption(uint256 petID)
    public
    petIDIsValid(petID)
    petIDIsAvailable(petID)
    onlyApprovedNotConfirmedAdopter(petID)
    adopterIsMatch(msg.sender, petID)
  {
    resetAdoption(msg.sender, petID, AdoptionState.CANCELLED);
  }

  /**
  * @dev Reset an adoption application request back to adoptable state.
  * The pet will be set back to `ADOPTABLE` state and this function will emit either `CANCELLED` or `REJECTED` status.
  * The pet will also be removed from the associated adopter. 
  * The adopter will be refunded a small amount of SNOW as stated in `_penaltyRefundFee`, 
  * the rest is donated to the animal shelter as a penalty.
  *
  * @param adopter: The adopter who applied for adoption.
  * @param petID: The associated pet ID applied for adoption.
  */
  function resetAdoption(address adopter, uint256 petID, AdoptionState reason) private {
    
    _petToAdoptionState[petID] = AdoptionState.ADOPTABLE;
    _petToAdopter[petID] = address(0);

    _adopterToDeposit[adopter] -= _adoptionFee;
    SNOW.transfer(adopter, _penaltyRefundFee);
    SNOW.transfer(owner(), (SNOW.calculateNetAmount(_adoptionFee) - _penaltyRefundFee));

    emit AdoptionStatus(adopter, petID, reason);
  }

  /**
  * @dev Confirm an approved adoption application request. The requires the approveAdoption to be called on the adoption before.
  * This function receives optional tip from the adopter upon confirmation.
  * The pet will be set back to `ADOPTED` state and this function will emit a `ADOPTED` status.
  * Total amount received by the animal shelter is `_adoptionFee + tipAmount - _refundFee`
  * 
  * If a tip is paid, the `TipsReceived` event will be emitted.
  *
  * **NOTE**: The {SNOW.approve} function is needed here for payment of the adoption fee (See line 166). 
  * The allowance should be same as `amount` including tips.
  *
  * @param petID: The pet ID applied for adoption.
  * @param tipAmount: The amount of tip fee to be paid by the adopter.
  */
  function confirmAdoption(
    uint256 petID,
    uint256 tipAmount
  )
    public
    petIDIsValid(petID)
    petIDIsAvailable(petID)
    onlyApprovedNotConfirmedAdopter(petID)
    adopterIsMatch(msg.sender, petID)
  { 
    address adopter = msg.sender;

    _petToAdoptionState[petID] = AdoptionState.ADOPTED;

    _adopterToDeposit[adopter] -= _adoptionFee;
    
    SNOW.transfer(adopter, _refundFee);
    SNOW.transfer(owner(), SNOW.calculateNetAmount(_adoptionFee) + tipAmount - _refundFee);
    

    if(tipAmount > 0) {
      emit TipsReceived(adopter, petID, tipAmount);
    }
    emit AdoptionStatus(adopter, petID, AdoptionState.ADOPTED);
  }

  /**
  * @dev Withdraw money from the smart contract if any.
  */
  function withdraw() public payable onlyOwner {
    require(address(this).balance > 0, "Nothing to be withdrawn from the smart contract!");
    payable(owner()).transfer(address(this).balance);
  }

  /**
  * @dev Get the adoption fee of the animal shelter.
  *
  * @return The adoption fee.
  */
  function getAdoptionFee() public view returns (uint256) {
    return _adoptionFee;
  }

  /**
  * @dev Get the number of pets in the animal shelter.
  *
  * @return The pet count.
  */
  function getPetCount() public view returns (uint256) {
    return _petCount;
  }

  /**
  * @dev Get the entire pets record in the animal shelter.
  *
  * @return The pets record.
  */
  function getPets() public view returns (Pet[] memory) {
    Pet[] memory result = new Pet[](_petCount);
    for(uint i = 0; i < _petCount; i++) {
      result[i] = _pets[i];
    }
    return result;
  }

  /**
  * @dev Get the pets that are adoptable in the animal shelter.
  *
  * @return The adoptable pets record.
  */
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

  /**
  * @dev Get the associated adopter of a pet (can be an empty address).
  *
  * @param petID: The pet ID to be queried.
  *
  * @return The address of the adopter.
  */
  function getAdopterOfPet(uint256 petID) public view petIDIsValid(petID) returns(address) {
    return _petToAdopter[petID];
  }

  /**
  * @dev Get the adoption state of a pet (including non available one).
  *
  * @param petID: The pet ID to be queried.
  *
  * @return The adoption state.
  */
  function getAdoptionStateOfPet(uint256 petID) public view petIDIsValid(petID) returns(AdoptionState) {
    return _petToAdoptionState[petID];
  }

  /**
  * @dev Get the adoption record of the function caller.
  *
  * @param includeAdopting: To include adoption which has not confirmed yet.
  *
  * @return The adoption state.
  */
  function getMyAdoption(bool includeAdopting) public view returns(Pet[] memory) {
    Pet[] memory holder = new Pet[](_petCount);
    uint256 filterCount = 0;
    for(uint i = 0; i < _petCount; i++) {
      if(_petToAdopter[i] == msg.sender && (_petToAdoptionState[i] == AdoptionState.ADOPTED || (includeAdopting && _petToAdoptionState[i] != AdoptionState.NOTAVAIL))) {
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

  /**
  * @dev Get the amount of deposit locked of an adopter.
  *
  * @param adopter: The adopter to query.
  *
  * @return The total deposit locked.
  */
  function getAdopterDeposit(address adopter) public view returns(uint256) {
    return _adopterToDeposit[adopter];
  }

  /**
  * @dev Set a pet to be adoptable from a not adoptable state. Only owner can call this function.
  *
  * @param petID: The pet ID to be queried.
  *
  */
  function setPetAdoptable(uint256 petID) public onlyOwner petIDIsValid(petID) {
    require(_petToAdoptionState[petID] != AdoptionState.ADOPTED, "The pet is already adopted!");
    require(_petToAdoptionState[petID] == AdoptionState.NOTAVAIL, "The pet is already adoptable!");
    _petToAdoptionState[petID] = AdoptionState.ADOPTABLE;
    emit AdoptionStatus(owner(), petID, AdoptionState.ADOPTABLE);
  }

  /**
  * @dev Set a pet to not available in the adoption option with given reason.
  * A pet could be just removed from option or maybe euthanised. Only owner can call this function.
  *
  * @param petID: The pet ID to be queried.
  * @param reason: Reason of a pet to be removed (i.e. REMOVED or EUTHANISED).
  */
  function setPetNotAdoptable(uint256 petID, AdoptionState reason) public petIDIsValid(petID) onlyOwner {
    require(_petToAdoptionState[petID] != AdoptionState.NOTAVAIL && _petToAdoptionState[petID] != AdoptionState.ADOPTED, "The pet is already not adoptable!");
    require(reason == AdoptionState.REMOVED || reason == AdoptionState.EUTHANISED, "The state should be a removal state!");

    // Simply set the status to one of the removal status and remove the adopter if exist.
    _petToAdoptionState[petID] = AdoptionState.NOTAVAIL;

    // Only change state if adopter is set to save gas fee.
    if(_petToAdopter[petID] != address(0)) _petToAdopter[petID] = address(0);

    emit AdoptionStatus(owner(), petID, reason);
  }

  /**
  * @dev Add decimals to the base amount of SNOW.
  *
  * @param amount: Amount of SNOW to be normalised.
  *
  * @return SNOW with 9 decimals.
  */
  function _normaliseSNOW(uint256 amount) internal view returns(uint256) {
    return amount * (10 ** _decimals);
  }

}
