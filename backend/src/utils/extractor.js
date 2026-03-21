const EXTRACT_SERVICE_URL = process.env.EXTRACT_SERVICE_URL || 'http://127.0.0.1:3002';

export async function extractFields(imageBuffer) {
  const formData = new FormData();
  formData.append('image', new Blob([imageBuffer]), 'image');

  const res = await fetch(`${EXTRACT_SERVICE_URL}/extract`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(`extract-service /extract failed: ${err.error}`);
  }

  return res.json();
}
