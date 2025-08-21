const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const decimals = 6;
  const supplyStr = process.env.MOCK_USDT_SUPPLY || "1000000000"; // 1,000,000,000 USDT
  const initialSupply = hre.ethers.parseUnits(supplyStr, decimals);

  const Factory = await hre.ethers.getContractFactory("MockUSDT");
  const token = await Factory.deploy(initialSupply);
  await token.waitForDeployment();

  const addr = await token.getAddress();
  console.log("MockUSDT deployed at:", addr);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
