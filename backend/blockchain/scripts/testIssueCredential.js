const { ethers, network } = require("hardhat");
const fs   = require("fs");
const path = require("path");

const MAX_TX_COST_ETH = 0.005;

async function estimateAndCheck(description, txPromise) {
  const { gasEstimate, gasPriceWei, costEth } = await txPromise();

  console.log(`      Gas estimate:  ${gasEstimate.toLocaleString()} units`);
  console.log(`      Gas price:     ${ethers.formatUnits(gasPriceWei, "gwei")} gwei`);
  console.log(`      Est. cost:     ${costEth} ETH`);

  if (parseFloat(costEth) > MAX_TX_COST_ETH) {
    throw new Error(
      `Transaction aborted: estimated cost ${costEth} ETH exceeds cap of ${MAX_TX_COST_ETH} ETH`
    );
  }
  return costEth;
}

async function estimateTx(contract, method, args) {
  const feeData     = await contract.runner.provider.getFeeData();
  const gasPriceWei = feeData.gasPrice ?? feeData.maxFeePerGas ?? 0n;
  const gasEstimate = await contract[method].estimateGas(...args);
  const costWei     = gasEstimate * gasPriceWei;
  const costEth     = parseFloat(ethers.formatEther(costWei)).toFixed(6);
  return { gasEstimate, gasPriceWei, costEth };
}

async function main() {
  const registryPath    = path.join(__dirname, "../registry.json");
  const registry        = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const contractAddress = registry[network.name]?.UniversityCredentials;

  if (!contractAddress) {
    throw new Error(
      `No contract address in registry.json for network "${network.name}". Run deploy first.`
    );
  }

  const [signer] = await ethers.getSigners();
  const contract  = await ethers.getContractAt("UniversityCredentials", contractAddress, signer);

  const balance = await ethers.provider.getBalance(signer.address);

  console.log("=".repeat(60));
  console.log("Network:        ", network.name);
  console.log("Contract:       ", contractAddress);
  console.log("Signer:         ", signer.address);
  console.log("Balance:        ", ethers.formatEther(balance), "ETH");
  console.log("Max tx cost cap:", MAX_TX_COST_ETH, "ETH per transaction");
  console.log("=".repeat(60));

  const alreadyRegistered = await contract.isUniversityRegistered(signer.address);

  if (alreadyRegistered) {
    console.log("\n[skip] Signer already registered as a university.");
  } else {
    console.log("\n[1/3] Registering signer as a test university…");
    const testUniversityId = "00000000-0000-0000-0000-000000000001";

    await estimateAndCheck("registerUniversity", () =>
      estimateTx(contract, "registerUniversity", [signer.address, testUniversityId, "Test University"])
    );

    const tx = await contract.registerUniversity(signer.address, testUniversityId, "Test University");
    console.log("      Tx sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("      ✓ Confirmed in block", receipt.blockNumber);
    if (network.name === "sepolia") {
      console.log("      Etherscan:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
    }
  }

  const testCredentialId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
  const canonicalJson    = JSON.stringify({
    studentPseudonymousId: "student-pseudo-001",
    degreeName:            "Bachelor of Science in Computer Science",
    program:               "Computer Science",
    awardedDate:           "2024-05-15",
    universityDomain:      "testuniversity.edu",
  });

  const canonicalHash = ethers.keccak256(ethers.toUtf8Bytes(canonicalJson));

  console.log("\n[2/3] Issuing credential…");
  console.log("      Canonical JSON:", canonicalJson);
  console.log("      keccak256 hash:", canonicalHash);

  const existing = await contract.verifyCredential(canonicalHash);
  if (existing.issued) {
    console.log("      [skip] Already anchored on-chain.");
  } else {
    await estimateAndCheck("issueCredential", () =>
      estimateTx(contract, "issueCredential", [canonicalHash, testCredentialId])
    );

    const tx2 = await contract.issueCredential(canonicalHash, testCredentialId);
    console.log("      Tx sent:", tx2.hash);
    const receipt2 = await tx2.wait();
    console.log("      ✓ Confirmed in block", receipt2.blockNumber);
    if (network.name === "sepolia") {
      console.log("      Etherscan:", `https://sepolia.etherscan.io/tx/${tx2.hash}`);
    }
  }

  console.log("\n[3/3] Verifying on-chain…");
  const result = await contract.verifyCredential(canonicalHash);

  console.log("\n" + "=".repeat(60));
  console.log("  issued:   ", result.issued);
  console.log("  revoked:  ", result.revoked);
  console.log("  issuedBy: ", result.issuedBy);
  console.log("  issuedAt: ", new Date(Number(result.issuedAt) * 1000).toISOString());
  if (network.name === "sepolia") {
    console.log("\n  View contract:");
    console.log(" ", `https://sepolia.etherscan.io/address/${contractAddress}`);
  }
  console.log("=".repeat(60));
  console.log("\n✓ Credential is live on", network.name);
}

main().catch((err) => {
  console.error("\n✗", err.message);
  process.exitCode = 1;
});
