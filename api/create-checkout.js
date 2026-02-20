import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!STRIPE_SECRET) return res.status(500).json({ error: 'STRIPE_SECRET_KEY not set' });
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'Supabase env vars not set' });

    const stripe = new Stripe(STRIPE_SECRET);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { userId, email, priceId } = req.body;
    if (!userId || !email) return res.status(400).json({ error: 'Missing userId or email' });

    // Use the price ID from env or request
    const price = priceId || process.env.STRIPE_PRICE_ID;
    if (!price) return res.status(500).json({ error: 'STRIPE_PRICE_ID not set' });

    // Check if user already has a Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId }
      });
      customerId = customer.id;

      // Save to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session
    const baseUrl = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://snapchef.vercel.app';

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
    return res.status(500).json({ error: 'Failed to create checkout: ' + error.message });
  }
}
