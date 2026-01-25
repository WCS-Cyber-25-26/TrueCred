import hre from "hardhat";
const { ethers } = hre;
import crypto from "crypto";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GO UP TWO LEVELS
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);
console.log("RPC_URL:", process.env.RPC_URL);

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // set after deploy
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";

async function main() {
  // Connect to the node
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Contract ABI
  const CredentialABI = (await import("../artifacts/contracts/CredentialRegistry.sol/CredentialRegistry.json", {
    assert: { type: "json" },
  })).abi;

  const contract = new ethers.Contract(CONTRACT_ADDRESS, CredentialABI, wallet);

  // Example student data
  const universityId = "uni123";
  const studentId = "stu456";
  const studentName = "John Doe";
  const degree = "BSc Computer Science";
  const timestamp = Date.now().toString();

  // Step 1: Hash student info
  const studentHash = crypto.createHash("sha256").update(studentName + degree).digest("hex");

  // Step 2: Generate unique credentialId
  const credentialId = crypto.createHash("sha256").update(universityId + studentId + degree + timestamp).digest("hex");

  // Step 3: Add credential on-chain
  const tx = await contract.addCredential("0x" + credentialId, "0x" + studentHash, wallet.address);
  await tx.wait();

  console.log("✅ Credential added successfully!");
  console.log("Credential ID:", credentialId);
  console.log("Student Hash:", studentHash);
}

main().catch(console.error);
