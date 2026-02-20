# SnapChef — Setup Guide

## Environment Variables (Vercel → Settings → Environment Variables)

### Required (already have these)
```
ANTHROPIC_API_KEY=sk-ant-...
SPOONACULAR_API_KEY=abc123...
```

### Supabase
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   (⚠️ keep this secret — server only)
```

### Stripe
```
STRIPE_SECRET_KEY=sk_live_...      (or sk_test_... for testing)
STRIPE_PRICE_ID=price_...          (your subscription price ID)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### PostHog
```
VITE_POSTHOG_KEY=phc_...
```

---

## Step-by-Step Setup

### 1. Supabase (Auth + Database)

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Copy your **Project URL** and **anon public key** from Settings → API
3. Copy your **service_role key** (⚠️ this is secret — only for server)
4. Go to SQL Editor → New Query → paste the contents of `supabase-schema.sql` → Run
5. Go to Authentication → URL Configuration → set Site URL to your Vercel URL
6. Add all 3 env vars to Vercel

### 2. Stripe (Payments)

1. Go to [stripe.com](https://stripe.com) → Create account
2. Products → Create Product:
   - Name: "SnapChef Pro"
   - Price: $4.99/month (recurring)
   - Copy the **Price ID** (starts with `price_`)
3. Developers → API Keys → copy **Secret key**
4. Developers → Webhooks → Add endpoint:
   - URL: `https://your-vercel-url.vercel.app/api/stripe-webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copy the **Signing secret** (starts with `whsec_`)
5. Add all 3 env vars to Vercel

**For testing:** Use `sk_test_` keys and Stripe test mode. Test card: 4242 4242 4242 4242, any future date, any CVC.

### 3. PostHog (Analytics)

1. Go to [posthog.com](https://posthog.com) → Create account (free tier = 1M events/month)
2. Project Settings → copy your **Project API Key** (starts with `phc_`)
3. Add `VITE_POSTHOG_KEY` to Vercel

### 4. Deploy

```bash
cd snapchef-deploy
vercel --prod
```

---

## What's Tracked in PostHog

| Event | When |
|---|---|
| `scan_completed` | User scans ingredients |
| `recipe_search` | User searches by keyword |
| `recipe_viewed` | User taps a recipe card |
| `cook_started` | User enters cook mode |
| `cook_completed` | User finishes cooking |
| `user_signup` | New account created |
| `user_login` | User signs in |
| `user_logout` | User signs out |
| `upgrade_started` | User clicks upgrade button |
| `upgrade_completed` | User returns from Stripe checkout |

---

## Architecture

```
User → Vercel (static React app)
        ├── /api/anthropic.js      → Claude API (scans, remix, meal plans)
        ├── /api/spoonacular.js    → Spoonacular (recipes, search)
        ├── /api/create-checkout.js → Stripe (create checkout session)
        └── /api/stripe-webhook.js  → Stripe (subscription events → Supabase)

Supabase: auth + profiles table (is_pro, stripe IDs)
PostHog: client-side analytics (loaded via CDN)
window.storage: recipe data, preferences, meal plans (local to device)
```

## Notes

- **Supabase is optional.** Without it, auth won't work but the app still functions. `isPro` stays `false`.
- **Stripe requires Supabase.** The webhook updates `is_pro` in the profiles table.
- **PostHog is optional.** Without the key, `track()` calls are no-ops.
- **Recipe data stays in window.storage.** Supabase only handles auth + billing. No data migration needed.
