// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

contract RewardsVault {
    IERC20 public immutable token; // USDT
    address public owner;
    mapping(address => bool) public authorized; // 可记账方（例如 LockStaking）

    mapping(address => uint256) public claimable; // 可提余额

    event Accrued(address indexed to1, address indexed to2, uint256 r1, uint256 r2);
    event Claimed(address indexed user, uint256 amount);
    event AuthorizedUpdated(address indexed caller, bool allowed);

    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }
    modifier onlyAuth() { require(authorized[msg.sender], "not auth"); _; }

    constructor(address token_) {
        require(token_ != address(0), "zero");
        token = IERC20(token_);
        owner = msg.sender;
    }

    // ----- Accrue from staking -----
    function accrue(address to1, address to2, uint256 r1, uint256 r2) external onlyAuth {
        if (to1 != address(0) && r1 > 0) claimable[to1] += r1;
        if (to2 != address(0) && r2 > 0) claimable[to2] += r2;
        emit Accrued(to1, to2, r1, r2);
    }

    // ----- User claim -----
    function claim() external returns (uint256 paid) {
        uint256 amt = claimable[msg.sender];
        require(amt > 0, "no rewards");

        uint256 bal = token.balanceOf(address(this));
        if (bal >= amt) {
            claimable[msg.sender] = 0;
            require(token.transfer(msg.sender, amt), "transfer failed");
            paid = amt;
        } else if (bal > 0) {
            // 部分支付，剩余保留
            claimable[msg.sender] = amt - bal;
            require(token.transfer(msg.sender, bal), "transfer failed");
            paid = bal;
        } else {
            // 无余额，等待owner补仓
            paid = 0;
        }
        emit Claimed(msg.sender, paid);
    }

    function pendingRewards(address user) external view returns (uint256) {
        return claimable[user];
    }

    // ----- Admin -----
    function setAuthorized(address caller, bool allowed) external onlyOwner {
        authorized[caller] = allowed;
        emit AuthorizedUpdated(caller, allowed);
    }

    function sweep(address to, uint256 amount) external onlyOwner {
        require(token.transfer(to, amount), "transfer failed");
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero");
        owner = newOwner;
    }
}
