const { ethers, network } = require("hardhat");
const fs   = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Network:   ${network.name}`);
  console.log(`Deployer:  ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance:   ${ethers.formatEther(balance)} ETH\n`);

  console.log("Deploying UniversityCredentials…");
  const Factory  = await ethers.getContractFactory("UniversityCredentials");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deployTx        = contract.deploymentTransaction();
  const receipt         = deployTx ? await deployTx.wait() : null;
  const deployedBlock   = receipt?.blockNumber ?? null;

  console.log(`✓ Deployed to:   ${contractAddress}`);
  if (deployTx) {
    console.log(`  Tx hash:       ${deployTx.hash}`);
    console.log(`  Block:         ${deployedBlock}`);
  }

  const registryPath = path.join(__dirname, "../registry.json");
  const registry     = fs.existsSync(registryPath)
    ? JSON.parse(fs.readFileSync(registryPath, "utf8"))
    : {};

  registry[network.name] = {
    ...(registry[network.name] ?? {}),
    UniversityCredentials: contractAddress,
    deployedBlock,
    deployedAt: new Date().toISOString(),
    deployer:   deployer.address,
  };

  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
  console.log(`\n✓ registry.json updated  →  networks.${network.name}.UniversityCredentials`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
