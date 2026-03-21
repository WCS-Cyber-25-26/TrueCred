import sharp from 'sharp';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:9000';

async function cropFooter(imageBuffer) {
  const metadata = await sharp(imageBuffer).metadata();
  const { width, height } = metadata;
  const croppedHeight = Math.floor(height * 0.92);
  return sharp(imageBuffer)
    .extract({ top: 0, left: 0, width, height: croppedHeight })
    .toBuffer();
}

export async function getAiScore(imageBuffer) {
  let croppedBuffer;
  try {
    croppedBuffer = await cropFooter(imageBuffer);
  } catch {
    // Fall back to full buffer if format unsupported by sharp (e.g., PDF)
    croppedBuffer = imageBuffer;
  }

  const formData = new FormData();
  const blob = new Blob([croppedBuffer], { type: 'image/jpeg' });
  formData.append('file', blob, 'certificate.jpg');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${AI_SERVICE_URL}/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const err = new Error(`AI service responded with ${response.status}`);
      err.statusCode = 503;
      throw err;
    }

    const data = await response.json();
    return {
      score: data.real_prob,
      label: data.label === 'real' ? 'authentic' : 'suspicious',
    };
  } catch (err) {
    clearTimeout(timeout);
    if (err.statusCode) throw err;
    const error = new Error(`AI service unavailable: ${err.message}`);
    error.statusCode = 503;
    throw error;
  }
}
