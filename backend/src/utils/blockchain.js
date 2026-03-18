import { ethers } from 'ethers';

const ABI = [
  "function registerUniversity(address, string, string) external",
  "function issueCredential(bytes32, string) external",
  "function revokeCredential(bytes32) external",
  "function verifyCredential(bytes32) external view returns (bool, bool, address, uint256, uint256)",
  "function isUniversityRegistered(address) external view returns (bool)",
];

export function generateWallet() {
  const wallet = ethers.Wallet.createRandom();
  return { address: wallet.address, privateKey: wallet.privateKey };
}

export function computeCanonicalHash({ studentPseudonymousId, degreeName, program, awardedDate, universityDomain }) {
  const json = JSON.stringify({ awardedDate, degreeName, program, studentPseudonymousId, universityDomain });
  return ethers.keccak256(ethers.toUtf8Bytes(json));
}

export function getProvider() {
  const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
  provider.pollingInterval = 4000; // 4s between polls — avoids Alchemy 429s
  return provider;
}

export function getDeployerSigner() {
  return new ethers.Wallet(process.env.BLOCKCHAIN_DEPLOYER_PRIVATE_KEY, getProvider());
}

export function getUniversitySigner(privateKey) {
  return new ethers.Wallet(privateKey, getProvider());
}

export function getContract(signer) {
  return new ethers.Contract(process.env.BLOCKCHAIN_CONTRACT_ADDRESS, ABI, signer);
}

export async function registerUniversityOnChain(walletAddress, universityId, name) {
  const signer = getDeployerSigner();
  const contract = getContract(signer);
  const tx = await contract.registerUniversity(walletAddress, universityId, name);
  await tx.wait();
  return tx.hash;
}

export async function issueCredentialOnChain(privateKey, canonicalHash, credentialId) {
  const signer = getUniversitySigner(privateKey);
  const contract = getContract(signer);
  const tx = await contract.issueCredential(canonicalHash, credentialId);
  await tx.wait();
  return tx.hash;
}

export async function revokeCredentialOnChain(privateKey, canonicalHash) {
  const signer = getUniversitySigner(privateKey);
  const contract = getContract(signer);
  const tx = await contract.revokeCredential(canonicalHash);
  await tx.wait();
  return tx.hash;
}

export async function fundWallet(toAddress, amountEth = '0.01') {
  const signer = getDeployerSigner();
  const tx = await signer.sendTransaction({
    to: toAddress,
    value: ethers.parseEther(amountEth),
  });
  await tx.wait();
  return tx.hash;
}

export async function verifyCredentialOnChain(canonicalHash) {
  const provider = getProvider();
  const contract = new ethers.Contract(process.env.BLOCKCHAIN_CONTRACT_ADDRESS, ABI, provider);
  const [issued, revoked, issuedBy, issuedAt, revokedAt] = await contract.verifyCredential(canonicalHash);
  return {
    issued,
    revoked,
    issuedBy,
    issuedAt: issuedAt ? new Date(Number(issuedAt) * 1000) : null,
    revokedAt: revokedAt ? new Date(Number(revokedAt) * 1000) : null,
  };
}