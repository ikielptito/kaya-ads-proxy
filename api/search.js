export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

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
        'X-FB-Friendly-Name': 'AdLibrarySearchResultsQuery',
      }
    });

    const text = await response.text();
    const clean = text.startsWith('for (;;);') ? text.slice(9) : text;
    const data = JSON.parse(clean);
    return res.status(200).json({ success: true, data });
  } catch (e)
