// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ShelterNOW.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Donation is Ownable {
    // SNOW token contract
    ShelterNOW SNOW;

    // Mapping from donors to respective token donation.
    mapping(address => mapping(Token => uint256)) private _donorToDonation;

    // Total token donation.
    mapping(Token => uint256) private _totalDonation;

    // An array of unique donor addresses.
    address[] donors;

    // Type of tokens used, currently only accept SNOW and ETH.
    enum Token {
        SNOW,
        ETH
    }

    // Event emission of successful donation.
    event Donate(
        address donor,
        Token tokenType,
        uint256 amount,
        string message
    );

    // Event emission of successful withdrawal.
    event Withdraw(Token tokenType, uint256 amount);

    /**
     * @dev Initialises the Donation smart contract and assign a corresponding SNOW token contract.
     *
     */
    constructor(address _SNOWaddr) {
        SNOW = ShelterNOW(_SNOWaddr);
    }

    /**
     * @dev Donate to the animal shelter using SNOW token.
     *
     * @param amount Amount of SNOW to be donated.
     * @param message Short message about the donation.
     */
    function donateSNOW(uint256 amount, string memory message) public {
        require(amount > 0, "Donation: Donation cannot be zero!");
        address donor = msg.sender;

        _donorToDonation[donor][Token.SNOW] += amount;
        _totalDonation[Token.SNOW] += amount;

        if (_donorIsNew(donor)) donors.push(donor);
        if (bytes(message).length == 0) message = "None";
        emit Donate(donor, Token.SNOW, amount, message);

        SNOW.transferFrom(donor, owner(), amount);
    }

    /**
     * @dev Donate to the animal shelter using Ethereum.
     *
     * @param message Short message about the donation.
     */
    function donateETH(string memory message) public payable {
        uint256 amount = msg.value;
        require(amount > 0, "Donation: Donation cannot be zero!");
        address donor = msg.sender;

        _donorToDonation[donor][Token.ETH] += amount;
        _totalDonation[Token.ETH] += amount;

        if (_donorIsNew(donor)) donors.push(donor);
        if (bytes(message).length == 0) message = "None";
        emit Donate(donor, Token.ETH, amount, message);

        payable(owner()).transfer(amount);
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

    /**
     * @dev Withdraw ether from the smart contract if any.
     */
    function withdrawEther() internal onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(
            contractBalance > 0,
            "Nothing to be withdrawn from the smart contract!"
        );

        emit Withdraw(Token.ETH, contractBalance);

        payable(owner()).transfer(contractBalance);
    }

    /**
     * @dev Withdraw SNOW from the smart contract if any.
     */
    function withdrawSNOW() internal onlyOwner {
        uint256 contractBalance = SNOW.balanceOf(address(this));
        require(
            contractBalance > 0,
            "No SNOW to be collected from this contract!"
        );

        emit Withdraw(Token.SNOW, contractBalance);

        SNOW.transfer(owner(), contractBalance);
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
