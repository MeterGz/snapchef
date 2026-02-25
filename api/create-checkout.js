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
    console.warn('[SECURITY] RATE_LIMIT_HIT', JSON.stringify({ ip, route: 'create-checkout' }));
    return res.status(429).json({ error: 'Too many requests. Please wait.' });
  }

  try {
    const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const PRICE_ID = process.env.STRIPE_PRICE_ID;

    if (!STRIPE_SECRET) return res.status(500).json({ error: 'Service temporarily unavailable' });
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'Service temporarily unavailable' });
    if (!PRICE_ID) return res.status(500).json({ error: 'Service temporarily unavailable' });

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

    // Use verified user ID and email, NOT client-provided
    const userId = user.id;
    const email = user.email;

    // Always use server-side price ID — never trust client
    const price = PRICE_ID;

    // Check if user already has a Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId }
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    const baseUrl = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://snapchef-three.vercel.app';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: `${baseUrl}?upgraded=true`,
      cancel_url: `${baseUrl}?upgrade_cancelled=true`,
      metadata: { supabase_user_id: userId },
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout' });
  }
}
