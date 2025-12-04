// api/translate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { texts, source = 'auto', target } = req.body;

    if (!Array.isArray(texts) || !target) {
      return res.status(400).json({ error: 'texts[] and target are required' });
    }

    const url = 'https://libretranslate.com/translate';

    const results = [];
    for (const text of texts) {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source,
          target,
          format: 'html'
        })
      });

      if (!r.ok) {
        const body = await r.text();
        console.error('LibreTranslate error:', body);
        throw new Error('LibreTranslate failed: ' + r.status);
      }

      const data = await r.json();
      results.push(data.translatedText);
    }

    res.status(200).json({ translations: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Translation failed' });
  }
}
