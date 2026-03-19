import vault from 'node-vault';

const client = vault({
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
  namespace: process.env.VAULT_NAMESPACE || 'admin',
});

export async function checkVaultHealth() {
  const status = await client.health();
  return status;
}

export async function initVault() {
  try {
    const mounts = await client.mounts();
    if (!mounts['secret/']) {
      await client.mount({
        mount_point: 'secret',
        type: 'kv',
        options: { version: '2' },
      });
      console.log('Vault: KV v2 engine mounted at secret/');
    }
  } catch (e) {
    console.warn('Vault: could not verify/mount KV engine:', e.message);
  }
}

export async function hasPrivateKey(universityId) {
  try {
    await client.read(`secret/data/universities/${universityId}`);
    return true;
  } catch {
    return false;
  }
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