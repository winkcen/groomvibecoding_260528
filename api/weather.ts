import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { lat, lon } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and Longitude are required parameters.' });
  }

  try {
    const targetUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max&hourly=relative_humidity_2m&timezone=auto`;
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch weather from provider' });
    }
    
    const data = await response.json();
    
    // Set caching headers for production optimization (cache for 15 minutes)
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
