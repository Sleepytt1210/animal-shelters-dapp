// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ShelterNOW.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Donation is Ownable {
    // SNOW token contract
    ShelterNOW SNOW;

    // Mapping from donors to respective token donation.
    mapping(address => mapping(Token => uint256)) private _donorToDonation;

    // Uncollected token donations from the contract.
    mapping(Token => uint256) private _uncollectedDonation;

    // Total token donation.
    mapping(Token => uint256) private _totalDonation;

    // Top 3 donors by token.
    mapping(Token => address[3]) private _topDonors;

    // An array of unique donor addresses.
    address[] donors;

    // Type of tokens used, currently only accept SNOW and ETH.
    enum Token {
        SNOW,
        ETH
    }

    // Event emission of successful donation.
    event Donate(address donor, Token tokenType, uint256 amount);

    // Event emission of successful withdrawal.
    event Withdraw(Token tokenType, uint256 amount);

    /**
     * @dev Initialises the Donation smart contract and assign a corresponding SNOW token contract.
     *
     * @param _SNOWAddress: The address to the SNOW token contract.
     */
    constructor(address _SNOWAddress) {
        SNOW = ShelterNOW(_SNOWAddress);
    }

    /**
     * @dev Donate to the animal shelter using SNOW token.
     */
    function donateSNOW(uint256 amount) public {
        require(amount > 0, "Donation: Donation cannot be zero!");
        address donor = msg.sender;

        uint256 netAmount = SNOW.calculateNetAmount(amount);
        _uncollectedDonation[Token.SNOW] += netAmount;
        _donorToDonation[donor][Token.SNOW] += netAmount;
        _totalDonation[Token.SNOW] += netAmount;

        if (_donorIsNew(donor)) donors.push(donor);

        _setTopDonors(donor, Token.SNOW);
        SNOW.transferFrom(donor, address(this), amount);
        emit Donate(donor, Token.SNOW, netAmount);
    }

    /**
     * @dev Donate to the animal shelter using Ethereum.
     */
    function donateETH() public payable {
        uint256 amount = msg.value;
        require(amount > 0, "Donation: Donation cannot be zero!");
        address donor = msg.sender;

        _uncollectedDonation[Token.ETH] += amount;
        _donorToDonation[donor][Token.ETH] += amount;
        _totalDonation[Token.ETH] += amount;

        if (_donorIsNew(donor)) donors.push(donor);

        _setTopDonors(donor, Token.ETH);
        emit Donate(donor, Token.ETH, amount);
    }

    /**
     * @dev Withdraw token from the smart contract to the animal shelter's wallet.
     *
     * @param tokenType: Type of token
     */
    function withdraw(Token tokenType) public payable onlyOwner {
        if (tokenType == Token.ETH) withdrawEther();
        else withdrawSNOW();
    }

    /**
     * @dev Get all donors.
     */
    function getDonors() public view returns (address[] memory) {
        return donors;
    }

    /**
     * @dev Get total amount of donations of a token.
     *
     * @param tokenType: Type of token.
     */
    function getTotalDonation(Token tokenType) public view returns (uint256) {
        return _totalDonation[tokenType];
    }

    /**
     * @dev Get total amount of uncollected donations of a token.
     *
     * @param tokenType: Type of token.
     */
    function getUncollectedDonation(Token tokenType)
        public
        view
        returns (uint256)
    {
        return _uncollectedDonation[tokenType];
    }

    /**
     * @dev Get total amount of donations by a donor of a token.
     *
     * @param tokenType: Type of token.
     */
    function getDonationOfDonor(address donor, Token tokenType)
        public
        view
        returns (uint256)
    {
        return _donorToDonation[donor][tokenType];
    }

    function getTopDonors(Token tokenType)
        public
        view
        returns (
            address,
            address,
            address
        )
    {
        return (
            _topDonors[tokenType][0],
            _topDonors[tokenType][1],
            _topDonors[tokenType][2]
        );
    }

    /**
     * @dev Withdraw ether from the smart contract if any.
     */
    function withdrawEther() internal onlyOwner {
        uint256 amount = _uncollectedDonation[Token.ETH];
        require(
            address(this).balance > 0 && amount > 0,
            "Nothing to be withdrawn from the smart contract!"
        );

        _uncollectedDonation[Token.ETH] = 0;
        payable(owner()).transfer(amount);

        emit Withdraw(Token.ETH, amount);
    }

    /**
     * @dev Withdraw SNOW from the smart contract if any.
     */
    function withdrawSNOW() internal onlyOwner {
        uint256 amount = _uncollectedDonation[Token.SNOW];

        require(amount > 0, "No SNOW to be collected from this contract!");
        _uncollectedDonation[Token.SNOW] = 0;
        SNOW.transfer(owner(), amount);

        emit Withdraw(Token.SNOW, amount);
    }

    /**
     * @dev Update the top donors if the `donor`'s accumulated donation surpasses the current top 3 in the ranking.
     *
     * @param donor: The address of the donor
     * @param tokenType: Type of token in the ranking.
     */
    function _setTopDonors(address donor, Token tokenType) internal {
        require(donor != address(0), "Donation: Address cannot be empty!");
        uint256 amount = _donorToDonation[donor][tokenType];

        (address top1, address top2, address top3) = (
            _topDonors[tokenType][0],
            _topDonors[tokenType][1],
            _topDonors[tokenType][2]
        );

        if (amount < _donorToDonation[top3][tokenType]) return;

        if (amount > _donorToDonation[top1][tokenType]) {
            _topDonors[tokenType][2] = top2;
            _topDonors[tokenType][1] = top1;
            _topDonors[tokenType][0] = donor;
        } else if (amount > _donorToDonation[top2][tokenType]) {
            _topDonors[tokenType][2] = top2;
            _topDonors[tokenType][1] = donor;
        } else if (amount > _donorToDonation[top3][tokenType]) {
            _topDonors[tokenType][2] = donor;
        }
    }

    /**
     * @dev Check if a donor is new to the donation.
     *
     * @param donor: Address of the donor.
     *
     * @return Donor is new or not.
     */
    function _donorIsNew(address donor) internal view returns (bool) {
        return
            _donorToDonation[donor][Token.ETH] == 0 &&
            _donorToDonation[donor][Token.SNOW] == 0;
    }
}
