// services/geminiService.ts
// FRONTEND: no API keys, no @google/genai. Calls our backend /api/gemini.

type GeminiResponse = any;

function extractImageFromResponse(resp: GeminiResponse): string | null {
  const parts = resp?.candidates?.[0]?.content?.parts || [];
  for (const p of parts) {
    const inline = (p as any)?.inlineData;
    if (inline?.data && inline?.mimeType?.startsWith('image/')) {
      return `data:${inline.mimeType};base64,${inline.data}`;
    }
  }
  return null;
}

// (Optional) downscale payload so requests stay under serverless limits
async function shrinkDataUrl(dataUrl: string, maxSide = 1024, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}

export const virtualTryOn = async (userImage: string, outfitImage: string): Promise<string> => {
  const userSmall = await shrinkDataUrl(userImage);
  const outfitSmall = await shrinkDataUrl(outfitImage);

  const prompt =
    `From the first image, identify the person. From the second image, identify the clothing item. ` +
    `Create a new, photorealistic image where the person from the first image is wearing the clothing ` +
    `item from the second image. Preserve the person’s pose, face, and the background of the first image. ` +
    `Enhance quality if inputs are low clarity. The final output must be only the generated image.`;

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      prompt,
      images: [{ dataUrl: userSmall }, { dataUrl: outfitSmall }],
      // keep your preferred model name:
      model: 'gemini-2.5-flash-image-preview'
    })
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { msg = (await res.json())?.error || msg; } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  const img = extractImageFromResponse(data);
  if (!img) throw new Error('No image was generated in the response.');
  return img;
};
