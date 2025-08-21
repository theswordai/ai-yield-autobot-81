const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const token = process.env.USDT_ADDRESS || "0x55d398326f99059fF775485246999027B3197955"; // default BNBChain USDT
  const feeWallet = process.env.FEE_WALLET || "0x40E34a2bec1Ad145939b8CDcC5FC2854BB68B576";

  const Factory = await hre.ethers.getContractFactory("LockStaking");
  const contract = await Factory.deploy(token, feeWallet);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("LockStaking deployed at:", address);
  console.log("Token:", token);
  console.log("Fee wallet:", feeWallet);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

