// SPDX-License-Identifier: MIT

import "./ShelterNOW.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Pet.sol";

pragma solidity ^0.8.0;

/// @author Dylon Wong Chung Yee
/// @title An adoption contract to facilitate and keep track of adoptions in an animal shelter.
contract Adoption is Ownable, Pet {
    // Mapping from pet ID to temporary adopter.
    mapping(uint256 => address) private _tempAdopters;

    // Mapping from adopters to their deposit.
    mapping(address => uint256) private _adopterToDeposit;

    // Mapping from pet ID to the pet's adoption state.
    mapping(uint256 => AdoptionState) private _petToAdoptionState;

    // An adoption fee to be paid upon confirmation.
    uint256 private _adoptionFee;

    // An adoption fee to be paid upon confirmation.
    uint256 private _netAdoptionFee;

    // A refund fee for a successful adoption.
    uint256 private _refundFee;

    // A refund fee for a unsuccessful adoption.
    uint256 private _penaltyRefundFee;

    // SNOW decimals;
    uint8 private _decimals;

    // The contract address to the SNOW.
    ShelterNOW public SNOW;

    /// REJECTED, CANCELLED, EUTHANISED and REMOVED are not assignable to the _petToAdoptionState, only for event emission.
    /// The other enum shows the state of the pet in the adoption procedure.
    enum AdoptionState {
        NOTAVAIL,
        ADOPTABLE,
        LOCKED,
        APPROVED,
        ADOPTED,
        REJECTED,
        CANCELLED,
        EUTHANISED,
        REMOVED
    }

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
    constructor(address _SNOWAddress) {
        SNOW = ShelterNOW(_SNOWAddress);
        _decimals = SNOW.decimals();

        /// An adoption fee to be paid upon confirmation, defaults to 10000 SNOW (without decimals) gross amount.
        /// 4% of the adoption fee will be taxed.
        _adoptionFee = _normaliseSNOW(1 * 10**4);

        _netAdoptionFee = SNOW.calculateNetAmount(_adoptionFee);

        // A refund fee for a successful adoption, defaults to 5000 SNOW gross amount.
        _refundFee = SNOW.calculateNetAmount(_normaliseSNOW(5 * 10**3));

        // A refund fee for a unsuccessful adoption, defaults to 2000 SNOW gross amount.
        _penaltyRefundFee = SNOW.calculateNetAmount(_normaliseSNOW(2 * 10**3));
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
    function addPet(string memory URI_, AdoptionState newStatus)
        public
        onlyOwner
        returns (uint256)
    {
        require(
            newStatus == AdoptionState.ADOPTABLE ||
                newStatus == AdoptionState.NOTAVAIL,
            "Adoption status must be either adoptable or not available"
        );

        uint256 newPetID = totalSupply();
        require(newPetID == uint256(uint32(newPetID)), "Pet ID overflow!");

        _mint(owner(), newPetID);
        setTokenURI(newPetID, URI_);

        _petToAdoptionState[newPetID] = newStatus;

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
    function requestAdoption(uint256 petID) public petIDIsValid(petID) {
        require(
            _petToAdoptionState[petID] == AdoptionState.ADOPTABLE,
            "Not available for adoption!"
        );

        address adopter = msg.sender;

        _adopterToDeposit[adopter] += _netAdoptionFee;
        _petToAdoptionState[petID] = AdoptionState.LOCKED;

        _tempAdopters[petID] = adopter;

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
    {
        require(
            _petToAdoptionState[petID] == AdoptionState.LOCKED,
            "Not requested for adoption yet!"
        );

        require(_adopterMatches(adopter, petID), "Pet does not match adopter!");

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
    function rejectAdoption(address adopter, uint256 petID) public onlyOwner {
        require(
            _petToAdoptionState[petID] == AdoptionState.LOCKED,
            "Not requested for adoption yet!"
        );

        require(_adopterMatches(adopter, petID), "Pet does not match adopter!");

        _resetAdoption(
            adopter,
            petID,
            AdoptionState.ADOPTABLE,
            AdoptionState.REJECTED
        );
    }

    /**
     * @dev Cancel an approved adoption. This function should be called by an adopter.
     * The adopter can cancel their adoptiona at anytime between approval and confirmation.
     * The pet will be set to adoptable state and removed from the associated adopter.
     *
     * @param petID: The pet adoption to be cancelled.
     */
    function cancelAdoption(uint256 petID) public petIDIsValid(petID) {
        // The pet must be approved.
        require(
            _petToAdoptionState[petID] == AdoptionState.APPROVED,
            "This pet is not approved for adoption!"
        );

        require(
            _adopterMatches(msg.sender, petID),
            "Pet does not match adopter!"
        );

        _resetAdoption(
            msg.sender,
            petID,
            AdoptionState.ADOPTABLE,
            AdoptionState.CANCELLED
        );
    }

    /**
     * @dev Confirm an approved adoption application request. The requires the approveAdoption to be called on the adoption before.
     * This function receives optional tip from the adopter upon confirmation.
     * The pet will be set back to `ADOPTED` state and this function will emit a `ADOPTED` status.
     * Total amount received by the animal shelter is `_adoptionFee + tipAmount - _refundFee`
     *
     * If a tip is paid, the `TipsReceived` event will be emitted.
     *
     * NOTE: The {SNOW.approve} function is needed here for payment of the adoption fee (See line 166).
     * The allowance should be same as `amount` including tips.
     *
     * @param petID: The pet ID applied for adoption.
     * @param tipAmount: The amount of tip fee to be paid by the adopter.
     */
    function confirmAdoption(uint256 petID, uint256 tipAmount)
        public
        petIDIsValid(petID)
    {
        // The pet must be approved.
        require(
            _petToAdoptionState[petID] == AdoptionState.APPROVED,
            "Not approved for adoption!"
        );

        address adopter = msg.sender;

        require(_adopterMatches(adopter, petID), "Pet does not match adopter!");

        _petToAdoptionState[petID] = AdoptionState.ADOPTED;
        _adopterToDeposit[adopter] -= _netAdoptionFee;

        safeTransferFrom(owner(), adopter, petID);

        SNOW.transfer(adopter, _refundFee);
        SNOW.transfer(owner(), _netAdoptionFee + tipAmount - _refundFee);

        if (tipAmount > 0) {
            emit TipsReceived(adopter, petID, tipAmount);
        }
        emit AdoptionStatus(adopter, petID, AdoptionState.ADOPTED);
    }

    /**
     * @dev Withdraw money from the smart contract if any.
     */
    function withdraw() public payable onlyOwner {
        require(
            address(this).balance > 0,
            "Nothing to be withdrawn from the smart contract!"
        );
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
     * @dev Get the adoption state of a pet (including non available one).
     *
     * @param petID: The pet ID to be queried.
     *
     * @return The adoption state.
     */
    function getAdoptionStateOfPet(uint256 petID)
        public
        view
        petIDIsValid(petID)
        returns (AdoptionState)
    {
        return _petToAdoptionState[petID];
    }

    /**
     * @dev Get the amount of deposit locked of an adopter.
     *
     * @param adopter: The adopter to query.
     *
     * @return The total deposit locked.
     */
    function getAdopterDeposit(address adopter) public view returns (uint256) {
        return _adopterToDeposit[adopter];
    }

    /**
     * @dev Set a pet to be adoptable from a not adoptable state. Only owner can call this function.
     *
     * @param petID: The pet ID to be queried.
     *
     */
    function setPetAdoptable(uint256 petID)
        public
        onlyOwner
        petIDIsValid(petID)
    {
        require(
            _petToAdoptionState[petID] != AdoptionState.ADOPTED,
            "The pet is already adopted!"
        );
        require(
            _petToAdoptionState[petID] == AdoptionState.NOTAVAIL,
            "The pet is already adoptable!"
        );
        _petToAdoptionState[petID] = AdoptionState.ADOPTABLE;
        emit AdoptionStatus(owner(), petID, AdoptionState.ADOPTABLE);
    }

    /**
     * @dev Set the token URI of a pet.
     *
     * @param petID: Pet ID to be modified.
     * @param tokenURI_: Token URI to be set.
     */
    function setTokenURI(uint256 petID, string memory tokenURI_)
        public
        petIDIsValid(petID)
        onlyOwner
    {
        require(
            _petToAdoptionState[petID] != AdoptionState.ADOPTED ||
                _petToAdoptionState[petID] != AdoptionState.EUTHANISED
        );
        _setTokenURI(petID, tokenURI_);
    }

    /**
     * @dev Add decimals to the base amount of SNOW.
     *
     * @param amount: Amount of SNOW to be normalised.
     *
     * @return SNOW with 9 decimals.
     */
    function _normaliseSNOW(uint256 amount) internal view returns (uint256) {
        return amount * (10**_decimals);
    }

    /**
     * @dev Check if given adopter matches the pet ID.
     *
     * @param adopter: The adopter's address.
     * @param petID: The pet ID adopted.
     *
     * @return Match or not.
     */
    function _adopterMatches(address adopter, uint256 petID)
        internal
        view
        petIDIsValid(petID)
        returns (bool)
    {
        // Pet should exists.
        require(_tempAdopters[petID] != address(0), "Pet does not exist.");
        return _tempAdopters[petID] == adopter;
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
     * @param reason: The reason of pet adoption reset.
     */
    function _resetAdoption(
        address adopter,
        uint256 petID,
        AdoptionState status,
        AdoptionState reason
    ) private {
        require(
            reason == AdoptionState.REMOVED ||
                reason == AdoptionState.EUTHANISED ||
                reason == AdoptionState.CANCELLED ||
                reason == AdoptionState.REJECTED,
            "The reason should be a removal state!"
        );
        require(
            status == AdoptionState.NOTAVAIL ||
                status == AdoptionState.ADOPTABLE,
            "The status should be a removal state!"
        );

        address owner_ = owner();

        _tempAdopters[petID] = owner_;
        _adopterToDeposit[adopter] -= _netAdoptionFee;
        _petToAdoptionState[petID] = status;
        if (
            reason == AdoptionState.CANCELLED ||
            reason == AdoptionState.REJECTED
        ) {
            SNOW.transfer(adopter, _penaltyRefundFee);
            SNOW.transfer(owner_, (_netAdoptionFee - _penaltyRefundFee));
        } else {
            if (adopter != owner_)
                SNOW.transfer(adopter, SNOW.calculateNetAmount(_adoptionFee));
        }

        emit AdoptionStatus(adopter, petID, reason);
    }
}
