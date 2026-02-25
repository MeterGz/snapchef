import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Rate limiting
const rateMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 3;

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
    console.warn('[SECURITY] RATE_LIMIT_HIT', JSON.stringify({ ip, route: 'delete-account' }));
    return res.status(429).json({ error: 'Too many requests.' });
  }

  try {
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'Service temporarily unavailable' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verify auth token — user can only delete their own account
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = user.id;
    console.log(`[ACCOUNT] Deleting account for user ${userId}`);

    // Get profile to check for Stripe subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_subscription_id, stripe_customer_id, is_pro')
      .eq('id', userId)
      .single();

    // Cancel Stripe subscription if active
    if (profile?.stripe_subscription_id && STRIPE_SECRET) {
      try {
        const stripe = new Stripe(STRIPE_SECRET);
        await stripe.subscriptions.cancel(profile.stripe_subscription_id);
        console.log(`[ACCOUNT] Cancelled Stripe subscription ${profile.stripe_subscription_id}`);
      } catch (stripeErr) {
        console.warn(`[ACCOUNT] Stripe cancel failed (may already be cancelled):`, stripeErr.message);
      }
    }

    // Delete profile first (FK constraint)
    await supabase.from('profiles').delete().eq('id', userId);

    // Delete auth user using admin API
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('[ACCOUNT] Failed to delete auth user:', deleteError.message);
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    console.log(`[ACCOUNT] Successfully deleted user ${userId}`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[ACCOUNT] Delete account error:', err);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
}
