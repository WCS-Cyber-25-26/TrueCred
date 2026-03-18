import vault from 'node-vault';

const client = vault({
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
});

export async function checkVaultHealth() {
  const status = await client.health();
  return status;
}

export async function storePrivateKey(universityId, privateKey) {
  await client.write(`secret/data/universities/${universityId}`, {
    data: { privateKey },
  });
}

export async function getPrivateKey(universityId) {
  const res = await client.read(`secret/data/universities/${universityId}`);
  return res.data.data.privateKey;
}