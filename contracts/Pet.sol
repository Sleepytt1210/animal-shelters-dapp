// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

pragma solidity ^0.8.0;

/// @author Dylon Wong Chung Yee
/// @title An adoption contract to facilitate and keep track of adoptions in an animal shelter.
contract Pet is Context, ERC165, IERC721, IERC721Metadata, IERC721Enumerable {
    // Mapping from pet ID to the associated token URI.
    mapping(uint256 => string) private _pets;

    // Mapping from pet ID to the owner address
    mapping(uint256 => address) private _owners;

    // Mapping from owner to list of owned token IDs
    mapping(address => mapping(uint256 => uint256)) private _ownedTokens;

    // Mapping from token ID to index of the owner tokens list
    mapping(uint256 => uint256) private _ownedTokensIndex;

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
     * @dev Initialises the ERC721 token with name Pet and symbol PET.
     */
    constructor() {
        _name = "Pet";
        _symbol = "PET";
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
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IERC721Enumerable).interfaceId ||
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
    function name() public view override returns (string memory) {
        return _name;
    }

    /**
     * @dev Get token symbol.
     *
     * @return Token symbol.
     */
    function symbol() public view override returns (string memory) {
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
        override
        petIDIsValid(petID)
        returns (string memory)
    {
        return _pets[petID];
    }

    /**
     * @dev Get the total number of pets.
     *
     * @return The pet count.
     */
    function totalSupply() public view override returns (uint256) {
        return _petCount;
    }

    /**
     * @dev Get the pet id of an adopter by index.
     */
    function tokenOfOwnerByIndex(address owner, uint256 index)
        public
        view
        override
        returns (uint256)
    {
        require(
            index < balanceOf(owner),
            "ERC721Enumerable: owner index out of bounds"
        );
        return _ownedTokens[owner][index];
    }

    /**
     * @dev Get a pet id by pet index (Pet ID is same as index here).
     */
    function tokenByIndex(uint256 index)
        public
        view
        override
        returns (uint256)
    {
        require(
            index < totalSupply(),
            "ERC721Enumerable: global index out of bounds"
        );
        return index;
    }

    /**
     * @dev Get the token URI of a pet by pet ID.
     */
    function tokenURIByPetID(uint256 petID)
        public
        view
        petIDIsValid(petID)
        returns (string memory)
    {
        return _pets[petID];
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
     * Tokens start existing when they are minted (`_mint`)
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

        _beforeTokenTransfer(address(0), to, petID);

        _balances[to] += 1;
        _owners[petID] = to;

        emit Transfer(address(0), to, petID);
    }

    /**
     * @dev Transfers `petID` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `petID` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
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

    /**
     * @dev Update `tokenURI` of `petID`.
     *
     * @param petID: The pet ID to be updated.
     * @param tokenURI_: New token URI.
     */
    function _setTokenURI(uint256 petID, string memory tokenURI_)
        internal
        petIDIsValid(petID)
    {
        _pets[petID] = tokenURI_;
    }

    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning.
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, ``from``'s `petID` will be
     * transferred to `to`.
     * - When `from` is zero, `petID` will be minted for `to`.
     * - When `to` is zero, ``from``'s `petID` will be burned.
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 petID
    ) internal {
        if (from == address(0)) {
            _addTokenToAllTokensEnumeration();
        } else if (from != to) {
            _removeTokenFromOwnerEnumeration(from, petID);
        }
        if (to != from) {
            _addTokenToOwnerEnumeration(to, petID);
        }
    }

    /**
     * @dev Private function to add a token to this extension's ownership-tracking data structures.
     * @param to address representing the new owner of the given token ID
     * @param petID uint256 ID of the token to be added to the tokens list of the given address
     */
    function _addTokenToOwnerEnumeration(address to, uint256 petID) private {
        uint256 length = balanceOf(to);
        _ownedTokens[to][length] = petID;
        _ownedTokensIndex[petID] = length;
    }

    /**
     * @dev Private function to add a token to this extension's token tracking data structures.
     */
    function _addTokenToAllTokensEnumeration() private {
        _petCount++;
    }

    /**
     * @dev Private function to remove a token from this extension's ownership-tracking data structures. Note that
     * while the token is not assigned a new owner, the `_ownedTokensIndex` mapping is _not_ updated: this allows for
     * gas optimizations e.g. when performing a transfer operation (avoiding double writes).
     * This has O(1) time complexity, but alters the order of the _ownedTokens array.
     * @param from address representing the previous owner of the given token ID
     * @param petID uint256 ID of the token to be removed from the tokens list of the given address
     */
    function _removeTokenFromOwnerEnumeration(address from, uint256 petID)
        private
    {
        // To prevent a gap in from's tokens array, we store the last token in the index of the token to delete, and
        // then delete the last slot (swap and pop).

        uint256 lastTokenIndex = balanceOf(from) - 1;
        uint256 tokenIndex = _ownedTokensIndex[petID];

        // When the token to delete is the last token, the swap operation is unnecessary
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];

            _ownedTokens[from][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
            _ownedTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index
        }

        // This also deletes the contents at the last position of the array
        delete _ownedTokensIndex[petID];
        delete _ownedTokens[from][lastTokenIndex];
    }
}
