import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Rate limiting
const rateMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;

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
  return entry.count > MAX_REQUESTS;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap) {
    if (now - entry.windowStart > WINDOW_MS * 5) rateMap.delete(ip);
  }
}, 5 * 60 * 1000);

// Allowed origins
const ALLOWED_ORIGINS = [
  'https://snapchef.vercel.app',
  'https://snapchef-three.vercel.app',
  'https://snap-chef.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

function setCORS(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.some(o => origin?.startsWith(o) || origin === o)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCORS(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = getIP(req);
  if (isRateLimited(ip)) {
    console.warn('[SECURITY] RATE_LIMIT_HIT', JSON.stringify({ ip, route: 'cancel-subscription' }));
    return res.status(429).json({ error: 'Too many requests. Please wait.' });
  }

  try {
    const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!STRIPE_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const stripe = new Stripe(STRIPE_SECRET);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verify auth token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Use verified user ID, NOT client-provided
    const userId = user.id;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_subscription_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    if (!profile.stripe_subscription_id) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    const subscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    return res.status(200).json({
      success: true,
      cancelAt: subscription.current_period_end
    });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    return res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}
