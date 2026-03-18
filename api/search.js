export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const headers = {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY
      };
      // Only add beta header if request uses web search tool
      const usesWebSearch = (body.tools || []).some(t => t.type === 'web_search_20250305');
      if (usesWebSearch) {
        headers['anthropic-beta'] = 'web-search-2025-03-05';
      }
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      const data = await response.json();
      return res.status(200).json(data);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const url = `https://www.facebook.com/ads/library/async/search_ads/?q=${encodeURIComponent(query)}&count=30&active_status=active&ad_type=all&countries[0]=ID&search_type=keyword_unordered&source=nav-header`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.facebook.com/ads/library/',
      }
    });
    const text = await response.text();
    const clean = text.startsWith('for (;;);') ? text.slice(9) : text;
    const data = JSON.parse(clean);
    return res.status(200).json({ success: true, data });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
