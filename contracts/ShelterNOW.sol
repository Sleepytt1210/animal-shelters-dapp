// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @author Dylon Wong Chung Yee
/// @title A ShelterNOW ERC-20 token contract.
contract ShelterNOW is IERC20, Context, Ownable {
    // Reflection balance owned by a user.
    mapping(address => uint256) private _rOwned;

    // Token balance owned by a user
    mapping(address => uint256) private _tOwned;

    // Mapping from token holder address to are they excluded from the reflection.
    mapping(address => bool) private _isExcluded;

    // Mapping from owner to spender to allowance.
    mapping(address => mapping(address => uint256)) private _allowances;

    // A list of excluded addresses.
    address[] private _excluded;

    // Maximum uint256
    uint256 private constant MAX = ~uint256(0);

    // Total token supply, set to 1 billion tokens with 9 decimals.
    uint256 private _tTotal = 1 * 1e9 * 1e9;

    // Total reflection token supply.
    uint256 private _rTotal = (MAX - (MAX % _tTotal));

    // Name of the ERC-20 token.
    string private _name = "ShelterNOW";

    // Symbol of the ERC-20 token.
    string private _symbol = "SNOW";

    // Decimals for display purpose.
    uint8 private _decimals = 9;

    // Tax fee to be collected from a transaction, (4 means 4%)
    uint256 public _taxFee = 4;

    // A record of total tax fee.
    uint256 public _tFeeTotal;

    /**
     * @dev Initializes the contract by setting an initial supply of token.
     */
    constructor() {
        address _owner = _msgSender();
        _rOwned[_owner] = _rTotal;
        emit Transfer(address(0), _owner, _tTotal);
    }

    /**
     * @dev Get the name of this token.
     *
     * @return The name.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Get the symbol of this token.
     *
     * @return The symbol.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Get the decimals of this token collection.
     *
     * @return The decimals.
     */
    function decimals() public view returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Get the total supply of this token collection.
     *
     * @return The total supply.
     */
    function totalSupply() public view override returns (uint256) {
        return _tTotal;
    }

    /**
     * @dev Get the balance of an address.
     *
     * @param account: The address of an account to query.
     *
     * @return The balance.
     */
    function balanceOf(address account) public view override returns (uint256) {
        if (_isExcluded[account]) return _tOwned[account];
        return tokenFromReflection(_rOwned[account]);
    }

    /**
     * @dev Transfer token to another address.
     *
     * @param to: The receipient of the transaction.
     * @param amount: The amount of token to be transferred.
     *
     * @return Successful or not.
     */
    function transfer(address to, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _transfer(_msgSender(), to, amount);
        return true;
    }

    /**
     * @dev Get the allowance approved to a spender of an owner.
     *
     * @param owner: The owner's address to query.
     * @param spender: The spender's address approved by the owner.
     *
     * @return The token spending allowance.
     */
    function allowance(address owner, address spender)
        public
        view
        override
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    /**
     * @dev Approve a spender to spend an amount of allowance.
     *
     * @param spender: The spender's address to be approved.
     * @param amount: The amount of allowance approved by the owner.
     *
     * @return Successful or not.
     */
    function approve(address spender, uint256 amount)
        public
        override
        returns (bool)
    {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20}.
     *
     * NOTE: Does not update the allowance if the current allowance
     * is the maximum `uint256`.
     *
     * Requirements:
     *
     * - `from` and `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     * - the caller must have allowance for ``from``'s tokens of at least
     * `amount`.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        _spendAllowance(from, _msgSender(), amount);
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue)
        public
        virtual
        returns (bool)
    {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        virtual
        returns (bool)
    {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(
            currentAllowance >= subtractedValue,
            "ERC20: decreased allowance below zero"
        );
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Updates `owner` s allowance for `spender` based on spent `amount`.
     *
     * Does not update the allowance amount in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Might emit an {Approval} event.
     */
    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(
                currentAllowance >= amount,
                "ERC20: insufficient allowance"
            );
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    function isExcluded(address account) public view returns (bool) {
        return _isExcluded[account];
    }

    function totalFees() public view returns (uint256) {
        return _tFeeTotal;
    }

    function reflect(uint256 tokenAmount) public {
        address sender = _msgSender();
        require(
            !_isExcluded[sender],
            "Excluded addresses cannot call this function"
        );
        (uint256 reflectionAmount, , , , ) = _getValues(tokenAmount);
        _rOwned[sender] = _rOwned[sender] - reflectionAmount;
        _rTotal = _rTotal - reflectionAmount;
        _tFeeTotal = _tFeeTotal + tokenAmount;
    }

    function reflectionFromToken(uint256 tokenAmount, bool deductTransferFee)
        public
        view
        returns (uint256)
    {
        require(tokenAmount <= _tTotal, "Amount must be less than supply");
        if (!deductTransferFee) {
            (uint256 reflectionAmount, , , , ) = _getValues(tokenAmount);
            return reflectionAmount;
        } else {
            (, uint256 rTransferAmount, , , ) = _getValues(tokenAmount);
            return rTransferAmount;
        }
    }

    function tokenFromReflection(uint256 reflectionAmount)
        public
        view
        returns (uint256)
    {
        require(
            reflectionAmount <= _rTotal,
            "Amount must be less than total reflections"
        );
        uint256 currentRate = _getRate();
        return reflectionAmount / currentRate;
    }

    function excludeAccount(address account) external onlyOwner {
        require(!_isExcluded[account], "Account is already excluded");
        if (_rOwned[account] > 0) {
            _tOwned[account] = tokenFromReflection(_rOwned[account]);
        }
        _isExcluded[account] = true;
        _excluded.push(account);
    }

    function includeAccount(address account) external onlyOwner {
        require(_isExcluded[account], "Account is already included");
        for (uint256 i = 0; i < _excluded.length; i++) {
            if (_excluded[i] == account) {
                _excluded[i] = _excluded[_excluded.length - 1];
                _tOwned[account] = 0;
                _isExcluded[account] = false;
                _excluded.pop();
                break;
            }
        }
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) private {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(amount > 0, "Transfer amount must be greater than zero");
        require(balanceOf(sender) >= amount, "ERC20: Insufficient balance");

        if (_isExcluded[sender] && !_isExcluded[recipient]) {
            _transferFromExcluded(sender, recipient, amount);
        } else if (!_isExcluded[sender] && _isExcluded[recipient]) {
            _transferToExcluded(sender, recipient, amount);
        } else if (!_isExcluded[sender] && !_isExcluded[recipient]) {
            _transferStandard(sender, recipient, amount);
        } else if (_isExcluded[sender] && _isExcluded[recipient]) {
            _transferBothExcluded(sender, recipient, amount);
        } else {
            _transferStandard(sender, recipient, amount);
        }
    }

    function _transferStandard(
        address sender,
        address recipient,
        uint256 tokenAmount
    ) private {
        (
            uint256 reflectionAmount,
            uint256 rTransferAmount,
            uint256 rFee,
            uint256 tTransferAmount,
            uint256 tFee
        ) = _getValues(tokenAmount);
        _rOwned[sender] = _rOwned[sender] - reflectionAmount;
        _rOwned[recipient] = _rOwned[recipient] + rTransferAmount;
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _transferToExcluded(
        address sender,
        address recipient,
        uint256 tokenAmount
    ) private {
        (
            uint256 reflectionAmount,
            uint256 rTransferAmount,
            uint256 rFee,
            uint256 tTransferAmount,
            uint256 tFee
        ) = _getValues(tokenAmount);
        _rOwned[sender] = _rOwned[sender] - reflectionAmount;
        _tOwned[recipient] = _tOwned[recipient] + tTransferAmount;
        _rOwned[recipient] = _rOwned[recipient] + rTransferAmount;
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _transferFromExcluded(
        address sender,
        address recipient,
        uint256 tokenAmount
    ) private {
        (
            uint256 reflectionAmount,
            uint256 rTransferAmount,
            uint256 rFee,
            uint256 tTransferAmount,
            uint256 tFee
        ) = _getValues(tokenAmount);
        _tOwned[sender] = _tOwned[sender] - tokenAmount;
        _rOwned[sender] = _rOwned[sender] - reflectionAmount;
        _rOwned[recipient] = _rOwned[recipient] + rTransferAmount;
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _transferBothExcluded(
        address sender,
        address recipient,
        uint256 tokenAmount
    ) private {
        (
            uint256 reflectionAmount,
            uint256 rTransferAmount,
            uint256 rFee,
            uint256 tTransferAmount,
            uint256 tFee
        ) = _getValues(tokenAmount);
        _tOwned[sender] = _tOwned[sender] - tokenAmount;
        _rOwned[sender] = _rOwned[sender] - reflectionAmount;
        _tOwned[recipient] = _tOwned[recipient] + tTransferAmount;
        _rOwned[recipient] = _rOwned[recipient] + rTransferAmount;
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _reflectFee(uint256 rFee, uint256 tFee) private {
        _rTotal = _rTotal - rFee;
        _tFeeTotal = _tFeeTotal + tFee;
    }

    function _getValues(uint256 tokenAmount)
        private
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        (uint256 tTransferAmount, uint256 tFee) = _getTValues(tokenAmount);
        uint256 currentRate = _getRate();
        (
            uint256 reflectionAmount,
            uint256 rTransferAmount,
            uint256 rFee
        ) = _getRValues(tokenAmount, tFee, currentRate);
        return (reflectionAmount, rTransferAmount, rFee, tTransferAmount, tFee);
    }

    function _getTValues(uint256 tokenAmount)
        private
        view
        returns (uint256, uint256)
    {
        uint256 tFee = (tokenAmount * _taxFee) / 100;
        uint256 tTransferAmount = tokenAmount - tFee;
        return (tTransferAmount, tFee);
    }

    function _getRValues(
        uint256 tokenAmount,
        uint256 tFee,
        uint256 currentRate
    )
        private
        pure
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        uint256 reflectionAmount = tokenAmount * currentRate;
        uint256 rFee = tFee * currentRate;
        uint256 rTransferAmount = reflectionAmount - rFee;
        return (reflectionAmount, rTransferAmount, rFee);
    }

    function _getRate() private view returns (uint256) {
        (uint256 rSupply, uint256 tSupply) = _getCurrentSupply();
        return rSupply / tSupply;
    }

    function _getCurrentSupply() private view returns (uint256, uint256) {
        uint256 rSupply = _rTotal;
        uint256 tSupply = _tTotal;
        for (uint256 i = 0; i < _excluded.length; i++) {
            if (
                _rOwned[_excluded[i]] > rSupply ||
                _tOwned[_excluded[i]] > tSupply
            ) return (_rTotal, _tTotal);
            rSupply = rSupply - _rOwned[_excluded[i]];
            tSupply = tSupply - _tOwned[_excluded[i]];
        }
        if (rSupply < _rTotal / _tTotal) return (_rTotal, _tTotal);
        return (rSupply, tSupply);
    }

    /**
     * @dev Calculate the gross amount subject to tax from a net amount.
     * For example, the net amount is 10000 SNOW not subject to 4% tax, then the gross amount is 10416.67 SNOW.
     * `grossAmount` = `netAmount` * 100 / (100 - `_taxFee`)
     *
     * @param netAmount: The net amount to be cauculated.
     *
     * @return The gross amount required.
     */
    function calculateGrossAmount(uint256 netAmount)
        public
        view
        returns (uint256)
    {
        return (netAmount * 100) / (100 - _taxFee);
    }

    /**
     * @dev Calculate the net amount from a taxed gross amount.
     * For example, the gross amount is 10000 SNOW subject to 4% tax, then the net amount is 9600 SNOW.
     * `netAmount` = `grossAmount` * (100 - `taxFee`) / 100
     *
     * @param grossAmount: The gross amount to be calculated.
     *
     * @return The gross amount required.
     */
    function calculateNetAmount(uint256 grossAmount)
        public
        view
        returns (uint256)
    {
        return (grossAmount * (100 - _taxFee)) / 100;
    }
}
