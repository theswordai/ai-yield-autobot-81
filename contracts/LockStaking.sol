// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

interface IReferralRegistry {
    function inviterOf(address user) external view returns (address);
    function onPositionOpened(address user, uint256 baseAmount) external;
    function onPositionClosed(address user, uint256 baseAmount) external;
    function getDirectBps(address inviter) external view returns (uint256);
}

interface IRewardsVault {
    function accrue(address to1, address to2, uint256 r1, uint256 r2) external;
}

contract LockStaking {
    // ----- Config -----
    IERC20 public immutable token;           // USDT
    address public feeWallet;                // 管理费钱包
    address public owner;                    // owner

    // External modules (optional)
    IReferralRegistry public registry;       // 推荐关系与等级
    IRewardsVault public rewardsVault;       // 奖励金库

    uint256 public constant BPS_DENOMINATOR = 10_000; // 10000 = 100%
    uint256 public constant FEE_BPS = 100;            // 1%
    uint256 public constant EARLY_PENALTY_BPS = 4_000; // 40%

    // 锁仓选项
    enum Lock { ThreeMonths, SixMonths, TwelveMonths }

    // 年化范围(bps)
    struct Range { uint256 minBps; uint256 maxBps; }

    // 用户仓位
    struct Position {
        address user;
        uint256 principal;       // 锁仓本金
        uint256 startTime;       // 开始时间
        uint256 lastClaimTime;   // 上次领取收益时间
        uint256 lockDuration;    // 锁仓时长（秒）
        uint256 aprBps;          // 固定年化（bps），由锁仓档位决定（固定日化×365）
        bool principalWithdrawn; // 是否已提取本金（提前或到期）
    }

    uint256 public nextPositionId = 1;
    mapping(uint256 => Position) public positions; // posId => Position
    mapping(address => uint256[]) public userPositions; // 用户的所有posId

    // 记录每个仓位的“扣费前基数”（用于推荐统计与定级）
    mapping(uint256 => uint256) public principalBaseOf; // posId => base amount (before 1% fee)

    // 200 USDT 最小起投，按代币精度计算
    uint256 public immutable minDeposit;

    // ----- Events -----
    event Deposited(address indexed user, uint256 indexed posId, uint256 amount, uint256 fee, uint8 lockChoice, uint256 aprBps);
    event Claimed(address indexed user, uint256 indexed posId, uint256 amount);
    event Withdrawn(address indexed user, uint256 indexed posId, uint256 principalReturned, uint256 penalty);
    event EmergencyWithdraw(address indexed to, uint256 amount);
    event FeeWalletUpdated(address indexed newWallet);
    event ReferralAccrued(address indexed to1, address indexed to2, uint256 r1, uint256 r2);

    // ----- Modifiers -----
    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }

    uint256 private _status; // simple reentrancy guard: 0=uninit, 1=entered, 2=not entered
    modifier nonReentrant() {
        require(_status != 1, "reentrancy");
        _status = 1;
        _;
        _status = 2;
    }

    constructor(address token_, address feeWallet_) {
        require(token_ != address(0) && feeWallet_ != address(0), "zero addr");
        token = IERC20(token_);
        feeWallet = feeWallet_;
        owner = msg.sender;
        _status = 2;

        uint8 dec = IERC20(token_).decimals();
        minDeposit = 200 * (10 ** dec);
    }

    // ----- View helpers -----
    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }

    function getLockDuration(uint8 lockChoice) public pure returns (uint256) {
        if (lockChoice == uint8(Lock.ThreeMonths)) return 90 days;   // 3个月
        if (lockChoice == uint8(Lock.SixMonths))   return 180 days;  // 6个月
        if (lockChoice == uint8(Lock.TwelveMonths))return 365 days;  // 1年
        revert("invalid lock");
    }

    function getFixedAprBps(uint8 lockChoice) public pure returns (uint256) {
        // 固定日化：3/6/12月分别为 0.25% / 0.4% / 1%
        // 年化(bps) = 日化(bps) * 365
        if (lockChoice == uint8(Lock.ThreeMonths)) return 25 * 365;   // 0.25%/day -> 91.25% APR -> 9125 bps
        if (lockChoice == uint8(Lock.SixMonths))   return 40 * 365;   // 0.4%/day  -> 146% APR   -> 14600 bps
        if (lockChoice == uint8(Lock.TwelveMonths))return 100 * 365;  // 1%/day    -> 365% APR   -> 36500 bps
        revert("invalid lock");
    }

    function pendingYield(uint256 posId) public view returns (uint256) {
        Position memory p = positions[posId];
        if (p.user == address(0) || p.principalWithdrawn) return 0;
        if (p.lastClaimTime == 0) return 0;
        uint256 elapsed = block.timestamp - p.lastClaimTime;
        // 非复投线性APR：principal * aprBps/10000 * (elapsed / 365天)
        // 为避免精度损失，先乘后除
        uint256 yearly = (p.principal * p.aprBps) / BPS_DENOMINATOR; // 每年收益
        uint256 reward = (yearly * elapsed) / 365 days;
        return reward;
    }

    // ----- Core -----
    function deposit(uint256 amount, uint8 lockChoice) external nonReentrant returns (uint256 posId) {
        require(amount >= minDeposit, "amount < 200");
        uint256 lockDuration = getLockDuration(lockChoice);

        // 从用户转入全额
        require(token.transferFrom(msg.sender, address(this), amount), "transferFrom failed");

        // 1% 管理费立刻打给管理费钱包
        uint256 fee = (amount * FEE_BPS) / BPS_DENOMINATOR;
        if (fee > 0) {
            require(token.transfer(feeWallet, fee), "fee transfer failed");
        }

        uint256 principal = amount - fee; // 剩余进入合约作为本金

        // 固定日化：0.25%/0.4%/1% -> 年化 bps = 日bps*365
        uint256 aprBps = getFixedAprBps(lockChoice);

        posId = nextPositionId++;
        positions[posId] = Position({
            user: msg.sender,
            principal: principal,
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            lockDuration: lockDuration,
            aprBps: aprBps,
            principalWithdrawn: false
        });
        userPositions[msg.sender].push(posId);

        // 记录扣费前基数并更新推荐统计
        principalBaseOf[posId] = amount;
        if (address(registry) != address(0)) {
            registry.onPositionOpened(msg.sender, amount);

            // 计算与记账推荐奖励（基于扣费前基数）
            address inv = registry.inviterOf(msg.sender);
            if (inv != address(0)) {
                address inv2 = registry.inviterOf(inv);
                uint256 directBps = registry.getDirectBps(inv);
                uint256 r1 = (amount * directBps) / BPS_DENOMINATOR;
                uint256 r2 = r1 / 10; // 二级=直推的10%
                if (address(rewardsVault) != address(0)) {
                    rewardsVault.accrue(inv, inv2, r1, r2);
                    emit ReferralAccrued(inv, inv2, r1, r2);
                }
            }
        }

        emit Deposited(msg.sender, posId, amount, fee, lockChoice, aprBps);
    }

    function claim(uint256 posId) public nonReentrant returns (uint256 amountOut) {
        Position storage p = positions[posId];
        require(p.user == msg.sender, "not owner");
        require(!p.principalWithdrawn, "principal withdrawn");

        amountOut = pendingYield(posId);
        require(amountOut > 0, "nothing to claim");

        p.lastClaimTime = block.timestamp;
        require(token.transfer(msg.sender, amountOut), "claim transfer failed");
        emit Claimed(msg.sender, posId, amountOut);
    }

    function withdraw(uint256 posId) external nonReentrant {
        Position storage p = positions[posId];
        require(p.user == msg.sender, "not owner");
        require(!p.principalWithdrawn, "already withdrawn");

        // 先把未领取收益结算并转给用户（不罚息）
        uint256 reward = pendingYield(posId);
        if (reward > 0) {
            p.lastClaimTime = block.timestamp;
            require(token.transfer(msg.sender, reward), "reward transfer failed");
            emit Claimed(msg.sender, posId, reward);
        }

        uint256 principalToUser;
        uint256 penalty;
        if (block.timestamp >= p.startTime + p.lockDuration) {
            // 到期，无罚金
            principalToUser = p.principal;
        } else {
            // 提前赎回，罚40%本金 -> 管理费钱包
            penalty = (p.principal * EARLY_PENALTY_BPS) / BPS_DENOMINATOR;
            principalToUser = p.principal - penalty;
            if (penalty > 0) {
                require(token.transfer(feeWallet, penalty), "penalty transfer failed");
            }
        }

        p.principalWithdrawn = true;
        uint256 principalCache = p.principal;
        p.principal = 0; // 停止继续计息

        if (principalToUser > 0) {
            require(token.transfer(msg.sender, principalToUser), "principal transfer failed");
        }
        emit Withdrawn(msg.sender, posId, principalToUser, penalty);

        // 更新推荐统计：扣费前基数出仓
        if (address(registry) != address(0)) {
            uint256 baseAmt = principalBaseOf[posId];
            if (baseAmt > 0) {
                registry.onPositionClosed(msg.sender, baseAmt);
                principalBaseOf[posId] = 0;
            }
        }

        // principalCache 仅用于避免栈深问题的可读性，无转账
        principalCache;
    }

    // ----- Admin -----
    function setRegistry(address reg) external onlyOwner {
        registry = IReferralRegistry(reg);
    }

    function setRewardsVault(address vaultAddr) external onlyOwner {
        rewardsVault = IRewardsVault(vaultAddr);
    }

    function setFeeWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "zero");
        feeWallet = newWallet;
        emit FeeWalletUpdated(newWallet);
    }

    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(token.transfer(msg.sender, amount), "emergency transfer failed");
        emit EmergencyWithdraw(msg.sender, amount);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero");
        owner = newOwner;
    }
}
