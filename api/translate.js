import fetch from 'node-fetch';

const GOOGLE_TRANSLATE_URL =
  'https://translate.googleapis.com/translate_a/single';

export default async function handler(req, res) {
  // CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { texts, source = 'auto', target } = body;

    if (!Array.isArray(texts) || !target) {
      return res
        .status(400)
        .json({ error: 'texts[] and target are required' });
    }

    const results = [];

    for (const text of texts) {
      const url =
        GOOGLE_TRANSLATE_URL +
        `?client=gtx&sl=${encodeURIComponent(source)}` +
        `&tl=${encodeURIComponent(target)}` +
        `&dt=t&q=${encodeURIComponent(text)}`;

      const r = await fetch(url);
      if (!r.ok) {
        const txt = await r.text();
        console.error('Google web translate error:', r.status, txt);
        throw new Error('Translate failed: ' + r.status);
      }

      const data = await r.json();
      const translated = data[0]?.map(chunk => chunk[0]).join(' ') || '';
      results.push(translated);
    }

    return res.status(200).json({ translations: results });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Translation failed' });
  }
}
