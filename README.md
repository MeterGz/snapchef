# SnapChef — AI Recipe Generator

## Deploy to Netlify

### Step 1: Upload to GitHub
1. Go to [github.com](https://github.com) → click **+** → **New repository**
2. Name it `snapchef`, click **Create**
3. Click **"uploading an existing file"**
4. Unzip this folder and drag ALL files/folders in
5. Click **Commit changes**

### Step 2: Deploy on Netlify
1. Go to [app.netlify.com](https://app.netlify.com), sign up with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Select GitHub → pick your `snapchef` repo
4. Click **Deploy** (build settings are auto-configured)

### Step 3: Add API Keys (REQUIRED)
After deploying, go to your Netlify site dashboard:
1. **Site configuration** → **Environment variables**
2. Add these two variables:
   - `ANTHROPIC_API_KEY` → your Anthropic API key
   - `SPOONACULAR_API_KEY` → `285bdb70c0a24c18aea58e50153813ee`
3. Go to **Deploys** → click **Trigger deploy** → **Deploy site**

Without these keys, scanning and recipe images won't work!

## Install on Your Phone (PWA)

After deploying to Netlify:

### iPhone
1. Open your Netlify URL in **Safari**
2. Tap the **Share button** (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add** — SnapChef now appears as an app icon

### Android
1. Open your Netlify URL in **Chrome**
2. Tap the **three-dot menu** (⋮)
3. Tap **"Add to Home Screen"** or **"Install App"**
4. Tap **Install** — SnapChef now appears as an app icon

It launches fullscreen with no browser bar — looks and feels like a real app!

## Local Development

```
npm install
npm run dev
```

Opens at http://localhost:5173
