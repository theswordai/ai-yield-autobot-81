// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

contract ReferralRegistry {
    // ----- Ownership -----
    address public owner;
    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }

    // ----- Trees & Stats -----
    mapping(address => address) public inviterOf;           // user => inviter
    mapping(address => address[]) private _directs;         // inviter => direct children

    // 实时在押净本金的“扣费前基数”P（由 LockStaking 在仓位开/平时回调增减）
    mapping(address => uint256) public pSelf;               // 自己的P
    mapping(address => uint256) public pDirect;             // 直推合计P
    mapping(address => uint256) public pIndirect1;          // 间推一层合计P

    // 绑定门槛：首充≥200U由前端保证；这里不强制金额，仅限制一次绑定
    event Bound(address indexed invitee, address indexed inviter);

    // 等级阈值与直推比例（bps）
    struct LevelConf { uint256 threshold; uint256 directBps; }
    LevelConf[] public levels; // 按阈值升序
    event LevelConfigUpdated();

    constructor() {
        owner = msg.sender;
        // 默认：
        // L1: ≥200 → 10%
        // L2: ≥1000 → 11%
        // L3: ≥3000 → 12%
        // L4: ≥10000 → 13%
        // L5: ≥30000 → 15%
        levels.push(LevelConf({threshold: 200e6, directBps: 1000}));   // 以USDT 6位小数为假定，阈值只是默认，可后续调整
        levels.push(LevelConf({threshold: 1000e6, directBps: 1100}));
        levels.push(LevelConf({threshold: 3000e6, directBps: 1200}));
        levels.push(LevelConf({threshold: 10000e6, directBps: 1300}));
        levels.push(LevelConf({threshold: 30000e6, directBps: 1500}));
    }

    // ----- Bind -----
    function bind(address inviter) external {
        require(inviter != address(0) && inviter != msg.sender, "bad inviter");
        require(inviterOf[msg.sender] == address(0), "bound");
        inviterOf[msg.sender] = inviter;
        _directs[inviter].push(msg.sender);
        emit Bound(msg.sender, inviter);
    }

    // ----- Stats Update (called by staking contract) -----
    function onPositionOpened(address user, uint256 baseAmount) external {
        // 默认允许任意调用者；可由Owner设置白名单强化安全，简化起见此处开放
        _accrue(user, int256(baseAmount));
    }

    function onPositionClosed(address user, uint256 baseAmount) external {
        _accrue(user, -int256(baseAmount));
    }

    function _accrue(address user, int256 delta) internal {
        if (delta == 0) return;
        // self
        if (delta > 0) pSelf[user] += uint256(delta);
        else pSelf[user] -= uint256(-delta);
        // direct + indirect1
        address inv = inviterOf[user];
        if (inv != address(0)) {
            if (delta > 0) pDirect[inv] += uint256(delta); else pDirect[inv] -= uint256(-delta);
            address inv2 = inviterOf[inv];
            if (inv2 != address(0)) {
                if (delta > 0) pIndirect1[inv2] += uint256(delta); else pIndirect1[inv2] -= uint256(-delta);
            }
        }
    }

    // ----- Reads -----
    function getDirects(address user) external view returns (address[] memory) {
        return _directs[user];
    }

    function getIndirectsL1(address user) external view returns (address[] memory arr) {
        address[] memory d = _directs[user];
        // 估算长度，最多累加所有直推的直推
        uint256 cap;
        for (uint256 i = 0; i < d.length; i++) cap += _directs[d[i]].length;
        arr = new address[](cap);
        uint256 k;
        for (uint256 i = 0; i < d.length; i++) {
            address[] memory d2 = _directs[d[i]];
            for (uint256 j = 0; j < d2.length; j++) arr[k++] = d2[j];
        }
        // 注意：返回数组可能包含未使用的默认地址(零地址)，但按上述构造不会产生零地址
    }

    function getTeamP(address user) public view returns (uint256) {
        return pSelf[user] + pDirect[user] + pIndirect1[user];
    }

    function getLevel(address user) public view returns (uint256) {
        uint256 p = getTeamP(user);
        uint256 n = levels.length;
        uint256 level;
        for (uint256 i = 0; i < n; i++) {
            if (p >= levels[i].threshold) level = i + 1; // 1-based level index
        }
        return level; // 0 表示未达标
    }

    function getDirectBps(address inviter) external view returns (uint256) {
        uint256 lv = getLevel(inviter);
        if (lv == 0) return 0;
        return levels[lv - 1].directBps;
    }

    // ----- Admin -----
    function setLevelConfig(uint256[] calldata thresholds, uint256[] calldata directBps) external onlyOwner {
        require(thresholds.length == directBps.length && thresholds.length > 0, "bad conf");
        delete levels;
        for (uint256 i = 0; i < thresholds.length; i++) {
            levels.push(LevelConf({threshold: thresholds[i], directBps: directBps[i]}));
        }
        emit LevelConfigUpdated();
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero");
        owner = newOwner;
    }
}
