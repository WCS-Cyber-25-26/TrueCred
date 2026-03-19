
const { ethers, network } = require("hardhat");
const fs   = require("fs");
const path = require("path");

async function main() {
  const universityAddress = process.env.UNIVERSITY_ADDRESS;
  const universityId      = process.env.UNIVERSITY_ID;
  const universityName    = process.env.UNIVERSITY_NAME;

  if (!universityAddress || !universityId || !universityName) {
    throw new Error(
      "Missing required environment variables.\n" +
      "Provide: UNIVERSITY_ADDRESS, UNIVERSITY_ID, UNIVERSITY_NAME"
    );
  }

  if (!ethers.isAddress(universityAddress)) {
    throw new Error(`UNIVERSITY_ADDRESS is not a valid Ethereum address: ${universityAddress}`);
  }

  const registryPath = path.join(__dirname, "../registry.json");

  if (!fs.existsSync(registryPath)) {
    throw new Error(
      "registry.json not found. Run `deploy.js` first to deploy the contract."
    );
  }

  const registry        = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const contractAddress = registry[network.name]?.UniversityCredentials;

  if (!contractAddress) {
    throw new Error(
      `No UniversityCredentials address found in registry.json for network "${network.name}". ` +
      "Run deploy.js first."
    );
  }

  const [signer] = await ethers.getSigners();
  console.log(`Network:          ${network.name}`);
  console.log(`Signer (owner):   ${signer.address}`);
  console.log(`Contract:         ${contractAddress}\n`);

  const contract = await ethers.getContractAt(
    "UniversityCredentials",
    contractAddress,
    signer
  );

  const contractOwner = await contract.owner();
  if (signer.address.toLowerCase() !== contractOwner.toLowerCase()) {
    throw new Error(
      `Signer ${signer.address} is not the contract owner (${contractOwner}). ` +
      "Only the owner can register universities."
    );
  }

  const alreadyRegistered = await contract.isUniversityRegistered(universityAddress);
  if (alreadyRegistered) {
    console.warn(`⚠  ${universityAddress} is already registered on-chain. Nothing to do.`);
    return;
  }

  console.log(`Registering university "${universityName}"…`);
  const tx = await contract.registerUniversity(
    universityAddress,
    universityId,
    universityName
  );
  console.log(`  Tx sent:  ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`  Confirmed in block ${receipt.blockNumber}`);

  registry[network.name].universities = registry[network.name].universities ?? {};
  registry[network.name].universities[universityId] = {
    address:      universityAddress,
    name:         universityName,
    registeredAt: new Date().toISOString(),
    txHash:       tx.hash,
  };

  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");

  console.log(`\n✓ University "${universityName}" registered on-chain`);
  console.log(`  DB UUID:  ${universityId}`);
  console.log(`  Wallet:   ${universityAddress}`);
  console.log(`  registry.json updated`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
