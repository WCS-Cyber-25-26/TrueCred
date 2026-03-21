import crypto from 'crypto';
import prisma from '../../prisma/client.js';
import bcrypt from 'bcrypt';
import {signJwt} from '../utils/jwt.js';
import { hasPrivateKey, storePrivateKey, getPrivateKey, hasRsaPrivateKey, storeRsaPrivateKey } from '../utils/vault.js';
import { generateWallet, registerUniversityOnChain, fundWallet } from '../utils/blockchain.js';

async function ensureWallet(userId) {
  console.log(`[ensureWallet] Starting for userId: ${userId}`);

  const university = await prisma.university.findUnique({
    where: { userId },
    select: { id: true, name: true, blockchainId: true, chainEnabled: true },
  });

  if (!university) {
    console.log(`[ensureWallet] No university found for userId: ${userId}`);
    return;
  }

  console.log(`[ensureWallet] University: ${university.id} | chainEnabled: ${university.chainEnabled} | blockchainId: ${university.blockchainId}`);

  const keyExists = await hasPrivateKey(university.id);
  console.log(`[ensureWallet] Key in Vault: ${keyExists}`);

  if (university.chainEnabled && keyExists) {
    console.log(`[ensureWallet] Wallet set up — checking RSA key`);
    const rsaKeyExists = await hasRsaPrivateKey(university.id);
    if (!rsaKeyExists) {
      console.log(`[ensureWallet] RSA key missing — generating now`);
      const { publicKey, privateKey: rsaPrivateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 4096 });
      await storeRsaPrivateKey(university.id, rsaPrivateKey.export({ type: 'pkcs8', format: 'pem' }));
      await prisma.university.update({
        where: { id: university.id },
        data: { rsaPublicKey: publicKey.export({ type: 'spki', format: 'pem' }) },
      });
      console.log(`[ensureWallet] RSA key generated and stored`);
    }
    return;
  }

  let address, privateKey;
  if (keyExists) {
    console.log(`[ensureWallet] Key exists but chainEnabled=false — reusing existing wallet`);
    privateKey = await getPrivateKey(university.id);
    address = university.blockchainId;
    console.log(`[ensureWallet] Reusing address: ${address}`);
  } else {
    console.log(`[ensureWallet] No key found — generating new wallet`);
    ({ address, privateKey } = generateWallet());
    console.log(`[ensureWallet] New wallet address: ${address}`);
    await storePrivateKey(university.id, privateKey);
    console.log(`[ensureWallet] Private key stored in Vault`);
  }

  console.log(`[ensureWallet] Registering on-chain...`);
  await registerUniversityOnChain(address, university.id, university.name);
  console.log(`[ensureWallet] Registered on-chain`);

  console.log(`[ensureWallet] Funding wallet...`);
  await fundWallet(address);
  console.log(`[ensureWallet] Wallet funded`);

  await prisma.university.update({
    where: { id: university.id },
    data: { blockchainId: address, chainEnabled: true },
  });
  console.log(`[ensureWallet] Done — university ${university.id} is chain-enabled`);

  // Ensure RSA signing key exists — generate once and store if missing
  const rsaKeyExists = await hasRsaPrivateKey(university.id);
  if (!rsaKeyExists) {
    console.log(`[ensureWallet] RSA key missing — generating now`);
    const { publicKey, privateKey: rsaPrivateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 4096 });
    await storeRsaPrivateKey(university.id, rsaPrivateKey.export({ type: 'pkcs8', format: 'pem' }));
    await prisma.university.update({
      where: { id: university.id },
      data: { rsaPublicKey: publicKey.export({ type: 'spki', format: 'pem' }) },
    });
    console.log(`[ensureWallet] RSA key generated and stored`);
  }
}

const authService = {
    async login({email, password}) {
        const user = await prisma.user.findUnique({ where: {email}});
        if (!user) throw new Error('Invalid credentials');

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) throw new Error('Invalid credentials');

        const token = signJwt({
            sub: user.id,
            role: user.role,
            email: user.email
        })

        if (user.role === 'UNIVERSITY') {
            ensureWallet(user.id).catch(e =>
                console.error('Wallet generation on login failed:', e.message)
            );
        }

        return token;
    },
}

export default authService;
