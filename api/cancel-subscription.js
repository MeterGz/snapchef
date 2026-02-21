import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Get user's subscription ID from Supabase
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

    // Cancel at end of billing period (not immediately)
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
    return res.status(500).json({ error: err.message || 'Failed to cancel subscription' });
  }
}
