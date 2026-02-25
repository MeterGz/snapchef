import { createClient } from '@supabase/supabase-js';

// Kill switch — set API_KILL_SWITCH=true in Vercel env vars to instantly block all API calls
// Global daily cap — set API_DAILY_GLOBAL_CAP in Vercel (default 2000) to auto-kill after N total calls/day
const globalCounter = { date: '', count: 0 };
const DEFAULT_GLOBAL_CAP = 2000;

// Rate limiting — in-memory store persists across warm Vercel function invocations
const rateMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 15;
const ALLOWED_MODELS = ['claude-sonnet-4-20250514', 'claude-haiku-4-5-20251001'];
const MAX_TOKENS_CAP = 1500;
const FREE_SCAN_LIMIT = 2;
const PRO_SCAN_LIMIT = 25;
const FREE_DAILY_API_LIMIT = 50;   // Non-scan calls (recipe gen, remix, pairings)
const PRO_DAILY_API_LIMIT = 200;

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

// Daily per-IP counter for non-authenticated users
function isDailyLimited(ip) {
  const key = `daily_${ip}`;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const entry = rateMap.get(key);
  if (!entry || now - entry.windowStart > dayMs) {
    rateMap.set(key, { windowStart: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > FREE_DAILY_API_LIMIT;
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    const maxAge = key.startsWith('daily_') || key.startsWith('scan_') ? 24 * 60 * 60 * 1000 : WINDOW_MS * 5;
    if (now - entry.windowStart > maxAge) rateMap.delete(key);
  }
}, 5 * 60 * 1000);

const ALLOWED_ORIGINS = [
  'https://snapchef.vercel.app',
  'https://snapchef-three.vercel.app',
  'https://snap-chef.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Abuse logger — logs to Vercel function logs (visible in dashboard → Logs)
function logSecurity(event, details) {
  console.warn(`[SECURITY] ${event}`, JSON.stringify(details));
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.some(o => origin?.startsWith(o) || origin === o)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Scan-Request');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Kill switch — flip in Vercel dashboard to instantly stop all API spend
  const killSwitch = (process.env.API_KILL_SWITCH || '').toLowerCase();
  if (killSwitch === 'true' || killSwitch === '1' || killSwitch === 'yes') {
    return res.status(503).json({ error: 'Service temporarily paused. Please try again later.' });
  }

  // Global daily cap — auto-kills after N total calls across all users
  const today = new Date().toISOString().split('T')[0];
  const globalCap = parseInt(process.env.API_DAILY_GLOBAL_CAP) || DEFAULT_GLOBAL_CAP;
  if (globalCounter.date !== today) {
    globalCounter.date = today;
    globalCounter.count = 0;
  }
  globalCounter.count++;
  if (globalCounter.count > globalCap) {
    logSecurity('GLOBAL_CAP_HIT', { count: globalCounter.count, cap: globalCap });
    return res.status(503).json({ error: 'Daily capacity reached. Please try again tomorrow.' });
  }

  const ip = getIP(req);

  // Per-minute rate limit
  if (isRateLimited(ip)) {
    logSecurity('RATE_LIMIT_HIT', { ip, type: 'per_minute' });
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  try {
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Service temporarily unavailable' });
    }

    const body = req.body;
    const isScanRequest = req.headers['x-scan-request'] === 'true';
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let supabase = null;
    let userId = null;
    let isPro = false;

    // Try to identify user from auth token
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        try {
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user) {
            userId = user.id;
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_pro, daily_scans_used, last_scan_date, pro_expires_at')
              .eq('id', userId)
              .single();
            if (profile) {
              isPro = profile.is_pro || false;
              // Check if Pro has expired (webhook may be delayed)
              if (isPro && profile.pro_expires_at) {
                const expiresAt = new Date(profile.pro_expires_at * 1000 || profile.pro_expires_at);
                if (expiresAt < new Date()) {
                  isPro = false;
                  // Fix DB since we have service role
                  await supabase.from('profiles').update({ is_pro: false, stripe_subscription_id: null, pro_expires_at: null, updated_at: new Date().toISOString() }).eq('id', userId);
                  logSecurity('PRO_EXPIRED', { userId });
                }
              }
            }
          }
        } catch (authErr) {
          logSecurity('AUTH_FAILED', { ip, error: authErr.message });
        }
      }
    }

    // --- SCAN REQUEST: enforce scan limits ---
    if (isScanRequest && supabase) {
      const today = new Date().toISOString().split('T')[0];

      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('daily_scans_used, last_scan_date')
          .eq('id', userId)
          .single();

        if (profile) {
          const limit = isPro ? PRO_SCAN_LIMIT : FREE_SCAN_LIMIT;
          const scansToday = profile.last_scan_date === today ? (profile.daily_scans_used || 0) : 0;

          if (scansToday >= limit) {
            logSecurity('SCAN_LIMIT_HIT', { userId, isPro, scansToday, limit });
            return res.status(429).json({
              error: `Daily scan limit reached (${limit}/${limit}). ${isPro ? 'Resets at midnight.' : 'Upgrade to Pro for more scans.'}`
            });
          }

          await supabase.from('profiles').update({
            daily_scans_used: scansToday + 1,
            last_scan_date: today,
            updated_at: new Date().toISOString()
          }).eq('id', userId);
        }
      } else {
        // Anonymous scan — IP-based daily limit
        const scanIpKey = `scan_${ip}`;
        const entry = rateMap.get(scanIpKey);
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        if (!entry || now - entry.windowStart > dayMs) {
          rateMap.set(scanIpKey, { windowStart: now, count: 1 });
        } else {
          entry.count++;
          if (entry.count > FREE_SCAN_LIMIT) {
            logSecurity('ANON_SCAN_LIMIT', { ip, count: entry.count });
            return res.status(429).json({
              error: 'Daily scan limit reached. Sign in or upgrade to Pro for more scans.'
            });
          }
        }
      }
    }

    // --- NON-SCAN REQUEST: enforce daily API call limits ---
    if (!isScanRequest) {
      if (userId) {
        // Per-user daily limit via in-memory (lightweight, no DB write per call)
        const userDayKey = `daily_user_${userId}`;
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const entry = rateMap.get(userDayKey);
        const limit = isPro ? PRO_DAILY_API_LIMIT : FREE_DAILY_API_LIMIT;
        if (!entry || now - entry.windowStart > dayMs) {
          rateMap.set(userDayKey, { windowStart: now, count: 1 });
        } else {
          entry.count++;
          if (entry.count > limit) {
            logSecurity('API_DAILY_LIMIT', { userId, isPro, count: entry.count, limit });
            return res.status(429).json({ error: 'Daily usage limit reached. Try again tomorrow.' });
          }
        }
      } else {
        // Anonymous — stricter daily IP limit
        if (isDailyLimited(ip)) {
          logSecurity('ANON_DAILY_LIMIT', { ip });
          return res.status(429).json({ error: 'Daily usage limit reached. Sign in for more.' });
        }
      }
    }

    // Validate model
    if (!body?.model || !ALLOWED_MODELS.includes(body.model)) {
      return res.status(400).json({ error: 'Invalid model' });
    }

    // Enforce model by tier — free users can only use Haiku
    if (!isPro && body.model === 'claude-sonnet-4-20250514') {
      body.model = 'claude-haiku-4-5-20251001';
      logSecurity('MODEL_DOWNGRADE', { userId: userId || ip, attempted: 'sonnet', forced: 'haiku' });
    }

    // Cap max_tokens
    if (body.max_tokens > MAX_TOKENS_CAP) {
      body.max_tokens = MAX_TOKENS_CAP;
    }

    // Block if no messages
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Limit to 2 messages max
    if (body.messages.length > 2) {
      body.messages = body.messages.slice(-2);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await response.json();

    // Log non-200 responses for monitoring
    if (!response.ok) {
      logSecurity('API_ERROR', { status: response.status, userId: userId || ip, isScan: isScanRequest });
    }

    return res.status(response.status).json(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timed out' });
    }
    logSecurity('PROXY_ERROR', { ip, error: error.message });
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
