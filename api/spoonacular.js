// Rate limiting
const rateMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 30; // Higher limit since Spoonacular is cheaper
const ALLOWED_ENDPOINTS = ['findByIngredients', 'recipeInformation', 'complexSearch'];

function getIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count++;
  if (entry.count > MAX_REQUESTS) return true;
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap) {
    if (now - entry.windowStart > WINDOW_MS * 5) rateMap.delete(ip);
  }
}, 5 * 60 * 1000);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getIP(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  try {
    const SPOONACULAR_KEY = process.env.SPOONACULAR_API_KEY;
    if (!SPOONACULAR_KEY) {
      return res.status(500).json({ error: 'SPOONACULAR_API_KEY not set' });
    }

    const { endpoint, ...params } = req.query;

    // Validate endpoint
    if (endpoint && !ALLOWED_ENDPOINTS.includes(endpoint)) {
      return res.status(400).json({ error: 'Invalid endpoint' });
    }

    // Cap number param to prevent excessive results
    const safeNumber = Math.min(parseInt(params.number) || 4, 12);

    let url;
    switch (endpoint) {
      case 'findByIngredients':
        url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${SPOONACULAR_KEY}&ingredients=${encodeURIComponent(params.ingredients || '')}&number=${safeNumber}&ranking=${params.ranking || 1}&ignorePantry=${params.ignorePantry || true}`;
        break;
      case 'recipeInformation': {
        // Validate recipe ID is numeric
        const id = parseInt(params.id);
        if (!id || id < 1) return res.status(400).json({ error: 'Invalid recipe ID' });
        url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${SPOONACULAR_KEY}&includeNutrition=${params.includeNutrition || true}`;
        break;
      }
      case 'complexSearch': {
        const q = new URLSearchParams();
        q.set('apiKey', SPOONACULAR_KEY);
        if (params.query) q.set('query', params.query.slice(0, 100)); // Cap query length
        if (params.cuisine) q.set('cuisine', params.cuisine);
        if (params.diet) q.set('diet', params.diet);
        if (params.intolerances) q.set('intolerances', params.intolerances);
        if (params.maxReadyTime) q.set('maxReadyTime', params.maxReadyTime);
        q.set('number', String(safeNumber));
        if (params.offset) q.set('offset', String(Math.min(parseInt(params.offset) || 0, 50)));
        q.set('addRecipeInformation', 'true');
        q.set('fillIngredients', 'true');
        q.set('instructionsRequired', 'true');
        url = `https://api.spoonacular.com/recipes/complexSearch?${q.toString()}`;
        break;
      }
      default:
        url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_KEY}&query=${encodeURIComponent((params.query || '').slice(0, 100))}&number=1`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Spoonacular request timed out' });
    }
    return res.status(500).json({ error: 'Spoonacular proxy error: ' + error.message });
  }
}
