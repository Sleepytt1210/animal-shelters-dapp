// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Context.sol";

pragma solidity ^0.8.0;

/// @author Dylon Wong Chung Yee
/// @title An adoption contract to facilitate and keep track of adoptions in an animal shelter.
contract Pet is Context, ERC165, IERC721 {
    // Mapping from pet ID to the associated token URI.
    mapping(uint256 => string) private _pets;

    // Mapping from pet ID to adopter address
    mapping(uint256 => address) private _owners;

    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    // Mapping owner address to pet count
    mapping(address => uint256) private _balances;

    // Mapping from pet ID to approved address
    mapping(uint256 => address) private _petApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Number of pets added.
    uint256 private _petCount;

    /**
     * @dev Initializes the contract by setting a token contract address to the adoption contract.
     * This contract should be excluded from the reflection such that it does not get taxed for refund.
     *
     * @param name_: The token name.
     * @param symbol_: The token symbol.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Ensure a pet ID parameter pass to a function is valid.
     */
    modifier petIDIsValid(uint256 petID) {
        // 4 billion pet id until overload, probably impossible
        require(petID == uint256(uint32(petID)), "Pet ID overloads!");
        require(_exists(petID), "ERC721: approved query for nonexistent pet");
        _;
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
    function getPets() public view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](_petCount);
        for (uint256 i = 0; i < _petCount; i++) {
            result[i] = i;
        }
        return result;
    }

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC165, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC721).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc IERC721
     */
    function balanceOf(address owner) public view override returns (uint256) {
        require(
            owner != address(0),
            "ERC721: balance query for the zero address"
        );
        return _balances[owner];
    }

    /**
     * @inheritdoc IERC721
     */
    function ownerOf(uint256 petID) public view override returns (address) {
        address owner = _owners[petID];
        require(owner != address(0), "ERC721: owner query for nonexistent pet");
        return owner;
    }

    /**
     * @dev Get token name.
     *
     * @return Token name.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Get token symbol.
     *
     * @return Token symbol.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Get token URI.
     *
     * @return Token URI.
     */
    function tokenURI(uint256 petID)
        public
        view
        petIDIsValid(petID)
        returns (string memory)
    {
        return _pets[petID];
    }

    /**
     * @dev Get the number of pets.
     *
     * @return The pet count.
     */
    function petCount() public view returns (uint256) {
        return _petCount;
    }

    /**
     * @dev Get the entire pets record in the animal shelter.
     *
     * @return The pets record.
     */
    function pets() public view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](_petCount);
        for (uint256 i = 0; i < _petCount; i++) {
            result[i] = i;
        }
        return result;
    }

    /**
     * @inheritdoc IERC721
     */
    function approve(address to, uint256 petID) public override {
        address owner = ownerOf(petID);
        require(to != owner, "ERC721: approval to current owner");

        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721: approve caller is not owner nor approved for all"
        );

        _approve(to, petID);
    }

    /**
     * @inheritdoc IERC721
     */
    function getApproved(uint256 petID)
        public
        view
        override
        petIDIsValid(petID)
        returns (address)
    {
        return _petApprovals[petID];
    }

    /**
     * @inheritdoc IERC721
     */
    function setApprovalForAll(address operator, bool approved)
        public
        override
    {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @inheritdoc IERC721
     */
    function isApprovedForAll(address owner, address operator)
        public
        view
        override
        returns (bool)
    {
        return _operatorApprovals[owner][operator];
    }

    /**
     * @inheritdoc IERC721
     */
    function transferFrom(
        address from,
        address to,
        uint256 petID
    ) public override {
        //solhint-disable-next-line max-line-length
        require(
            _isApprovedOrOwner(_msgSender(), petID),
            "ERC721: transfer caller is not owner nor approved"
        );

        _transfer(from, to, petID);
    }

    /**
     * @inheritdoc IERC721
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 petID
    ) public override {
        safeTransferFrom(from, to, petID, "");
    }

    /**
     * @inheritdoc IERC721
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 petID,
        bytes memory _data
    ) public override {
        require(
            _isApprovedOrOwner(_msgSender(), petID),
            "ERC721: transfer caller is not owner nor approved"
        );
        _transfer(from, to, petID);
    }

    /**
     * @dev Returns whether `petID` exists.
     *
     * Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
     *
     * Tokens start existing when they are minted (`_mint`),
     * and stop existing when they are burned (`_burn`).
     */
    function _exists(uint256 petID) internal view returns (bool) {
        return _owners[petID] != address(0);
    }

    /**
     * @dev Returns whether `spender` is allowed to manage `petID`.
     *
     * Requirements:
     *
     * - `petID` must exist.
     */
    function _isApprovedOrOwner(address spender, uint256 petID)
        internal
        view
        returns (bool)
    {
        require(_exists(petID), "ERC721: operator query for nonexistent pet");
        address owner = ownerOf(petID);
        return (spender == owner ||
            isApprovedForAll(owner, spender) ||
            getApproved(petID) == spender);
    }

    /**
     * @dev Mints `petID` and transfers it to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible
     *
     * Requirements:
     *
     * - `petID` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(address to, uint256 petID) internal {
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(petID), "ERC721: pet already minted");

        _balances[to] += 1;
        _owners[petID] = to;

        _petCount++;

        emit Transfer(address(0), to, petID);
    }

    function _transfer(
        address from,
        address to,
        uint256 petID
    ) internal {
        require(
            ownerOf(petID) == from,
            "ERC721: transfer from incorrect owner"
        );
        require(to != address(0), "ERC721: transfer to the zero address");

        // Clear approvals from the previous owner
        _approve(address(0), petID);

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[petID] = to;

        emit Transfer(from, to, petID);
    }

    /**
     * @dev Approve `to` to operate on `petID`
     *
     * Emits a {Approval} event.
     */
    function _approve(address to, uint256 petID) internal {
        _petApprovals[petID] = to;
        emit Approval(ownerOf(petID), to, petID);
    }

    /**
     * @dev Approve `operator` to operate on all of `owner` pets
     *
     * Emits a {ApprovalForAll} event.
     */
    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    ) internal {
        require(owner != operator, "ERC721: approve to caller");
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }

    function _setTokenURI(uint256 petID, string memory tokenURI_) internal {
        _pets[petID] = tokenURI_;
    }
}
