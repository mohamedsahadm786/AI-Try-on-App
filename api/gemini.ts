// api/gemini.ts — SERVER (Vercel). Keeps GEMINI_API_KEY secret.
// Accepts: { prompt, images: [{dataUrl|base64,mimeType}], model? }
// Returns: raw Gemini JSON (image comes back as inlineData base64 if the model supports it).

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY on server' });

  const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  const body = raw ? JSON.parse(raw) : {};
  const { prompt, images = [], model = 'gemini-2.5-flash-image-preview' } = body;

  if (!prompt) return res.status(400).json({ error: 'Please send { "prompt": "..." }' });

  // Build parts (images first, then the text)
  const parts: any[] = [];

  const parseDataUrl = (d: string) => {
    const m = /^data:(.+);base64,(.*)$/i.exec(d);
    return m ? { mimeType: m[1], data: m[2] } : null;
  };

  for (const img of images) {
    if (img?.dataUrl) {
      const p = parseDataUrl(String(img.dataUrl));
      if (p) parts.push({ inlineData: { mimeType: p.mimeType, data: p.data } });
    } else if (img?.base64 && img?.mimeType) {
      parts.push({ inlineData: { mimeType: String(img.mimeType), data: String(img.base64) } });
    }
  }

  parts.push({ text: String(prompt) });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${apiKey}`;

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts }] }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.error || 'Gemini error', raw: data });

    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unknown server error' });
  }
}
