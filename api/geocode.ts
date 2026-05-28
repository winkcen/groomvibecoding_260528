import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { name } = req.query;
  
  if (!name) {
    return res.status(400).json({ error: 'City name query parameter is required.' });
  }

  try {
    const targetUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name.toString())}&count=6&language=ko&format=json`;
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch geocoding data' });
    }
    
    const data = await response.json();
    
    // Cache city searches for 1 hour since they don't change often
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=1800');
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
