import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Camera, Upload, Loader2, ArrowLeft, Clock, Users, Heart, ShoppingCart, Settings, X, Plus, Minus, Play, Pause, Search, Calendar, Star, Moon, Sun, AlertCircle, RotateCcw, Package, History, List, Grid, ZoomIn, ZoomOut, ChevronDown, Award, RefreshCw } from 'lucide-react';

// ==================== SPOONACULAR CONFIG ====================
// API key is stored securely in Netlify environment variables
// Set SPOONACULAR_API_KEY in your Netlify dashboard → Site Settings → Environment Variables

// App logo - full icon with gradient background (for header, splash)
const SnapChefLogo = ({ size = 32 }) => (
  <svg viewBox="0 0 512 512" width={size} height={size} style={{borderRadius: size * 0.22}}>
    <defs>
      <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'#ef4444'}}/>
        <stop offset="100%" style={{stopColor:'#f97316'}}/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="112" fill="url(#logoBg)"/>
    <rect x="106" y="260" width="300" height="185" rx="34" fill="white" opacity="0.95"/>
    <path d="M216 260 L232 230 L280 230 L296 260" fill="white" opacity="0.95"/>
    <rect x="335" y="280" width="38" height="14" rx="7" fill="#fbbf24"/>
    <circle cx="148" cy="285" r="8" fill="#ef4444" opacity="0.5"/>
    <ellipse cx="256" cy="180" rx="78" ry="58" fill="white"/>
    <ellipse cx="194" cy="195" rx="40" ry="44" fill="white"/>
    <ellipse cx="318" cy="195" rx="40" ry="44" fill="white"/>
    <rect x="194" y="212" width="124" height="52" rx="3" fill="white"/>
    <circle cx="256" cy="352" r="60" fill="none" stroke="#ef4444" strokeWidth="12"/>
    <circle cx="256" cy="352" r="34" fill="#ef4444"/>
    <circle cx="246" cy="341" r="10" fill="white" opacity="0.5"/>
  </svg>
);

// App icon - camera+hat silhouette (for buttons, inline use) - uses currentColor
const SnapChefIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <ellipse cx="12" cy="5.5" rx="4.5" ry="3.2" fill="currentColor"/>
    <ellipse cx="8.5" cy="6.3" rx="2.2" ry="2.5" fill="currentColor"/>
    <ellipse cx="15.5" cy="6.3" rx="2.2" ry="2.5" fill="currentColor"/>
    <rect x="8.5" y="7.5" width="7" height="3.5" rx="0.3" fill="currentColor"/>
    <rect x="4" y="11.5" width="16" height="10" rx="2.5" fill="currentColor"/>
    <path d="M9.5 11.5 L10.5 10 L13.5 10 L14.5 11.5" fill="currentColor"/>
    <circle cx="12" cy="16.5" r="3.2" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0"/>
    <circle cx="12" cy="16.5" r="3.2" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1"/>
    <circle cx="12" cy="16.5" r="1.8" fill="white" opacity="0.6"/>
  </svg>
);

// Static recipe visual mapping — defined once, never recreated
const RECIPE_VISUALS = [
  { keys: ['pasta','italian','spaghetti','lasagna','risotto','pizza','gnocchi','penne','fettuccine','ravioli','carbonara','bolognese','alfredo','marinara'], emoji: '🍝', gradient: ['#FF6B6B','#EE5A24'] },
  { keys: ['sushi','japanese','ramen','miso','teriyaki','tempura','udon','soba','onigiri','katsu'], emoji: '🍣', gradient: ['#E056A0','#F78DA7'] },
  { keys: ['taco','mexican','burrito','enchilada','quesadilla','salsa','guacamole','nacho','fajita','churro'], emoji: '🌮', gradient: ['#F7971E','#FFD200'] },
  { keys: ['indian','curry','tikka','masala','naan','biryani','dal','tandoori','samosa','paneer','vindaloo','korma'], emoji: '🍛', gradient: ['#FF8008','#FFC837'] },
  { keys: ['chinese','stir','wok','dumpling','fried rice','noodle','dim sum','spring roll','chow','kung','szechuan'], emoji: '🥡', gradient: ['#E44D26','#F16529'] },
  { keys: ['thai','pad','coconut curry','satay','tom','basil chicken','green curry','red curry'], emoji: '🥘', gradient: ['#11998E','#38EF7D'] },
  { keys: ['salad','bowl','grain','quinoa','healthy','green','kale','acai','poke','buddha'], emoji: '🥗', gradient: ['#56AB2F','#A8E063'] },
  { keys: ['steak','beef','grill','bbq','burger','ribs','brisket','meatloaf','pot roast','wellington'], emoji: '🥩', gradient: ['#8E2DE2','#4A00E0'] },
  { keys: ['chicken','poultry','wings','thigh','breast','roast chicken','fried chicken','nugget','rotisserie'], emoji: '🍗', gradient: ['#F2994A','#F2C94C'] },
  { keys: ['fish','salmon','tuna','seafood','shrimp','cod','sea bass','ceviche','lobster','crab','scallop','clam','mussel'], emoji: '🐟', gradient: ['#2193B0','#6DD5ED'] },
  { keys: ['soup','stew','chowder','bisque','broth','chili','gumbo','minestrone','gazpacho','pho'], emoji: '🍲', gradient: ['#C94B4B','#4B134F'] },
  { keys: ['dessert','cake','cookie','chocolate','pie','sweet','brownie','ice cream','cheesecake','tiramisu','mousse','custard','pudding','tart'], emoji: '🍰', gradient: ['#DA4453','#89216B'] },
  { keys: ['bread','bake','muffin','pancake','waffle','scone','toast','croissant','bagel','focaccia','pretzel','biscuit'], emoji: '🍞', gradient: ['#D4A76A','#C69749'] },
  { keys: ['smoothie','drink','juice','shake','cocktail','lemonade','iced','tea','coffee'], emoji: '🥤', gradient: ['#7F00FF','#E100FF'] },
  { keys: ['egg','omelette','frittata','breakfast','brunch','benedict','scramble','hash'], emoji: '🍳', gradient: ['#F7971E','#FFD200'] },
  { keys: ['korean','kimchi','bibimbap','bulgogi','gochujang','japchae','tteok'], emoji: '🍜', gradient: ['#E44D26','#FF6B6B'] },
  { keys: ['mediterranean','greek','hummus','falafel','pita','tzatziki','shawarma','kebab','gyro'], emoji: '🫒', gradient: ['#00B09B','#96C93D'] },
  { keys: ['sandwich','sub','panini','club','blt','grilled cheese','melt','hoagie'], emoji: '🥪', gradient: ['#CAB8A2','#D4A76A'] },
  { keys: ['pork','ham','bacon','sausage','bratwurst','pulled pork','carnitas','chop'], emoji: '🥓', gradient: ['#C0392B','#E74C3C'] },
  { keys: ['lamb','rack','shepherd','gyro','moussaka'], emoji: '🍖', gradient: ['#6C3483','#AF7AC5'] },
  { keys: ['wrap','tortilla','spring roll','lettuce wrap','crepe'], emoji: '🌯', gradient: ['#27AE60','#2ECC71'] },
  { keys: ['rice','pilaf','jambalaya','paella','congee','porridge','oat'], emoji: '🍚', gradient: ['#ECF0F1','#BDC3C7'] },
  { keys: ['tofu','vegan','plant','tempeh','seitan','bean','lentil','chickpea'], emoji: '🌱', gradient: ['#00B894','#55E6C1'] },
  { keys: ['french','crepe','quiche','ratatouille','bouillabaisse','coq','souffle'], emoji: '🥐', gradient: ['#6C5CE7','#A29BFE'] },
];

// ==================== RESILIENT API UTILITIES ====================
const safeParseJSON = (rawText) => {
  if (!rawText || typeof rawText !== 'string') throw new Error('Empty response');
  let s = rawText.trim().replace(/```json\s*/g, '').replace(/\s*```/g, '').trim();
  try { return JSON.parse(s); } catch (e1) {
    const oi = s.indexOf('{'), ai = s.indexOf('[');
    const si = oi === -1 ? ai : ai === -1 ? oi : Math.min(oi, ai);
    if (si >= 0) {
      const cl = s[si] === '{' ? '}' : ']';
      const ei = s.lastIndexOf(cl);
      if (ei > si) {
        const c = s.substring(si, ei + 1);
        try { return JSON.parse(c); } catch (e2) {
          try { return JSON.parse(c.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']')); } catch (e3) {}
        }
      }
    }
    throw new Error('Could not parse JSON from response');
  }
};

const fetchWithRetry = async (url, options, maxRetries = 2, delayMs = 1500) => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if ((res.status === 429 || res.status >= 500) && i < maxRetries) {
        await new Promise(r => setTimeout(r, delayMs * (i + 1)));
        continue;
      }
      return res;
    } catch (err) {
      if (i === maxRetries) throw err;
      await new Promise(r => setTimeout(r, delayMs * (i + 1)));
    }
  }
};

export default function SnapChef() {
  const [step, setStep] = useState('home'); // 'home', 'capture', 'analyzing', 'review', 'results', 'pantry', 'mealPlan', 'search'
  const [prevStep, setPrevStep] = useState(null);
  const [images, setImages] = useState([]); // Array of { src, type }
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [recipes, setRecipes] = useState([]);
  const [recipeImages, setRecipeImages] = useState({}); // { recipeName: imageUrl }
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [servings, setServings] = useState(1);
  const [originalServings, setOriginalServings] = useState(4);
  const [darkMode, setDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipeSort, setRecipeSort] = useState('default');
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [savedFilter, setSavedFilter] = useState('');
  const [showFullImage, setShowFullImage] = useState(false);
  const [fullImageIndex, setFullImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 }); // FIX #1: Controlled search input
  
  // Cook Mode
  const [cookMode, setCookMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timers, setTimers] = useState({});
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerDone, setTimerDone] = useState(false);
  const [cookStartTime, setCookStartTime] = useState(null);
  const [cookElapsed, setCookElapsed] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [showCookComplete, setShowCookComplete] = useState(false);
  const [showIngredientPanel, setShowIngredientPanel] = useState(false);
  const wakeLockRef = useRef(null);
  
  // Pantry Management
  const [pantryItems, setPantryItems] = useState([]);
  const [showAddPantry, setShowAddPantry] = useState(false);
  const [newPantryItem, setNewPantryItem] = useState({ name: '', quantity: '', expiry: '' });
  
  // Recipe Collections
  const [collections, setCollections] = useState([]);
  const [newCollection, setNewCollection] = useState('');
  
  // Recipe History & Notes
  const [recipeHistory, setRecipeHistory] = useState([]);
  const [recipeNotes, setRecipeNotes] = useState({});
  const [recipeRatings, setRecipeRatings] = useState({});
  
  // Scan History
  const [scanHistory, setScanHistory] = useState([]);
  
  // Meal Planner
  const [mealPlan, setMealPlan] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showMealPicker, setShowMealPicker] = useState(null); // FIX #8: Stores mealType when picker is open
  const [fillingMealPlan, setFillingMealPlan] = useState(false);
  const [mealSlots, setMealSlots] = useState(['Breakfast', 'Lunch', 'Dinner']);
  const [editingMealSlot, setEditingMealSlot] = useState(null); // { index, name }
  
  // Preferences
  const [preferences, setPreferences] = useState({
    dietary: [],
    cuisines: [],
    skillLevel: 'any',
    maxTime: 'any'
  });

  // Onboarding
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [userProfile, setUserProfile] = useState({
    name: '',
    goal: '', // 'lose', 'maintain', 'gain', 'explore'
    dietary: [],
    skillLevel: 'beginner', // 'beginner', 'intermediate', 'advanced'
    cookTime: '30', // minutes
    cuisines: [],
    calorieTarget: 2000,
    proteinTarget: 150,
    carbTarget: 200,
    fatTarget: 65
  });

  // Calorie/Macro Tracker
  const [showTracker, setShowTracker] = useState(false);
  const [foodLog, setFoodLog] = useState({}); // { '2026-02-14': [{ name, calories, protein, carbs, fat, time, photo? }] }
  const [trackerDate, setTrackerDate] = useState(new Date().toISOString().split('T')[0]);
  const [showMealScanner, setShowMealScanner] = useState(false);
  const [mealScanImage, setMealScanImage] = useState(null);
  const [mealScanResult, setMealScanResult] = useState(null);
  const [scanningMeal, setScanningMeal] = useState(false);
  const [showManualLog, setShowManualLog] = useState(false);
  const [manualEntry, setManualEntry] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });


  // Toast notifications
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  // Share
  const [shareCardRecipe, setShareCardRecipe] = useState(null);

  // Offline recipe cache
  const [cachedRecipes, setCachedRecipes] = useState({});

  // Gamification
  const [stats, setStats] = useState({
    totalScans: 0, totalRecipesViewed: 0, totalCooked: 0, totalMealsLogged: 0,
    streak: 0, lastActiveDate: '', longestStreak: 0
  });

  const [showStats, setShowStats] = useState(false);

  // NEW: Feature states

  const [preferredServings, setPreferredServings] = useState({}); // { recipeName: 2 }
  const [voiceListening, setVoiceListening] = useState(false);
  const [tooltipsSeen, setTooltipsSeen] = useState({});
  const [allergens, setAllergens] = useState([]); // ['peanuts', 'dairy', ...]
  const [showSplash, setShowSplash] = useState(true);

  const [streamingRecipes, setStreamingRecipes] = useState(false);

  // Recipe Remix (chat-style recipe modification)
  const [remixOpen, setRemixOpen] = useState(false);
  const [remixInput, setRemixInput] = useState('');
  const [remixLoading, setRemixLoading] = useState(false);
  const [remixHistory, setRemixHistory] = useState([]);
  
  // New improvements
  const [useMetric, setUseMetric] = useState(false);
  const [tappedRecipeId, setTappedRecipeId] = useState(null); // loading shimmer on card tap
  const [editingIngredient, setEditingIngredient] = useState(null); // { index, amount, item } for inline edit
  const [searchCount, setSearchCount] = useState(0); // for onboarding nudge
  const [showPrefNudge, setShowPrefNudge] = useState(false);
  const [showNutritionEdit, setShowNutritionEdit] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const confirmTimer = useRef(null);
  const tapConfirm = (id, action) => {
    if (confirmId === id) { action(); setConfirmId(null); clearTimeout(confirmTimer.current); }
    else { setConfirmId(id); clearTimeout(confirmTimer.current); confirmTimer.current = setTimeout(() => setConfirmId(null), 3000); }
  };
  const [showScanHistory, setShowScanHistory] = useState(false);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const mealScanInputRef = useRef(null);
  const mealCameraInputRef = useRef(null);
  const resultSourceRef = useRef(null); // Tracks what generated current results: {type:'search',query} or {type:'scan'}

  // Load saved data from storage
  useEffect(() => {
    loadFromStorage();
    const splashTimer = setTimeout(() => setShowSplash(false), 1800);
    // Offline detection
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    setIsOffline(!navigator.onLine);
    return () => { clearTimeout(splashTimer); window.removeEventListener('offline', goOffline); window.removeEventListener('online', goOnline); };
  }, []);

  // FIX #5: Timer effect - fixed stale closure and added completion notification
  useEffect(() => {
    if (activeTimer !== null) {
      timerIntervalRef.current = setInterval(() => {
        setTimers(prev => {
          const newTimers = { ...prev };
          if (newTimers[activeTimer] > 0) {
            newTimers[activeTimer]--;
            if (newTimers[activeTimer] === 0) {
              clearInterval(timerIntervalRef.current);
              setTimerDone(true);
              setActiveTimer(null);
              playTimerSound();
              setTimeout(() => setTimerDone(false), 5000);
            }
          }
          return newTimers;
        });
      }, 1000);
      
      return () => clearInterval(timerIntervalRef.current);
    }
  }, [activeTimer]);

  // Cook elapsed time counter
  useEffect(() => {
    if (!cookMode || !cookStartTime) return;
    const id = setInterval(() => setCookElapsed(Math.round((Date.now() - cookStartTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [cookMode, cookStartTime]);

  const loadFromStorage = async () => {
    try {
      // ONE-TIME RESET: Delete this block after testing
      const resetFlag = await window.storage.get('fresh-reset-v1').catch(() => null);
      if (!resetFlag?.value) {
        const allKeys = [
          'saved-recipes', 'preferences', 'shopping-list', 'pantry-items',
          'collections', 'recipe-history', 'recipe-notes', 'recipe-ratings',
          'meal-plan', 'dark-mode', 'scan-history', 'onboarding-done', 'user-profile', 'food-log',
          'user-stats', 'cached-recipes', 'preferred-servings', 'tooltips-seen', 'allergens',
          'recent-searches', 'use-metric', 'search-count', 'api-cache', 'meal-slots'
        ];
        for (const k of allKeys) { try { await window.storage.delete(k); } catch(e) {} }
        await window.storage.set('fresh-reset-v1', JSON.stringify(true));
        return; // Start fresh
      }
      const keys = [
        'saved-recipes', 'preferences', 'shopping-list', 'pantry-items',
        'collections', 'recipe-history', 'recipe-notes', 'recipe-ratings',
        'meal-plan', 'dark-mode', 'scan-history', 'onboarding-done', 'user-profile', 'food-log',
        'user-stats', 'cached-recipes',
        'preferred-servings', 'tooltips-seen', 'allergens', 'recent-searches',
        'use-metric', 'search-count', 'meal-slots'
      ];
      
      const results = await Promise.all(
        keys.map(key => window.storage.get(key).catch(() => null))
      );

      const [saved, prefs, shopping, pantry, colls, history, notes, ratings, plan, dark, scans, onboard, profile, flog, ustats, cached, prefServ, tipsSeen, userAllergens, recentSrch, metric, srchCnt, mealSlotsData] = results;

      if (saved?.value) setSavedRecipes(JSON.parse(saved.value));
      if (prefs?.value) setPreferences(JSON.parse(prefs.value));
      if (shopping?.value) setShoppingList(JSON.parse(shopping.value));
      if (pantry?.value) setPantryItems(JSON.parse(pantry.value));
      if (colls?.value) setCollections(JSON.parse(colls.value));
      if (history?.value) setRecipeHistory(JSON.parse(history.value));
      if (notes?.value) setRecipeNotes(JSON.parse(notes.value));
      if (ratings?.value) setRecipeRatings(JSON.parse(ratings.value));
      if (plan?.value) setMealPlan(JSON.parse(plan.value));
      if (dark?.value) setDarkMode(JSON.parse(dark.value));
      if (scans?.value) setScanHistory(JSON.parse(scans.value));
      if (profile?.value) setUserProfile(JSON.parse(profile.value));
      // Only skip onboarding if it was completed AND a name was actually set
      const parsedProfile = profile?.value ? JSON.parse(profile.value) : null;
      if (onboard?.value && JSON.parse(onboard.value) && parsedProfile?.name) {
        setOnboardingDone(true);
      } else {
        setOnboardingDone(false);
      }
      if (flog?.value) setFoodLog(JSON.parse(flog.value));
      if (ustats?.value) setStats(JSON.parse(ustats.value));
      if (cached?.value) setCachedRecipes(JSON.parse(cached.value));
      if (prefServ?.value) setPreferredServings(JSON.parse(prefServ.value));
      if (tipsSeen?.value) setTooltipsSeen(JSON.parse(tipsSeen.value));
      if (userAllergens?.value) setAllergens(JSON.parse(userAllergens.value));
      if (recentSrch?.value) setRecentSearches(JSON.parse(recentSrch.value));
      if (metric?.value) setUseMetric(JSON.parse(metric.value));
      if (srchCnt?.value) setSearchCount(JSON.parse(srchCnt.value));
      if (mealSlotsData?.value) { const slots = JSON.parse(mealSlotsData.value); if (Array.isArray(slots) && slots.length >= 3) setMealSlots(slots); }
    } catch (err) {
      console.error('Failed to load from storage:', err);
    }
  };

  const saveToStorage = async (key, value) => {
    try {
      await window.storage.set(key, JSON.stringify(value));
    } catch (err) {
      console.error('Failed to save to storage:', err);
    }
  };

  // ==================== API CACHE SYSTEM ====================
  // All cache entries stored under a single storage key to avoid rate limits.
  // In-memory cache is the primary layer; persistent storage is backup across sessions.
  
  const cacheStatsRef = useRef({ hits: 0, misses: 0, saved: 0 });
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0, saved: 0, totalEntries: 0 });
  const cacheRef = useRef({}); // Single object: { "type:hash": { data, timestamp } }
  const cacheLoaded = useRef(false);

  const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
  const CACHE_KEY = 'api-cache';

  const makeCacheId = (type, input) => {
    const normalized = Array.isArray(input)
      ? input.map(s => s.toLowerCase().trim()).sort().join(',')
      : input.toLowerCase().trim().replace(/\s+/g, ' ');
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) hash = ((hash << 5) - hash + normalized.charCodeAt(i)) | 0;
    return `${type}:${Math.abs(hash).toString(36)}`;
  };

  const loadCache = async () => {
    if (cacheLoaded.current) return;
    try {
      const result = await window.storage.get(CACHE_KEY);
      if (result?.value) {
        const stored = JSON.parse(result.value);
        // Prune expired entries on load
        const now = Date.now();
        for (const k of Object.keys(stored)) {
          if (now - stored[k].timestamp < CACHE_TTL) cacheRef.current[k] = stored[k];
        }
      }
    } catch (e) {}
    cacheLoaded.current = true;
  };

  const persistCache = async () => {
    try { await window.storage.set(CACHE_KEY, JSON.stringify(cacheRef.current)); } catch (e) {}
  };

  const getCache = async (type, input) => {
    await loadCache();
    const id = makeCacheId(type, input);
    const entry = cacheRef.current[id];
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
      cacheStatsRef.current.hits++;
      cacheStatsRef.current.saved++;
      return entry.data;
    }
    if (entry) delete cacheRef.current[id]; // expired
    cacheStatsRef.current.misses++;
    return null;
  };

  const setCache = async (type, input, data) => {
    const id = makeCacheId(type, input);
    cacheRef.current[id] = { data, timestamp: Date.now() };
    await persistCache();
  };

  const clearAllCache = async () => {
    cacheRef.current = {};
    cacheStatsRef.current = { hits: 0, misses: 0, saved: 0 };
    setCacheStats({ hits: 0, misses: 0, saved: 0, totalEntries: 0 });
    try { await window.storage.delete(CACHE_KEY); } catch (e) {}
    showToast('Cache cleared');
  };

  const loadCacheStats = async () => {
    await loadCache();
    setCacheStats({ ...cacheStatsRef.current, totalEntries: Object.keys(cacheRef.current).length });
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    saveToStorage('dark-mode', newMode);
  };

  // FIX #11: Contextual back navigation
  const nav = (s) => { setStep(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const goBack = () => {
    if (shareCardRecipe) { setShareCardRecipe(null); return; }
    if (remixOpen) { setRemixOpen(false); return; }

    if (showStats) { setShowStats(false); return; }
    if (showScanHistory) { setShowScanHistory(false); return; }
    if (showManualLog) { setShowManualLog(false); return; }
    if (mealScanResult) { setMealScanResult(null); setMealScanImage(null); return; }
    if (showMealScanner) { setShowMealScanner(false); setMealScanImage(null); setMealScanResult(null); return; }
    if (showTracker) { setShowTracker(false); setTrackerDate(new Date().toISOString().split('T')[0]); return; }

    if (selectedRecipe) { setSelectedRecipe(null); setRemixOpen(false); setRemixHistory([]); return; }
    if (showSaved) { setShowSaved(false); return; }
    if (showShoppingList) { setShowShoppingList(false); return; }
    if (showSettings) { setShowSettings(false); return; }
    if (showCookComplete) { setShowCookComplete(false); setCookMode(false); if (wakeLockRef.current) { wakeLockRef.current.release().catch(() => {}); wakeLockRef.current = null; } return; }
    if (cookMode) { exitCookMode(); return; }
    if (step === 'results' && prevStep) {
      nav(prevStep);
      setRecipes([]);
      return;
    }
    if (step === 'review') { if (recipes.length > 0) { nav('results'); } else { nav(images.length > 0 ? 'capture' : 'home'); } return; }
    reset();
  };

  // Pantry Management
  const addPantryItem = () => {
    if (!newPantryItem.name) return;
    const item = {
      id: Date.now(),
      name: newPantryItem.name,
      quantity: newPantryItem.quantity || '1',
      expiry: newPantryItem.expiry,
      addedDate: new Date().toISOString()
    };
    const newPantry = [...pantryItems, item];
    setPantryItems(newPantry);
    saveToStorage('pantry-items', newPantry);
    setNewPantryItem({ name: '', quantity: '', expiry: '' });
    setShowAddPantry(false);
  };

  const removePantryItem = (id) => {
    const newPantry = pantryItems.filter(item => item.id !== id);
    setPantryItems(newPantry);
    saveToStorage('pantry-items', newPantry);
  };

  // Collections
  const createCollection = () => {
    if (!newCollection) return;
    const collection = { id: Date.now(), name: newCollection, recipes: [] };
    const newCollections = [...collections, collection];
    setCollections(newCollections);
    saveToStorage('collections', newCollections);
    setNewCollection('');
  };

  const addRecipeToCollection = (collectionId, recipe) => {
    const newCollections = collections.map(col => {
      if (col.id === collectionId) {
        if (col.recipes?.some(r => r.name === recipe.name)) return col; // no duplicates
        return { ...col, recipes: [...(col.recipes || []), recipe] };
      }
      return col;
    });
    setCollections(newCollections);
    saveToStorage('collections', newCollections);
  };

  const deleteCollection = (collectionId) => {
    const newCollections = collections.filter(c => c.id !== collectionId);
    setCollections(newCollections);
    saveToStorage('collections', newCollections);
    if (savedFilter?.startsWith('col:')) setSavedFilter('');
    showToast('Collection deleted');
  };

  const importData = (jsonText) => {
    try {
      const data = JSON.parse(jsonText);
      if (data.savedRecipes) { setSavedRecipes(data.savedRecipes); saveToStorage('saved-recipes', data.savedRecipes); }
      if (data.shoppingList) { setShoppingList(data.shoppingList); saveToStorage('shopping-list', data.shoppingList); }
      if (data.pantryItems) { setPantryItems(data.pantryItems); saveToStorage('pantry-items', data.pantryItems); }
      if (data.mealPlan) { setMealPlan(data.mealPlan); saveToStorage('meal-plan', data.mealPlan); }
      if (data.foodLog) { setFoodLog(data.foodLog); saveToStorage('food-log', data.foodLog); }
      if (data.recipeHistory) { setRecipeHistory(data.recipeHistory); saveToStorage('recipe-history', data.recipeHistory); }
      if (data.recipeNotes) { setRecipeNotes(data.recipeNotes); saveToStorage('recipe-notes', data.recipeNotes); }
      if (data.recipeRatings) { setRecipeRatings(data.recipeRatings); saveToStorage('recipe-ratings', data.recipeRatings); }
      if (data.collections) { setCollections(data.collections); saveToStorage('collections', data.collections); }
      if (data.stats) { setStats(data.stats); saveToStorage('user-stats', data.stats); }
      showToast('Data imported successfully!');
    } catch (e) {
      showToast('Invalid backup file', 'error');
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => importData(ev.target.result);
    reader.readAsText(file);
    e.target.value = '';
  };

  // Recipe Notes & Ratings
  const saveRecipeNote = (recipeName, note) => {
    const newNotes = { ...recipeNotes, [recipeName]: note };
    setRecipeNotes(newNotes);
    saveToStorage('recipe-notes', newNotes);
  };

  const saveRecipeRating = (recipeName, rating) => {
    const newRatings = { ...recipeRatings, [recipeName]: rating };
    setRecipeRatings(newRatings);
    saveToStorage('recipe-ratings', newRatings);
  };

  // Recipe History
  const addToHistory = (recipe) => {
    const historyEntry = {
      ...recipe,
      cookedDate: new Date().toISOString(),
      id: Date.now()
    };
    const newHistory = [historyEntry, ...recipeHistory.slice(0, 19)];
    setRecipeHistory(newHistory);
    saveToStorage('recipe-history', newHistory);
  };

  // Meal Planner
  const addToMealPlan = (date, mealType, recipe) => {
    const newPlan = { ...mealPlan };
    if (!newPlan[date]) newPlan[date] = {};
    newPlan[date][mealType] = recipe;
    setMealPlan(newPlan);
    saveToStorage('meal-plan', newPlan);
  };

  const removeFromMealPlan = (date, mealType) => {
    const newPlan = { ...mealPlan };
    if (newPlan[date]) {
      delete newPlan[date][mealType];
      if (Object.keys(newPlan[date]).length === 0) delete newPlan[date];
    }
    setMealPlan(newPlan);
    saveToStorage('meal-plan', newPlan);
  };

  const [newMealSlotName, setNewMealSlotName] = useState('');
  const addMealSlot = (slotName) => {
    const name = slotName.trim();
    if (!name) return;
    if (mealSlots.length >= 5) { showToast('Maximum 5 meal slots', 'info'); return; }
    if (mealSlots.some(s => s.toLowerCase() === name.toLowerCase())) { showToast('That meal already exists', 'info'); return; }
    const updated = [...mealSlots, name];
    setMealSlots(updated);
    saveToStorage('meal-slots', updated);
    setNewMealSlotName('');
  };
  const removeMealSlot = (slotName) => {
    const idx = mealSlots.indexOf(slotName);
    if (idx < 3) return; // Can't remove the first 3 default slots
    const updated = mealSlots.filter(s => s !== slotName);
    setMealSlots(updated);
    saveToStorage('meal-slots', updated);
    // Also clean up any planned meals in this slot
    const newPlan = { ...mealPlan };
    Object.keys(newPlan).forEach(date => {
      if (newPlan[date]?.[slotName]) {
        delete newPlan[date][slotName];
        if (Object.keys(newPlan[date]).length === 0) delete newPlan[date];
      }
    });
    setMealPlan(newPlan);
    saveToStorage('meal-plan', newPlan);
  };
  const renameMealSlot = (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) { setEditingMealSlot(null); return; }
    if (mealSlots.some(s => s !== oldName && s.toLowerCase() === trimmed.toLowerCase())) { showToast('That meal name already exists', 'info'); return; }
    const updatedSlots = mealSlots.map(s => s === oldName ? trimmed : s);
    setMealSlots(updatedSlots);
    saveToStorage('meal-slots', updatedSlots);
    // Migrate existing meal plan data from old name to new name
    const newPlan = { ...mealPlan };
    Object.keys(newPlan).forEach(date => {
      if (newPlan[date]?.[oldName]) {
        newPlan[date][trimmed] = newPlan[date][oldName];
        delete newPlan[date][oldName];
      }
    });
    setMealPlan(newPlan);
    saveToStorage('meal-plan', newPlan);
    setEditingMealSlot(null);
  };

  // Recipe Search (AI-powered) — cached
  const searchRecipes = async (query) => {
    if (streamingRecipes) return;
    if (isOffline) { setError('No internet connection. Try again when online.'); return; }
    // Save to recent searches
    const trimmed = query.trim();
    if (trimmed) {
      const updated = [trimmed, ...recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      setRecentSearches(updated);
      saveToStorage('recent-searches', updated);
    }
    setPrevStep('search');
    setError('');
    // Track searches for onboarding nudge
    const newCount = searchCount + 1;
    setSearchCount(newCount);
    saveToStorage('search-count', newCount);
    if (newCount === 3 && preferences.dietary.length === 0 && preferences.cuisines.length === 0) {
      setShowPrefNudge(true);
    }
    
    const cacheInput = `${query}|${preferences.dietary.join(',')}|${preferences.cuisines.join(',')}|${preferences.skillLevel}|${preferences.maxTime}|${allergens.join(',')}`;
    const cached = await getCache('search', cacheInput);
    resultSourceRef.current = { type: 'search', query: trimmed };
    if (cached) {
      setRecipes(cached);
      setStep('results');
      return;
    }

    setStep('results');
    setRecipes([]);
    setStreamingRecipes(true);

    try {
      const response = await fetchWithRetry("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 900,
          messages: [{
            role: "user",
            content: `Find 4 diverse recipes (single serving each) based on this search: "${query}". ${preferences.dietary.length > 0 ? `Dietary: ${preferences.dietary.join(', ')}.` : ''} ${preferences.cuisines.length > 0 ? `Cuisines: ${preferences.cuisines.join(', ')}.` : ''} ${preferences.skillLevel !== 'any' ? `Skill: ${preferences.skillLevel}.` : ''} ${preferences.maxTime !== 'any' ? `Max time: ${preferences.maxTime}.` : ''} ${allergens.length > 0 ? `MUST AVOID these allergens completely: ${allergens.join(', ')}.` : ''} Return ONLY a JSON array, no markdown, no backticks: [{"name": "Recipe Name", "cookTime": "25 mins", "servings": 1, "difficulty": "Easy", "cuisine": "Italian", "ingredientsUsed": ["ingredient1"], "description": "Brief description", "costTier": "budget or moderate or pricey"}]`
          }]
        })
      });
      const data = await response.json();
      const recipesText = (data.content?.[0]?.text || '').trim();
      if (!recipesText) throw new Error('Empty response');
      const parsedRecipes = safeParseJSON(recipesText);
      setRecipes(parsedRecipes);
      setStreamingRecipes(false);
      await setCache('search', cacheInput, parsedRecipes);
    } catch (err) {
      console.error('Search error:', err);
      setStreamingRecipes(false);
      setError('Search failed. Please try again.');
      setStep('search');
    }
  };

  // Cook Mode Functions
  const startCookMode = (recipe) => {
    setCookMode(true);
    setCurrentStep(0);
    setSelectedRecipe(recipe);
    setTimerDone(false);
    setShowCookComplete(false);
    setCookStartTime(Date.now());
    setCookElapsed(0);
    setCheckedIngredients({});
    setShowIngredientPanel(false);
    addToHistory(recipe);
    const pref = getPreferredServings(recipe.name);
    if (pref) setServings(pref);
    const newTimers = {};
    recipe.instructions?.forEach((_, index) => { newTimers[index] = 0; });
    setTimers(newTimers);
    // Keep screen awake
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(lock => { wakeLockRef.current = lock; }).catch(() => {});
    }
  };

  const exitCookMode = () => {
    setCookMode(false);
    setShowCookComplete(false);
    pauseTimer();
    if (wakeLockRef.current) { wakeLockRef.current.release().catch(() => {}); wakeLockRef.current = null; }
  };

  const completeCook = () => {
    pauseTimer();
    trackCook();
    pantryAutoDeduct(selectedRecipe);
    playTimerSound();
    const elapsed = Math.round((Date.now() - (cookStartTime || Date.now())) / 1000);
    setCookElapsed(elapsed);
    if (selectedRecipe.nutrition) {
      const today = new Date().toISOString().split('T')[0];
      const alreadyLogged = (foodLog[today] || []).some(e => e.name && e.name.startsWith(selectedRecipe.name));
      if (!alreadyLogged) {
        addFoodEntry({ name: selectedRecipe.name, calories: parseInt(selectedRecipe.nutrition.calories) || 0, protein: parseInt(selectedRecipe.nutrition.protein) || 0, carbs: parseInt(selectedRecipe.nutrition.carbs) || 0, fat: parseInt(selectedRecipe.nutrition.fat) || 0 });
      }
    }
    setShowCookComplete(true);
  };

  // Auto-detect timer duration from instruction text — returns { seconds, label } or null
  const detectTimer = (instruction) => {
    if (!instruction) return null;
    const lower = instruction.toLowerCase();
    // Skip if just mentioning time casually (e.g. "this takes about 30 minutes total")
    if (/total\s*(cook|time)/i.test(lower)) return null;

    // Hour + minute combo: "1 hour and 30 minutes", "1hr 15min"
    const hmCombo = lower.match(/(\d+)\s*(?:hour|hr)s?\s*(?:and\s*)?(\d+)\s*(?:minute|min)s?/);
    if (hmCombo) { const s = parseInt(hmCombo[1]) * 3600 + parseInt(hmCombo[2]) * 60; return { seconds: s, label: `${hmCombo[1]}h ${hmCombo[2]}m` }; }

    // Range: "8-10 minutes", "15 to 20 min", "20–25 minutes"
    const range = lower.match(/(\d+)\s*[-–to]+\s*(\d+)\s*(?:minute|min)s?/);
    if (range) { const avg = Math.round((parseInt(range[1]) + parseInt(range[2])) / 2); return { seconds: avg * 60, label: `${avg}m` }; }

    const secRange = lower.match(/(\d+)\s*[-–to]+\s*(\d+)\s*(?:second|sec)s?/);
    if (secRange) { const avg = Math.round((parseInt(secRange[1]) + parseInt(secRange[2])) / 2); return { seconds: avg, label: `${avg}s` }; }

    // Single minutes: "for 5 minutes", "about 20 min", "simmer 10 minutes"
    const mins = lower.match(/(\d+)\s*(?:minute|min)s?/);
    if (mins) { const m = parseInt(mins[1]); return { seconds: m * 60, label: `${m}m` }; }

    // Hours: "for 2 hours", "bake 1 hour"
    const hrs = lower.match(/(\d+)\s*(?:hour|hr)s?/);
    if (hrs) { const h = parseInt(hrs[1]); return { seconds: h * 3600, label: `${h}h` }; }

    // Seconds: "for 30 seconds", "about 45 sec"
    const secs = lower.match(/(\d+)\s*(?:second|sec)s?/);
    if (secs) { const s = parseInt(secs[1]); return { seconds: s, label: `${s}s` }; }

    return null;
  };

  // Find ingredients mentioned in a specific step
  const getStepIngredients = (stepText, ingredients) => {
    if (!stepText || !ingredients?.length) return [];
    const lower = stepText.toLowerCase();
    return ingredients.filter(ing => {
      const name = (ing.item || ing.name || (typeof ing === 'string' ? ing : '')).toLowerCase();
      return name.length > 2 && lower.includes(name);
    });
  };

  const startTimer = (stepIndex, seconds) => {
    setTimerDone(false);
    setTimers(prev => ({ ...prev, [stepIndex]: seconds }));
    setActiveTimer(stepIndex);
  };

  const pauseTimer = () => {
    clearInterval(timerIntervalRef.current);
    setActiveTimer(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Add image to the queue (no analysis yet)
  const MAX_PHOTOS = 5;

  const handleImageCapture = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');

    if (images.length >= MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos allowed. Remove one to add another.`);
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const compressed = await compressImage(e.target.result, 1600, 0.85);
      setImages(prev => [...prev, { src: compressed, type: 'image/jpeg' }]);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const removeImage = (index) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      // Clamp fullscreen index if it would be out of bounds
      if (fullImageIndex >= next.length && next.length > 0) {
        setFullImageIndex(next.length - 1);
      }
      if (next.length === 0) setShowFullImage(false);
      return next;
    });
  };

  // Create a small thumbnail from a base64 image
  const createThumbnail = (src, maxSize) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  // Load a previous scan into the review step
  const loadScan = (scan) => {
    setIngredients([...scan.ingredients]);
    setImages([]);
    setPrevStep('home');
    setStep('review');
  };

  const deleteScan = (id) => {
    const newHistory = scanHistory.filter(s => s.id !== id);
    setScanHistory(newHistory);
    saveToStorage('scan-history', newHistory);
  };

  // Detailed prompt for ingredient identification — structured zone-by-zone scan
  const SCAN_PROMPT = `Identify EVERY food item visible in this image. Be thorough — check all areas including edges, shelves, doors, and behind other items. Read visible labels/brands.

RULES:
- Be specific: "roma tomatoes" not "tomatoes", "extra virgin olive oil" not "oil"
- Use cooking names: "chicken breast" not "poultry product"
- Include state when relevant: "frozen peas", "canned black beans"
- Skip non-food items
- If you can see it, list it

Return ONLY a JSON array: ["ingredient1", "ingredient2", ...]`;

  // Analyze images — single call for 1 photo, parallel for multiple
  const analyzeAllImages = async () => {
    if (images.length === 0) return;
    if (step === 'analyzing') return;
    if (isOffline) { setError('No internet — can\'t scan photos offline.'); return; }
    setPrevStep('capture');
    setStep('analyzing');
    setError('');
    setScanProgress({ current: 0, total: images.length });

    try {
      const scanImages = await Promise.all(images.map(img => compressForScan(img.src)));

      const pantryContext = pantryItems.length > 0
        ? ` User's pantry: ${pantryItems.map(p => p.name).join(', ')}.`
        : '';

      let allIngredients;
      if (scanImages.length === 1) {
        // Single image — one call
        const response = await fetchWithRetry("/api/anthropic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 800,
            messages: [{
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: 'image/jpeg', data: scanImages[0].split(',')[1] }},
                { type: "text", text: SCAN_PROMPT + pantryContext }
              ]
            }]
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(typeof data.error === 'string' ? data.error : data.error.message || 'API error');
        const text = data.content?.[0]?.text?.trim();
        setScanProgress({ current: 1, total: 1 });
        if (!text) throw new Error('Empty');
        allIngredients = safeParseJSON(text);
      } else {
        // Multiple images — parallel calls for speed
        let completed = 0;
        const results = await Promise.all(scanImages.map(src =>
          fetchWithRetry("/api/anthropic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-sonnet-4-20250514",
              max_tokens: 800,
              messages: [{
                role: "user",
                content: [
                  { type: "image", source: { type: "base64", media_type: 'image/jpeg', data: src.split(',')[1] }},
                  { type: "text", text: SCAN_PROMPT + pantryContext }
                ]
              }]
            })
          })
          .then(res => res.json())
          .then(data => {
            completed++;
            setScanProgress({ current: completed, total: images.length });
            const text = data.content?.[0]?.text?.trim();
            return text ? safeParseJSON(text) : [];
          })
          .catch(() => { completed++; setScanProgress({ current: completed, total: images.length }); return []; })
        ));
        allIngredients = results.flat();
      }

      if (!Array.isArray(allIngredients) || allIngredients.length === 0) {
        setError('Could not identify any ingredients. Try clearer photos with better lighting.');
        setStep('capture');
        return;
      }

      // Smart deduplication
      const smartDedup = (items) => {
        const normalize = (s) => {
          let n = s.toLowerCase().trim().replace(/\s+/g, ' ');
          if (n.endsWith('ies') && n.length > 4) n = n.slice(0, -3) + 'y';
          else if (n.endsWith('ves') && n.length > 4) n = n.slice(0, -3) + 'f';
          else if (n.endsWith('oes') && n.length > 4) n = n.slice(0, -2);
          else if (n.endsWith('es') && n.length > 3) n = n.slice(0, -2);
          else if (n.endsWith('s') && !n.endsWith('ss') && n.length > 3) n = n.slice(0, -1);
          return n;
        };
        const coreWords = (s) => {
          const skip = new Set(['fresh', 'organic', 'whole', 'raw', 'large', 'small', 'medium', 'ripe', 'dried', 'frozen', 'canned', 'sliced', 'diced', 'chopped', 'minced', 'ground']);
          return normalize(s).split(' ').filter(w => !skip.has(w) && w.length > 1);
        };
        const groups = [];
        items.forEach(item => {
          const norm = normalize(item);
          const core = coreWords(item);
          const match = groups.find(g => {
            const gNorm = normalize(g.best);
            const gCore = coreWords(g.best);
            if (gNorm === norm) return true;
            if (gNorm.includes(norm) || norm.includes(gNorm)) return true;
            if (core.length > 0 && gCore.length > 0) {
              const coreSet = new Set(core);
              const gCoreSet = new Set(gCore);
              const shorter = coreSet.size <= gCoreSet.size ? coreSet : gCoreSet;
              const longer = coreSet.size <= gCoreSet.size ? gCoreSet : coreSet;
              if ([...shorter].every(w => longer.has(w))) return true;
            }
            return false;
          });
          if (match) {
            if (item.length > match.best.length) match.best = item;
          } else {
            groups.push({ best: item });
          }
        });
        return groups.map(g => g.best).sort((a, b) => a.localeCompare(b));
      };

      const unique = smartDedup(allIngredients);
      setIngredients(unique);

      // Save scan to history
      try {
        const thumbnails = await Promise.all(
          images.slice(0, 5).map(img => createThumbnail(img.src, 400))
        );
        const scanEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          ingredients: unique,
          thumbnails,
          photoCount: images.length
        };
        const newHistory = [scanEntry, ...scanHistory.slice(0, 9)];
        setScanHistory(newHistory);
        saveToStorage('scan-history', newHistory);
      } catch (e) {
        console.error('Failed to save scan history:', e);
      }

      trackScan();
      generateRecipesFromIngredients(unique);
    } catch (err) {
      console.error('Scan error:', err);
      const msg = err.message || '';
      if (msg.includes('ANTHROPIC_API_KEY')) {
        setError('API key not configured. Add ANTHROPIC_API_KEY in Netlify → Site configuration → Environment variables.');
      } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('Network error — check your internet connection.');
      } else {
        setError('Analysis failed: ' + (msg || 'Unknown error. Check browser console for details.'));
      }
      setStep('capture');
    }
  };

  // Fire recipe generation from a given ingredient list (used by auto-flow and manual)
  const generateRecipesFromIngredients = async (ingredientList) => {
    if (!ingredientList || ingredientList.length === 0) {
      setError('Add at least one ingredient to find recipes.');
      return;
    }
    setPrevStep('review');

    // Cache key: sorted ingredients + preferences
    const cacheInput = [...ingredientList, `|${preferences.dietary.join(',')}`, `|${preferences.cuisines.join(',')}`, `|${preferences.skillLevel}`, `|${preferences.maxTime}`, `|${allergens.join(',')}`];
    resultSourceRef.current = { type: 'scan' };
    const cached = await getCache('recipes', cacheInput);
    if (cached) {
      setRecipes(cached);
      setStep('results');
      return;
    }
    if (isOffline) { setError('No internet — cached recipes will still work.'); return; }

    setStep('results');
    setRecipes([]);
    setStreamingRecipes(true);

    try {
      let constraints = '';
      if (preferences.dietary.length > 0) constraints += `Dietary: ${preferences.dietary.join(', ')}. `;
      if (preferences.cuisines.length > 0) constraints += `Preferred cuisines: ${preferences.cuisines.join(', ')}. `;
      if (preferences.skillLevel && preferences.skillLevel !== 'any') constraints += `Skill level: ${preferences.skillLevel}. `;
      if (preferences.maxTime && preferences.maxTime !== 'any') constraints += `Max cook time: ${preferences.maxTime} minutes. `;
      if (allergens.length > 0) constraints += `MUST AVOID allergens: ${allergens.join(', ')}. `;

      const recipeResponse = await fetchWithRetry("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 900,
          messages: [{
            role: "user",
            content: `Ingredients: ${ingredientList.join(', ')}. ${constraints}Generate 4 diverse recipes (single serving each). Return ONLY a JSON array, no markdown, no backticks: [{"name": "Recipe Name", "cookTime": "25 mins", "servings": 1, "difficulty": "Easy", "cuisine": "Italian", "ingredientsUsed": ["ing1"], "description": "Brief desc", "costTier": "budget or moderate or pricey"}]`
          }]
        })
      });
      const recipeData = await recipeResponse.json();
      const recipesText = (recipeData.content?.[0]?.text || '').trim();
      if (!recipesText) throw new Error('Empty response');
      const parsedRecipes = safeParseJSON(recipesText);
      setRecipes(parsedRecipes);
      setStreamingRecipes(false);

      // Count search for preference nudge
      const newCount = searchCount + 1;
      setSearchCount(newCount);
      saveToStorage('search-count', newCount);
      if (newCount === 3 && preferences.dietary.length === 0 && preferences.cuisines.length === 0) setShowPrefNudge(true);

      await setCache('recipes', cacheInput, parsedRecipes);
    } catch (err) {
      console.error('Recipe generation error:', err);
      setError('Failed to generate recipes. Please try again.');
      setStreamingRecipes(false);
    }
  };

  // Generate recipes from confirmed ingredients (called from review step) — cached
  // Generate recipes from review screen (manual trigger)
  const generateRecipes = () => generateRecipesFromIngredients(ingredients);

  // Regenerate — fetch a fresh batch, excluding current recipe names
  const regenerateRecipes = async () => {
    if (streamingRecipes) return;
    const src = resultSourceRef.current;
    if (!src) return;
    const excludeNames = recipes.map(r => r.name);
    const excludeHint = excludeNames.length > 0 ? ` Do NOT suggest any of these recipes: ${excludeNames.join(', ')}. Suggest completely different dishes.` : '';

    setRecipes([]);
    setStreamingRecipes(true);
    setError('');

    try {
      if (src.type === 'search') {
        const response = await fetchWithRetry("/api/anthropic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 900,
            messages: [{
              role: "user",
              content: `Find 4 diverse recipes (single serving each) based on this search: "${src.query}". ${preferences.dietary.length > 0 ? `Dietary: ${preferences.dietary.join(', ')}.` : ''} ${preferences.cuisines.length > 0 ? `Cuisines: ${preferences.cuisines.join(', ')}.` : ''} ${preferences.skillLevel !== 'any' ? `Skill: ${preferences.skillLevel}.` : ''} ${preferences.maxTime !== 'any' ? `Max time: ${preferences.maxTime}.` : ''} ${allergens.length > 0 ? `MUST AVOID these allergens completely: ${allergens.join(', ')}.` : ''}${excludeHint} Return ONLY a JSON array, no markdown, no backticks: [{"name": "Recipe Name", "cookTime": "25 mins", "servings": 1, "difficulty": "Easy", "cuisine": "Italian", "ingredientsUsed": ["ingredient1"], "description": "Brief description", "costTier": "budget or moderate or pricey"}]`
            }]
          })
        });
        const data = await response.json();
        const text = (data.content?.[0]?.text || '').trim();
        if (!text) throw new Error('Empty');
        setRecipes(safeParseJSON(text));
      } else {
        let constraints = '';
        if (preferences.dietary.length > 0) constraints += `Dietary: ${preferences.dietary.join(', ')}. `;
        if (preferences.cuisines.length > 0) constraints += `Preferred cuisines: ${preferences.cuisines.join(', ')}. `;
        if (preferences.skillLevel && preferences.skillLevel !== 'any') constraints += `Skill level: ${preferences.skillLevel}. `;
        if (preferences.maxTime && preferences.maxTime !== 'any') constraints += `Max cook time: ${preferences.maxTime} minutes. `;
        if (allergens.length > 0) constraints += `MUST AVOID allergens: ${allergens.join(', ')}. `;
        const response = await fetchWithRetry("/api/anthropic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 900,
            messages: [{
              role: "user",
              content: `Ingredients: ${ingredients.join(', ')}. ${constraints}${excludeHint} Generate 4 diverse recipes (single serving each). Return ONLY a JSON array, no markdown, no backticks: [{"name": "Recipe Name", "cookTime": "25 mins", "servings": 1, "difficulty": "Easy", "cuisine": "Italian", "ingredientsUsed": ["ing1"], "description": "Brief desc", "costTier": "budget or moderate or pricey"}]`
            }]
          })
        });
        const data = await response.json();
        const text = (data.content?.[0]?.text || '').trim();
        if (!text) throw new Error('Empty');
        setRecipes(safeParseJSON(text));
      }
    } catch (err) {
      console.error('Regenerate error:', err);
      setError('Failed to regenerate. Please try again.');
    }
    setStreamingRecipes(false);
  };

  // Ingredient editing helpers
  const removeIngredient = (index) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    const trimmed = newIngredient.trim();
    if (!trimmed) return;
    if (ingredients.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      setError('That ingredient is already in the list.');
      return;
    }
    setIngredients(prev => [...prev, trimmed].sort((a, b) => a.localeCompare(b)));
    setNewIngredient('');
  };

  // FIX #4: getFullRecipe — single API call for everything
  const getFullRecipe = async (recipe) => {
    if (selectedRecipe?.loading) return; // prevent double-tap
    setTappedRecipeId(recipe.name);
    setSelectedRecipe({ ...recipe, loading: true });
    setEditingIngredient(null);
    setRemixOpen(false);
    setRemixHistory([]);
    setRemixInput('');
    trackRecipeView();
    setServings(recipe.servings || 1);
    setOriginalServings(recipe.servings || 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Check cache first — recipe details don't change
    const cached = await getCache('fullrecipe', recipe.name);
    if (cached) {
      setSelectedRecipe({ ...recipe, ...cached, loading: false });
      setTappedRecipeId(null);
      return;
    }
    if (isOffline) { setSelectedRecipe(null); setTappedRecipeId(null); setError('No internet — try a cached recipe.'); return; }

    const ingredientContext = ingredients.length > 0
      ? `Use these available ingredients when possible: ${ingredients.join(', ')}.`
      : `Use common, easily available ingredients.`;

    // SINGLE call: everything in one shot
    try {
      const response = await fetchWithRetry("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          messages: [{            role: "user",
            content: `Full recipe for "${recipe.name}" (${recipe.cuisine || 'any'} cuisine, ${recipe.servings || 1} servings). ${ingredientContext}${allergens.length > 0 ? ` MUST AVOID these allergens completely — do NOT include any ingredients containing: ${allergens.join(', ')}.` : ''} Return ONLY JSON, no markdown: {"ingredients": [{"amount": "1 cup", "item": "rice"}], "instructions": ["Step 1", "Step 2"], "nutrition": {"calories": 450, "protein": "20g", "carbs": "50g", "fat": "15g"}, "substitutions": {"butter": "olive oil or coconut oil"}, "tips": ["Tip 1"], "costTier": "budget or moderate or pricey"}`
          }]
        })
      });
      if (!response.ok) throw new Error(`API error ${response.status}`);
      const data = await response.json();
      const text = (data.content?.[0]?.text || '').trim();
      if (!text) throw new Error('Empty response');
      const fullRecipe = safeParseJSON(text);
      setSelectedRecipe(prev => ({ ...prev, ...fullRecipe, loading: false }));
      setTappedRecipeId(null);
      await setCache('fullrecipe', recipe.name, fullRecipe);
    } catch (err) {
      console.error('Recipe load error:', err);
      setError('Failed to load recipe. Please try again.');
      setSelectedRecipe(null);
      setTappedRecipeId(null);
    }
  };

  const toggleSaveRecipe = (recipe) => {
    const isAlreadySaved = savedRecipes.some(r => r.name === recipe.name);
    const newSaved = isAlreadySaved
      ? savedRecipes.filter(r => r.name !== recipe.name)
      : [...savedRecipes, recipe];
    setSavedRecipes(newSaved);
    saveToStorage('saved-recipes', newSaved);
  };

  const isRecipeSaved = (recipe) => savedRecipes.some(r => r.name === recipe.name);

  const addToShoppingList = (items) => {
    const newItems = items.filter(item => !shoppingList.some(existing => existing.item === item.item))
      .map(item => ({ ...item, checked: false }));
    if (newItems.length === 0) { showToast('All items already on list'); return; }
    const newList = [...shoppingList, ...newItems];
    setShoppingList(newList);
    saveToStorage('shopping-list', newList);
    showToast(`${newItems.length} item${newItems.length > 1 ? 's' : ''} added to shopping list`);
  };

  const toggleShoppingItem = (index) => {
    const newList = [...shoppingList];
    const item = newList[index];
    const wasChecked = item.checked || false;
    item.checked = !wasChecked;
    setShoppingList(newList);
    saveToStorage('shopping-list', newList);
    // Auto-add to pantry when checking off (bought)
    if (!wasChecked) {
      const name = (item.name || item.item || '').replace(/\s*\(×\d+\)\s*$/, '').trim();
      if (name && !pantryItems.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        const newPantry = [...pantryItems, { id: Date.now(), name, quantity: item.amount || '1', category: 'Other' }];
        setPantryItems(newPantry);
        saveToStorage('pantry-items', newPantry);
      }
    }
  };

  // FIX #3: scaleIngredient properly handles fractions like "1/2", "1 1/2", etc.
  const parseFraction = (str) => {
    str = str.trim();
    const mixedMatch = str.match(/^(\d+)\s+(\d+)\/(\d+)/);
    if (mixedMatch) return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
    const fracMatch = str.match(/^(\d+)\/(\d+)/);
    if (fracMatch) return parseInt(fracMatch[1]) / parseInt(fracMatch[2]);
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  };

  const formatAmount = (num) => {
    if (num % 1 === 0) return num.toString();
    const fractions = [[0.25, '1/4'], [0.333, '1/3'], [0.5, '1/2'], [0.667, '2/3'], [0.75, '3/4']];
    const decimal = num % 1;
    const whole = Math.floor(num);
    for (const [val, frac] of fractions) {
      if (Math.abs(decimal - val) < 0.05) return whole > 0 ? `${whole} ${frac}` : frac;
    }
    return num.toFixed(1);
  };

  const scaleIngredient = (ing, origServings, newServings) => {
    const amount = ing.amount;
    if (typeof amount === 'string') {
      const match = amount.match(/^([\d\s/]+)/);
      if (match) {
        const numStr = match[1];
        const parsed = parseFraction(numStr);
        if (parsed !== null) {
          const scaled = (parsed * newServings) / origServings;
          const unit = amount.slice(numStr.length).trim();
          return `${formatAmount(scaled)}${unit ? ' ' + unit : ''}`;
        }
      }
    }
    if (typeof amount === 'number') {
      return formatAmount((amount * newServings) / origServings);
    }
    return amount;
  };

  // ==================== UNIT CONVERSION ====================
  const METRIC_MAP = {
    cup: { to: 'ml', factor: 236.6 }, cups: { to: 'ml', factor: 236.6 },
    tbsp: { to: 'ml', factor: 14.8 }, tablespoon: { to: 'ml', factor: 14.8 }, tablespoons: { to: 'ml', factor: 14.8 },
    tsp: { to: 'ml', factor: 4.9 }, teaspoon: { to: 'ml', factor: 4.9 }, teaspoons: { to: 'ml', factor: 4.9 },
    oz: { to: 'g', factor: 28.35 }, ounce: { to: 'g', factor: 28.35 }, ounces: { to: 'g', factor: 28.35 },
    lb: { to: 'g', factor: 453.6 }, lbs: { to: 'g', factor: 453.6 }, pound: { to: 'g', factor: 453.6 }, pounds: { to: 'g', factor: 453.6 },
    'fl oz': { to: 'ml', factor: 29.6 },
    quart: { to: 'ml', factor: 946 }, quarts: { to: 'ml', factor: 946 },
    pint: { to: 'ml', factor: 473 }, pints: { to: 'ml', factor: 473 },
    gallon: { to: 'L', factor: 3.78 }, gallons: { to: 'L', factor: 3.78 },
  };
  
  const convertToMetric = (amountStr) => {
    if (!useMetric || !amountStr) return amountStr;
    const match = amountStr.match(/^([\d\s/.]+)\s*(.+)$/);
    if (!match) return amountStr;
    const num = parseFraction(match[1]);
    const unit = match[2].trim().toLowerCase();
    const conv = METRIC_MAP[unit];
    if (!conv || num === null) return amountStr;
    let val = num * conv.factor;
    if (conv.to === 'g' && val >= 1000) return `${formatAmount(val / 1000)} kg`;
    if (conv.to === 'ml' && val >= 1000) return `${formatAmount(val / 1000)} L`;
    return `${Math.round(val)} ${conv.to}`;
  };

  // ==================== SHOPPING LIST CATEGORIES ====================
  const GROCERY_CATEGORIES = {
    '🥩 Meat & Seafood': ['chicken','beef','pork','lamb','turkey','salmon','shrimp','fish','bacon','sausage','steak','ground','fillet','thigh','breast','cod','tuna','crab','lobster','ham','prosciutto'],
    '🥛 Dairy & Eggs': ['milk','cream','cheese','butter','yogurt','egg','eggs','sour cream','parmesan','mozzarella','cheddar','ricotta','whipping','half-and-half','ghee','cottage'],
    '🥬 Produce': ['onion','garlic','tomato','potato','carrot','celery','pepper','lettuce','spinach','broccoli','mushroom','cucumber','avocado','lemon','lime','ginger','cilantro','parsley','basil','mint','thyme','rosemary','oregano','scallion','zucchini','corn','bean','pea','cabbage','kale','arugula','apple','banana','orange','berry','berries','jalapeño','chili','bell'],
    '🍞 Bakery & Grains': ['bread','flour','rice','pasta','noodle','tortilla','bun','roll','oat','oats','cereal','cracker','panko','breadcrumb','couscous','quinoa','pita','bagel','croissant','cornstarch'],
    '🥫 Pantry': ['oil','olive oil','vinegar','soy sauce','salt','pepper','sugar','honey','broth','stock','tomato paste','tomato sauce','canned','coconut milk','hot sauce','mustard','ketchup','mayo','worcestershire','vanilla','baking','cocoa','chocolate','syrup','peanut butter','jam','salsa','sriracha','sesame','cumin','paprika','cinnamon','turmeric','cayenne','chili powder','curry','nutmeg'],
    '🧊 Frozen': ['frozen','ice cream','pizza dough'],
    '🥤 Beverages': ['water','juice','wine','beer','soda','coffee','tea'],
  };

  const categorizeShoppingItem = (itemName) => {
    const lower = (itemName || '').toLowerCase();
    for (const [category, keywords] of Object.entries(GROCERY_CATEGORIES)) {
      if (keywords.some(k => lower.includes(k))) return category;
    }
    return '📦 Other';
  };

  const groupedShoppingList = useMemo(() => {
    const groups = {};
    shoppingList.forEach(item => {
      const cat = categorizeShoppingItem(item.name || item.item || (typeof item === 'string' ? item : ''));
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    // Sort: categories with items first, "Other" last
    const order = Object.keys(GROCERY_CATEGORIES);
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === '📦 Other') return 1;
      if (b === '📦 Other') return -1;
      return order.indexOf(a) - order.indexOf(b);
    });
  }, [shoppingList]);

  // ==================== MEAL PLAN AUTO-FILL ====================
  const autoFillMealPlan = async () => {
    if (fillingMealPlan) return;
    if (isOffline) { showToast('No internet — can\'t auto-fill offline.', 'error'); return; }
    setFillingMealPlan(true);

    try {
      // Build nutrition context from user goals
      const cal = userProfile.calorieTarget || 2000;
      const protein = userProfile.proteinTarget || 150;
      const carbs = userProfile.carbTarget || 200;
      const fat = userProfile.fatTarget || 65;
      const goal = userProfile.goal || 'maintain';
      const goalLabel = { lose: 'weight loss', maintain: 'maintenance', gain: 'muscle gain / bulking', explore: 'variety and exploration' }[goal] || 'maintenance';

      let constraints = `Daily nutrition targets: ${cal} calories, ${protein}g protein, ${carbs}g carbs, ${fat}g fat. Goal: ${goalLabel}. `;
      if (preferences.dietary.length > 0) constraints += `Dietary: ${preferences.dietary.join(', ')}. `;
      if (preferences.cuisines.length > 0) constraints += `Preferred cuisines: ${preferences.cuisines.join(', ')}. `;
      if (preferences.skillLevel && preferences.skillLevel !== 'any') constraints += `Skill level: ${preferences.skillLevel}. `;
      if (preferences.maxTime && preferences.maxTime !== 'any') constraints += `Max cook time: ${preferences.maxTime} minutes. `;
      if (allergens.length > 0) constraints += `MUST AVOID allergens: ${allergens.join(', ')}. `;

      // Get date keys for the 7 days
      const today = new Date();
      const dateKeys = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d.toISOString().split('T')[0];
      });

      // Check which slots are already filled
      const emptySlots = [];
      dateKeys.forEach((key, dayIdx) => {
        mealSlots.forEach(meal => {
          if (!mealPlan[key]?.[meal]) emptySlots.push({ key, dayIdx, meal });
        });
      });

      if (emptySlots.length === 0) { showToast('All meal slots are already filled!', 'info'); setFillingMealPlan(false); return; }

      const totalMeals = 7 * mealSlots.length;
      const mealSlotList = mealSlots.join(', ');
      const calorieBreakdown = mealSlots.length === 3
        ? 'Breakfast should be lighter (20-25% of daily calories), Lunch moderate (30-35%), Dinner moderate (35-40%)'
        : `Distribute daily calories reasonably across ${mealSlots.length} meals: ${mealSlotList}. Core meals (Breakfast/Lunch/Dinner) should be larger, extra meals (snacks etc.) should be smaller`;

      const response = await fetchWithRetry("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{
            role: "user",
            content: `Create a 7-day meal plan with these meal slots each day: ${mealSlotList}. ${constraints}

IMPORTANT RULES:
- Each day's meals should add up CLOSE to the daily calorie and macro targets
- ${calorieBreakdown}
- Vary cuisines and ingredients across the week — avoid repetition
- All recipes should be practical, real dishes a home cook can make
- Single serving portions

Return ONLY a JSON array of ${totalMeals} objects (Day1 ${mealSlots[0]}, Day1 ${mealSlots[1]}, ...):
[{"day":1,"meal":"${mealSlots[0]}","name":"Recipe Name","cookTime":"15 mins","servings":1,"difficulty":"Easy","cuisine":"American","description":"Brief desc","calories":450,"protein":30,"carbs":40,"fat":15}]`
          }]
        })
      });

      const data = await response.json();
      const text = (data.content?.[0]?.text || '').trim();
      if (!text) throw new Error('Empty response');
      const meals = safeParseJSON(text);

      if (!Array.isArray(meals) || meals.length === 0) throw new Error('Invalid meal plan');

      // Slot the meals into the plan, only filling empty spots
      const newPlan = { ...mealPlan };
      const mealsBySlot = {};
      meals.forEach(m => {
        const slotKey = `${m.day}-${m.meal}`;
        mealsBySlot[slotKey] = m;
      });

      dateKeys.forEach((key, dayIdx) => {
        if (!newPlan[key]) newPlan[key] = {};
        mealSlots.forEach(mealType => {
          if (!newPlan[key][mealType]) {
            const slotKey = `${dayIdx + 1}-${mealType}`;
            const meal = mealsBySlot[slotKey];
            if (meal) {
              newPlan[key][mealType] = {
                name: meal.name,
                cookTime: meal.cookTime,
                servings: meal.servings || 1,
                difficulty: meal.difficulty || 'Easy',
                cuisine: meal.cuisine || '',
                description: meal.description || '',
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fat: meal.fat
              };
            }
          }
        });
      });

      setMealPlan(newPlan);
      saveToStorage('meal-plan', newPlan);
      showToast('Week planned around your nutrition goals!');
    } catch (err) {
      console.error('Auto-fill error:', err);
      // Fallback: use saved recipes if API fails
      const pool = savedRecipes.length > 0 ? savedRecipes : recipeHistory;
      if (pool.length > 0) {
        const today = new Date();
        const newPlan = { ...mealPlan };
        const mealTypes = mealSlots;
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        let idx = 0;
        for (let d = 0; d < 7; d++) {
          const date = new Date(today);
          date.setDate(today.getDate() + d);
          const key = date.toISOString().split('T')[0];
          if (!newPlan[key]) newPlan[key] = {};
          mealTypes.forEach(meal => {
            if (!newPlan[key][meal]) {
              newPlan[key][meal] = shuffled[idx % shuffled.length];
              idx++;
            }
          });
        }
        setMealPlan(newPlan);
        saveToStorage('meal-plan', newPlan);
        showToast('Auto-filled from saved recipes (couldn\'t reach AI).');
      } else {
        showToast('Failed to generate meal plan. Try again.', 'error');
      }
    } finally {
      setFillingMealPlan(false);
    }
  };

  // ==================== PANTRY EXPIRY HELPERS ====================
  const expiringItems = useMemo(() => {
    const now = new Date();
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return pantryItems.filter(item => {
      if (!item.expiry) return false;
      const exp = new Date(item.expiry);
      return exp <= threeDays && exp >= now;
    }).sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
  }, [pantryItems]);

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // ==================== STATS TREND DATA ====================
  const getWeeklyTrend = useMemo(() => {
    const weeks = [];
    const now = new Date();
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (w * 7) - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      let meals = 0;
      let calories = 0;
      for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split('T')[0];
        const entries = foodLog[key] || [];
        meals += entries.length;
        calories += entries.reduce((sum, e) => sum + (e.calories || 0), 0);
      }
      const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      weeks.push({ label, meals, calories: Math.round(calories / 7) });
    }
    return weeks;
  }, [foodLog]);

  const getCuisineCounts = useMemo(() => {
    const counts = {};
    [...savedRecipes, ...recipeHistory].forEach(r => {
      const c = r.cuisine || 'Other';
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [savedRecipes, recipeHistory]);

  // Close every overlay screen in one call — used by reset, tab bar, goBack
  const closeAllOverlays = useCallback(() => {
    setShowSaved(false);
    setShowShoppingList(false);
    setShowSettings(false);
    setShowTracker(false);
    setShowStats(false);
    setShowMealScanner(false);
    setShowCookComplete(false);
    setShowScanHistory(false);
    setShowManualLog(false);
    setShowPrefNudge(false);
    setShowFullImage(false);
    setShowNutritionEdit(false);
    setShowMealPicker(false);
    setShowIngredientPanel(false);
    setShowAddPantry(false);
    setRemixOpen(false);
    setSelectedRecipe(null);
    setEditingMealSlot(null);
    setNewMealSlotName('');
    setError('');
  }, []);

  const reset = () => {
    setStep('home');
    setPrevStep(null);
    setImages([]);
    setIngredients([]);
    setNewIngredient('');
    setScanProgress({ current: 0, total: 0 });
    setRecipes([]);
    setError('');
    setStreamingRecipes(false);
    setFillingMealPlan(false);
    setCookMode(false);
    setCurrentStep(0);
    setActiveTimer(null);
    setTimerDone(false);
    setShowCookComplete(false);
    setServings(1);
    setOriginalServings(1);
    setSearchQuery('');
    setShowFullImage(false);
    setFullImageIndex(0);
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
    closeAllOverlays();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    window.scrollTo({ top: 0 });
  };

  // Preference helpers
  const toggleDietary = (option) => {
    const newDietary = preferences.dietary.includes(option)
      ? preferences.dietary.filter(d => d !== option)
      : [...preferences.dietary, option];
    const newPrefs = { ...preferences, dietary: newDietary };
    setPreferences(newPrefs);
    saveToStorage('preferences', newPrefs);
  };

  const toggleCuisine = (cuisine) => {
    const newCuisines = preferences.cuisines.includes(cuisine)
      ? preferences.cuisines.filter(c => c !== cuisine)
      : [...preferences.cuisines, cuisine];
    const newPrefs = { ...preferences, cuisines: newCuisines };
    setPreferences(newPrefs);
    saveToStorage('preferences', newPrefs);
  };

  // ==================== ONBOARDING ====================
  const completeOnboarding = (profile) => {
    setUserProfile(profile);
    setOnboardingDone(true);
    saveToStorage('user-profile', profile);
    saveToStorage('onboarding-done', true);
    saveToStorage('allergens', allergens);
    const newPrefs = { ...preferences, dietary: profile.dietary, cuisines: profile.cuisines, skillLevel: profile.skillLevel };
    setPreferences(newPrefs);
    saveToStorage('preferences', newPrefs);
  };

  const updateMacroTarget = (field, value) => {
    const num = Math.max(0, parseInt(value) || 0);
    const updated = { ...userProfile, [field]: num };
    setUserProfile(updated);
    saveToStorage('user-profile', updated);
  };

  // ==================== CALORIE / MACRO TRACKER ====================
  const todayKey = trackerDate;
  const todayLog = foodLog[todayKey] || [];
  const todayTotals = todayLog.reduce((acc, e) => ({
    calories: acc.calories + (Number(e.calories) || 0),
    protein: acc.protein + (Number(e.protein) || 0),
    carbs: acc.carbs + (Number(e.carbs) || 0),
    fat: acc.fat + (Number(e.fat) || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const addFoodEntry = (entry) => {
    const actualToday = new Date().toISOString().split('T')[0];
    const newLog = { ...foodLog };
    if (!newLog[actualToday]) newLog[actualToday] = [];
    newLog[actualToday] = [...newLog[actualToday], { ...entry, id: Date.now(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
    setFoodLog(newLog);
    saveToStorage('food-log', newLog);
    trackMealLog();
  };

  const removeFoodEntry = (id) => {
    const newLog = { ...foodLog };
    newLog[todayKey] = (newLog[todayKey] || []).filter(e => e.id !== id);
    setFoodLog(newLog);
    saveToStorage('food-log', newLog);
  };

  const addManualEntry = () => {
    if (!manualEntry.name.trim()) { showToast('Enter a food name', 'error'); return; }
    const cal = Number(manualEntry.calories);
    if (!cal || cal <= 0 || isNaN(cal)) { showToast('Enter valid calories', 'error'); return; }
    addFoodEntry({ name: manualEntry.name.trim(), calories: Math.round(cal), protein: Math.max(0, Math.round(Number(manualEntry.protein) || 0)), carbs: Math.max(0, Math.round(Number(manualEntry.carbs) || 0)), fat: Math.max(0, Math.round(Number(manualEntry.fat) || 0)) });
    setManualEntry({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    setShowManualLog(false);
    showToast('Meal logged!');
  };

  const getWeekData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const total = (foodLog[key] || []).reduce((sum, e) => sum + (Number(e.calories) || 0), 0);
      data.push({ day: d.toLocaleDateString('en', { weekday: 'short' }), calories: total, date: key });
    }
    return data;
  };

  // ==================== MEAL PHOTO SCANNER ====================
  const handleMealScanCapture = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setMealScanImage({ src: e.target.result, type: file.type });
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const scanMealPhoto = async () => {
    if (!mealScanImage) return;
    if (isOffline) { showToast('No internet connection', 'error'); return; }
    setScanningMeal(true);
    setError('');
    try {
      const response = await fetchWithRetry("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: mealScanImage.type, data: mealScanImage.src.split(',')[1] }},
            { type: "text", text: `Analyze this meal photo. Identify every food item and estimate the nutritional content. Return ONLY JSON: {"meal_name": "description", "items": [{"name": "item", "portion": "amount", "calories": 200, "protein": 10, "carbs": 25, "fat": 8}], "total": {"calories": 500, "protein": 30, "carbs": 60, "fat": 20}}` }
          ]}]
        })
      });
      const data = await response.json();
      const text = data.content?.[0]?.text?.trim();
      if (!text) throw new Error('No response');
      setMealScanResult(safeParseJSON(text));
    } catch (err) { setError('Could not analyze meal. Try a clearer photo.'); }
    setScanningMeal(false);
  };

  const logScannedMeal = () => {
    if (!mealScanResult) return;
    addFoodEntry({ name: mealScanResult.meal_name || 'Scanned meal', calories: mealScanResult.total?.calories || 0, protein: mealScanResult.total?.protein || 0, carbs: mealScanResult.total?.carbs || 0, fat: mealScanResult.total?.fat || 0, scanned: true });
    setMealScanResult(null); setMealScanImage(null); setShowMealScanner(false); setShowTracker(true);
  };

  // ==================== DRINK PAIRING ====================
  const getDrinkPairing = async (recipe) => {
    // Check cache
    const cached = await getCache('pairing', recipe.name);
    if (cached) {
      setSelectedRecipe(prev => ({ ...prev, pairings: cached }));
      return;
    }
    try {
      const response = await fetchWithRetry("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 500,
          messages: [{ role: "user", content: `Suggest 3 drink pairings for "${recipe.name}" (${recipe.description || ''}). Include alcoholic and non-alcoholic. Return ONLY JSON: {"pairings": [{"drink": "name", "type": "wine|beer|cocktail|non-alcoholic", "why": "brief reason"}]}` }]
        })
      });
      const data = await response.json();
      const text = data.content?.[0]?.text?.trim();
      if (!text) return;
      const pairings = safeParseJSON(text).pairings;
      setSelectedRecipe(prev => ({ ...prev, pairings }));
      await setCache('pairing', recipe.name, pairings);
    } catch (err) { console.error('Pairing error:', err); }
  };

  // ==================== RECIPE REMIX (Chat-style modification) ====================
  const sendRemix = async () => {
    if (!remixInput.trim() || !selectedRecipe || remixLoading) return;
    if (isOffline) { showToast('No internet connection', 'error'); return; }
    const userMsg = remixInput.trim();
    setRemixInput('');
    setRemixHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setRemixLoading(true);
    try {
      const currentRecipe = JSON.stringify({
        name: selectedRecipe.name, ingredients: selectedRecipe.ingredients,
        instructions: selectedRecipe.instructions, nutrition: selectedRecipe.nutrition,
        servings: selectedRecipe.servings, cookTime: selectedRecipe.cookTime
      });
      const response = await fetchWithRetry("/api/anthropic", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001", max_tokens: 1200,          messages: [{ role: "user", content: `You are a recipe remix assistant. Current recipe: ${currentRecipe}\n\nUser request: "${userMsg}"\n\nModify the recipe based on the request. Return ONLY JSON: {"name": "Updated Name", "description": "brief", "cookTime": "time", "servings": 1, "difficulty": "Easy", "cuisine": "type", "ingredients": [{"amount": "1 cup", "item": "rice"}], "instructions": ["Step 1"], "nutrition": {"calories": 400, "protein": "20g", "carbs": "50g", "fat": "15g"}, "tips": ["Tip"], "costTier": "budget or moderate or pricey", "changesSummary": "Brief description of what changed"}` }]
        })
      });
      const data = await response.json();
      const text = data.content?.[0]?.text?.trim();
      if (!text) throw new Error('No response');
      const remixed = safeParseJSON(text);
      setRemixHistory(prev => [...prev, { role: 'assistant', text: remixed.changesSummary || 'Recipe updated!' }]);
      setSelectedRecipe(prev => ({ ...prev, ...remixed, loading: false }));
      showToast('Recipe remixed!');
    } catch (err) {
      setRemixHistory(prev => [...prev, { role: 'assistant', text: 'Sorry, I couldn\'t remix that. Try a different request.' }]);
    }
    setRemixLoading(false);
  };

  // ==================== VOICE INPUT ====================
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Voice not supported in this browser', 'info'); return;
    }
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SR();
      recognition.continuous = false; recognition.interimResults = false; recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        const items = event.results[0][0].transcript.split(/,|and/).map(s => s.trim()).filter(Boolean);
        setIngredients(prev => {
          const combined = [...prev];
          items.forEach(item => { if (!combined.some(i => i.toLowerCase() === item.toLowerCase())) combined.push(item); });
          return combined.sort((a, b) => a.localeCompare(b));
        });
      };
      recognition.onerror = () => showToast('Mic not available in preview — works in native app', 'info');
      recognition.start();
    } catch (e) {
      showToast('Mic not available in preview — works in native app', 'info');
    }
  };

  // ==================== IMAGE COMPRESSION & ENHANCEMENT ====================
  const compressImage = (dataUrl, maxWidth = 1600, quality = 0.85) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        try {
          const imageData = ctx.getImageData(0, 0, w, h);
          const d = imageData.data;
          let total = 0;
          const step = Math.max(1, Math.floor(d.length / 4 / 2000)) * 4;
          let samples = 0;
          for (let i = 0; i < d.length; i += step) { total += d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114; samples++; }
          const avg = total / samples;
          if (avg < 115) {
            const boost = Math.min(1.6, 135 / Math.max(avg, 25));
            const offset = avg < 60 ? 20 : avg < 90 ? 10 : 5;
            for (let i = 0; i < d.length; i += 4) {
              d[i] = Math.min(255, d[i] * boost + offset);
              d[i+1] = Math.min(255, d[i+1] * boost + offset);
              d[i+2] = Math.min(255, d[i+2] * boost + offset);
            }
            ctx.putImageData(imageData, 0, 0);
          }
        } catch (e) {}
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = dataUrl;
    });
  };

  // Lightweight compression for API scanning — smaller payload = faster upload & response
  const compressForScan = (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        const maxW = 1024;
        if (w > maxW) { h = (maxW / w) * h; w = maxW; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = dataUrl;
    });
  };

  // ==================== GAMIFICATION HELPERS ====================
  const updateStats = (updates) => {
    setStats(prev => {
      const today = new Date().toISOString().split('T')[0];
      let newStats = { ...prev, ...updates };
      if (prev.lastActiveDate !== today) {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (prev.lastActiveDate === yesterdayStr) {
          newStats.streak = (prev.streak || 0) + 1;
        } else {
          newStats.streak = 1;
        }
        newStats.lastActiveDate = today;
        newStats.longestStreak = Math.max(newStats.longestStreak || 0, newStats.streak);
      }
      saveToStorage('user-stats', newStats);
      return newStats;
    });
  };

  const trackScan = () => updateStats({ totalScans: (stats.totalScans || 0) + 1 });
  const trackRecipeView = () => updateStats({ totalRecipesViewed: (stats.totalRecipesViewed || 0) + 1 });
  const trackCook = () => updateStats({ totalCooked: (stats.totalCooked || 0) + 1 });
  const trackMealLog = () => updateStats({ totalMealsLogged: (stats.totalMealsLogged || 0) + 1 });

  // ==================== PANTRY AUTO-DEDUCT ====================
  const pantryAutoDeduct = (recipe) => {
    if (!recipe?.ingredients || pantryItems.length === 0) return;
    const ingredientNames = (Array.isArray(recipe.ingredients) ? recipe.ingredients : [])
      .map(i => (typeof i === 'string' ? i : i.name || '').toLowerCase().trim());
    const updatedPantry = pantryItems.filter(item => {
      const name = item.name.toLowerCase().trim();
      return !ingredientNames.some(ing => ing.includes(name) || name.includes(ing));
    });
    if (updatedPantry.length !== pantryItems.length) {
      const removed = pantryItems.length - updatedPantry.length;
      setPantryItems(updatedPantry);
      saveToStorage('pantry-items', updatedPantry);
      showToast(`${removed} pantry item${removed > 1 ? 's' : ''} used up`);
    }
  };

  // ==================== SMART SHOPPING LIST ====================
  const addMissingToShoppingList = (recipe) => {
    if (!recipe?.ingredients) return;
    const pantryNames = pantryItems.map(p => p.name.toLowerCase().trim());
    const recipeIngredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const missing = recipeIngredients.filter(ing => {
      const name = (typeof ing === 'string' ? ing : ing.name || '').toLowerCase().trim();
      return !pantryNames.some(p => p.includes(name) || name.includes(p));
    });
    if (missing.length === 0) { showToast('You have everything!'); return; }
    const newItems = missing.map(ing => {
      const name = typeof ing === 'string' ? ing : `${ing.amount || ''} ${ing.unit || ''} ${ing.name || ''}`.trim();
      return { id: Date.now() + Math.random(), name, checked: false, recipe: recipe.name };
    });
    const combined = [...shoppingList, ...newItems];
    setShoppingList(combined);
    saveToStorage('shopping-list', combined);
    showToast(`${missing.length} item${missing.length > 1 ? 's' : ''} added to shopping list`);
  };

  // ==================== PANTRY MATCH ====================
  const getPantryMatchPercent = (recipe) => {
    if (!recipe?.ingredients || pantryItems.length === 0) return 0;
    const pantryNames = pantryItems.map(p => p.name.toLowerCase().trim());
    const recipeIngredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    if (recipeIngredients.length === 0) return 0;
    const matched = recipeIngredients.filter(ing => {
      const name = (typeof ing === 'string' ? ing : ing.name || '').toLowerCase().trim();
      return pantryNames.some(p => p.includes(name) || name.includes(p));
    });
    return Math.round((matched.length / recipeIngredients.length) * 100);
  };

  // ==================== SEASONAL SUGGESTIONS ====================
  const getSeasonalIngredients = () => {
    const month = new Date().getMonth();
    const seasons = {
      winter: ['squash', 'sweet potato', 'kale', 'citrus', 'pomegranate', 'beets', 'parsnips', 'turnips', 'cabbage', 'leeks'],
      spring: ['asparagus', 'peas', 'artichoke', 'radish', 'strawberry', 'rhubarb', 'spinach', 'arugula', 'fennel', 'mint'],
      summer: ['tomato', 'zucchini', 'corn', 'peach', 'watermelon', 'berries', 'cucumber', 'basil', 'bell pepper', 'eggplant'],
      fall: ['pumpkin', 'apple', 'cranberry', 'butternut squash', 'mushroom', 'fig', 'pear', 'brussels sprouts', 'sage', 'cinnamon']
    };
    if (month <= 1 || month === 11) return { season: 'Winter', items: seasons.winter };
    if (month <= 4) return { season: 'Spring', items: seasons.spring };
    if (month <= 7) return { season: 'Summer', items: seasons.summer };
    return { season: 'Fall', items: seasons.fall };
  };

  // ==================== BUDGET ESTIMATOR ====================
  // ==================== ALLERGEN WARNINGS ====================
  const ALLERGEN_MAP = {
    dairy: ['milk', 'cheese', 'cream', 'butter', 'yogurt', 'whey', 'casein', 'lactose', 'ghee', 'ricotta', 'mozzarella', 'parmesan', 'cheddar'],
    gluten: ['wheat', 'flour', 'bread', 'pasta', 'spaghetti', 'noodle', 'barley', 'rye', 'couscous', 'tortilla', 'cracker'],
    nuts: ['almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut', 'macadamia', 'pine nut'],
    peanuts: ['peanut', 'peanut butter'],
    shellfish: ['shrimp', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'scallop'],
    fish: ['salmon', 'tuna', 'cod', 'tilapia', 'anchovy', 'sardine', 'fish sauce'],
    eggs: ['egg', 'eggs', 'mayonnaise', 'mayo'],
    soy: ['soy', 'tofu', 'tempeh', 'edamame', 'miso', 'soy sauce']
  };

  const getAllergenWarnings = (recipe) => {
    if (!recipe?.ingredients || allergens.length === 0) return [];
    const ings = (Array.isArray(recipe.ingredients) ? recipe.ingredients : [])
      .map(i => (typeof i === 'string' ? i : `${i.name || ''} ${i.amount || ''}`).toLowerCase()).join(' ');
    const warnings = [];
    allergens.forEach(allergen => {
      const triggers = ALLERGEN_MAP[allergen.toLowerCase()] || [allergen.toLowerCase()];
      const found = triggers.filter(t => ings.includes(t));
      if (found.length > 0) warnings.push({ allergen, triggers: found });
    });
    return warnings;
  };

  // ==================== RECIPE SCALING MEMORY ====================
  const savePreferredServings = (recipeName, count) => {
    const updated = { ...preferredServings, [recipeName]: count };
    setPreferredServings(updated);
    saveToStorage('preferred-servings', updated);
  };

  const getPreferredServings = (recipeName) => preferredServings[recipeName] || null;

  // ==================== TIMER SOUND ====================
  const playTimerSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playNote = (freq, start, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };
      playNote(880, 0, 0.15);
      playNote(1100, 0.18, 0.15);
      playNote(1320, 0.36, 0.25);
    } catch (e) {}
  };

  // ==================== VOICE COOK MODE ====================
  const startVoiceCookMode = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Voice not supported in this browser', 'info'); return;
    }
    try {
      setVoiceListening(true);
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        const cmd = event.results[0][0].transcript.toLowerCase().trim();
        if (cmd.includes('next') || cmd.includes('forward')) {
          if (selectedRecipe?.instructions && currentStep < selectedRecipe.instructions.length - 1) {
            setCurrentStep(prev => prev + 1);
            showToast('Next step');
          }
        } else if (cmd.includes('back') || cmd.includes('previous')) {
          if (currentStep > 0) { setCurrentStep(prev => prev - 1); showToast('Previous step'); }
        } else if (cmd.includes('timer') || cmd.includes('start')) {
          const detected = detectTimer(selectedRecipe?.instructions?.[currentStep]);
          if (detected) {
            startTimer(currentStep, detected.seconds);
            showToast(`Timer: ${detected.label}`);
          } else {
            showToast('No timer needed for this step', 'info');
          }
        } else if (cmd.includes('stop') || cmd.includes('pause')) {
          pauseTimer();
          showToast('Timer paused');
        } else if (cmd.includes('done') || cmd.includes('finish')) {
          completeCook();
        } else if (cmd.includes('ingredient') || cmd.includes('what do i need')) {
          setShowIngredientPanel(prev => !prev);
          showToast(showIngredientPanel ? 'Ingredients hidden' : 'Showing ingredients');
        } else {
          showToast(`"${cmd}" — try "next", "back", "timer", "ingredients"`, 'info');
        }
        setVoiceListening(false);
      };
      recognition.onerror = () => { setVoiceListening(false); showToast('Mic not available in preview — works in native app', 'info'); };
      recognition.onend = () => setVoiceListening(false);
      recognition.start();
    } catch (e) {
      setVoiceListening(false);
      showToast('Mic not available in preview — works in native app', 'info');
    }
  };

  // ==================== TOOLTIP SYSTEM ====================
  const markTooltipSeen = (key) => {
    const updated = { ...tooltipsSeen, [key]: true };
    setTooltipsSeen(updated);
    saveToStorage('tooltips-seen', updated);
  };

  // ==================== DATA EXPORT ====================
  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      userProfile, preferences, savedRecipes, shoppingList, pantryItems,
      mealPlan, foodLog, recipeHistory, recipeNotes, recipeRatings,
      scanHistory: scanHistory.map(s => ({ ...s, thumbnail: undefined })), // Strip thumbnails for size
      stats, collections
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `snap-chef-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
    showToast('Data exported!');
  };

  // ==================== DAILY SMART SUGGESTIONS ====================

  // ==================== RECIPE VISUAL GENERATOR ====================
  const getRecipeVisual = useCallback((recipe) => {
    const name = (recipe?.name || '').toLowerCase();
    const cuisine = (recipe?.cuisine || '').toLowerCase();
    const match = RECIPE_VISUALS.find(v => v.keys.some(k => name.includes(k) || cuisine.includes(k)));
    const fallback = { emoji: '🍽️', gradient: [darkMode ? '#BEFF46' : '#ef4444', darkMode ? '#5CA4FF' : '#f97316'], bg: darkMode ? '#141820' : '#FFF5F5' };
    return match || fallback;
  }, [darkMode]);

  // ==================== SPOONACULAR RECIPE IMAGES ====================
  const simplifyRecipeName = (name) => {
    const skip = new Set(['with','and','the','in','on','a','of','style','creamy','spicy','classic','easy','quick','simple','homemade','fresh','roasted','grilled','baked','fried','crispy','smoky','zesty','tangy','savory','hearty','loaded','ultimate','best','perfect','delicious']);
    return name.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !skip.has(w)).slice(0, 3).join(' ');
  };

  const getCoreFood = (name) => {
    const dishes = ['pasta','pizza','burger','stir fry','stir-fry','soup','salad','curry','taco','sushi','sandwich','steak','rice bowl','rice','noodle','scramble','omelette','pancake','waffle','wrap','bowl','chili','stew','casserole','pie','cake','toast','frittata'];
    const lower = name.toLowerCase();
    for (const d of dishes) {
      if (lower.includes(d)) return d.replace('-', ' ');
    }
    // Fallback: grab the last meaningful word (usually the dish type)
    const skip = new Set(['with','and','the','in','on','a','of','style']);
    const words = lower.split(/\s+/).filter(w => w.length > 2 && !skip.has(w));
    return words.slice(-2).join(' ');
  };

  const searchSpoonacular = async (query) => {
    try {
      const res = await fetch(`/api/spoonacular?query=${encodeURIComponent(query)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data?.results?.[0]?.image || null;
    } catch (e) { return null; }
  };

  const fetchRecipeImages = async (recipeList) => {
    if (recipeList.length === 0) return;
    const results = {};
    await Promise.all(recipeList.map(async (recipe) => {
      if (!recipe?.name) return;
      // Try 1: full name
      let img = await searchSpoonacular(recipe.name);
      // Try 2: simplified keywords
      if (!img) {
        const simple = simplifyRecipeName(recipe.name);
        if (simple) img = await searchSpoonacular(simple);
      }
      // Try 3: core dish type
      if (!img) {
        const core = getCoreFood(recipe.name);
        if (core) img = await searchSpoonacular(core);
      }
      if (img) results[recipe.name] = img;
    }));
    if (Object.keys(results).length > 0) {
      setRecipeImages(prev => ({ ...prev, ...results }));
    }
  };

  // Fetch images when recipes change
  useEffect(() => {
    if (recipes.length > 0) {
      fetchRecipeImages(recipes);
    }
  }, [recipes]);

  // Also fetch for selected recipe detail
  useEffect(() => {
    if (selectedRecipe?.name && !recipeImages[selectedRecipe.name]) {
      fetchRecipeImages([selectedRecipe]);
    }
  }, [selectedRecipe?.name]);

  // Renders a recipe image — Spoonacular photo if available, gradient+emoji fallback
  const renderRecipeImage = (recipe, w, h, imgStyle = {}) => {
    const v = getRecipeVisual(recipe);
    const bg = `linear-gradient(135deg, ${v.gradient[0]}, ${v.gradient[1]})`;
    const ht = imgStyle.height || h;
    const isSmall = ht <= 50;
    const isMedium = ht > 50 && ht <= 100;
    const photoUrl = recipeImages[recipe?.name];
    return (
      <div style={{position:'relative',overflow:'hidden',background: bg, display:'flex',alignItems:'center',justifyContent:'center', ...imgStyle}}>
        {photoUrl ? (
          <img src={photoUrl} alt={recipe?.name || ''} loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
            style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',zIndex:3}} />
        ) : (
          <span style={{fontSize: isSmall ? 22 : isMedium ? 40 : 56, filter:'drop-shadow(0 3px 6px rgba(0,0,0,0.2))',zIndex:2,position:'relative'}}>{v.emoji}</span>
        )}
        {!isSmall && !photoUrl && <>
          <div style={{position:'absolute',top:'-20%',right:'-10%',width:'45%',height:'80%',borderRadius:'50%',background:'rgba(255,255,255,0.08)'}} />
          <div style={{position:'absolute',bottom:'-30%',left:'-10%',width:'50%',height:'80%',borderRadius:'50%',background:'rgba(255,255,255,0.05)'}} />
        </>}
        {!isSmall && (
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'35%',background:'linear-gradient(transparent, rgba(0,0,0,0.15))',zIndex:4}} />
        )}
      </div>
    );
  };

  // ==================== LOADING SKELETON ====================
  const Skeleton = ({ className, style = {} }) => (
    <div className={`skel ${className}`} style={{minHeight:16,...style}} />
  );

  // ==================== MACRO PROGRESS BAR HELPER ====================
  const MacroBar = ({ label, current, target, color }) => {
    const pct = Math.min(100, Math.round((current / target) * 100));
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className={textMutedClass}>{label}</span>
          <span className={textClass + ' font-semibold'}>{current}/{target}g</span>
        </div>
        <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-2`}>
          <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  // FIX #6: Theme classes — all dark mode via conditional classes, no Tailwind dark: prefix

  // ==================== TOAST NOTIFICATION SYSTEM ====================
  const showToast = useCallback((message, type = 'success', undoAction = null, duration = 3000) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type, undoAction, removing: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, duration);
    haptic();
  }, []);

  // ==================== HAPTIC FEEDBACK ====================
  const haptic = (style = 'light') => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(style === 'light' ? 10 : style === 'medium' ? 25 : 50);
      }
    } catch (e) {}
  };

  // ==================== SHARE RECIPE CARD ====================
  const generateShareCard = async (recipe) => {
    setShareCardRecipe(recipe);
    haptic('medium');
  };

  const shareRecipe = async (recipe) => {
    const text = `${recipe.name}\n${recipe.description || ''}\n\nIngredients: ${(recipe.ingredients || []).map(i => `${i.amount} ${i.item}`).join(', ')}\n\nMade with Snap Chef`;
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.name, text });
        showToast('Shared!');
      } catch (e) {}
    } else {
      await navigator.clipboard?.writeText(text);
      showToast('Recipe copied to clipboard!');
    }
  };

  // ==================== OFFLINE RECIPE CACHE ====================
  const cacheRecipe = (recipe) => {
    const newCache = { ...cachedRecipes, [recipe.name]: { ...recipe, cachedAt: Date.now() } };
    setCachedRecipes(newCache);
    saveToStorage('cached-recipes', newCache);
    showToast('Recipe saved offline');
  };

  // ==================== PUSH NOTIFICATION TIMER ====================
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const sendTimerNotification = (stepTitle) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Snap Chef Timer Done!', { body: `${stepTitle} is complete!`, icon: '/icon-192.png', badge: '/icon-96.png', vibrate: [200, 100, 200] });
    }
    haptic('heavy');
  };
  const bgClass = darkMode ? 'bg-gray-950' : '';

  // Sorted recipe list for results screen
  const sortedRecipes = useMemo(() => {
    if (recipeSort === 'default' || recipes.length === 0) return recipes;
    const copy = [...recipes];
    if (recipeSort === 'time') {
      copy.sort((a, b) => (parseInt(a.cookTime) || 99) - (parseInt(b.cookTime) || 99));
    } else if (recipeSort === 'difficulty') {
      const order = { 'Easy': 0, 'Medium': 1, 'Hard': 2 };
      copy.sort((a, b) => (order[a.difficulty] ?? 1) - (order[b.difficulty] ?? 1));
    } else if (recipeSort === 'match') {
      copy.sort((a, b) => (getPantryMatchPercent(b) || 0) - (getPantryMatchPercent(a) || 0));
    }
    return copy;
  }, [recipes, recipeSort, pantryItems]);
  const cardClass = useMemo(() => darkMode ? 'bg-gray-900 border-gray-800' : 'border', [darkMode]);
  const textClass = useMemo(() => darkMode ? 'text-gray-50' : '', [darkMode]);
  const textMutedClass = useMemo(() => darkMode ? 'text-gray-400' : '', [darkMode]);
  const inputClass = useMemo(() => darkMode ? 'bg-gray-800 border-gray-700 text-gray-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30' : 'border', [darkMode]);
  const hoverClass = useMemo(() => darkMode ? 'hover:bg-gray-800' : '', [darkMode]);
  const chipActiveClass = useMemo(() => darkMode ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md shadow-red-500/20' : '', [darkMode]);
  const chipClass = useMemo(() => darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border', [darkMode]);

  // Shared style primitives — memoized to avoid 100s of inline object allocations per render
  const borderCol = useMemo(() => darkMode ? 'rgba(255,255,255,0.06)' : '#E5E7EB', [darkMode]);
  const cardBg = useMemo(() => darkMode ? '#141820' : '#FFFFFF', [darkMode]);
  const subtleBg = useMemo(() => darkMode ? 'rgba(255,255,255,0.03)' : '#F9FAFB', [darkMode]);
  const rootBg = useMemo(() => darkMode ? '#0C0F14' : '#FFFFFF', [darkMode]);
  const mutedBg = useMemo(() => darkMode ? '#1A1F2B' : '#F3F4F6', [darkMode]);
  const inactiveCol = useMemo(() => darkMode ? '#4A5060' : '#9CA3AF', [darkMode]);
  const gradientBtn = useMemo(() => darkMode ? 'linear-gradient(135deg, #BEFF46, #9CDD20)' : 'linear-gradient(135deg, #ef4444, #f97316)', [darkMode]);
  const gradientBtnCol = useMemo(() => darkMode ? '#0C0F14' : 'white', [darkMode]);
  const gradientShadow = useMemo(() => darkMode ? '0 4px 20px rgba(190,255,70,0.2)' : '0 4px 20px rgba(239,68,68,0.25)', [darkMode]);

  // Inline style theme — bypasses CSS completely
  const t = useMemo(() => ({
    bg: darkMode ? {} : { background: '#FFFFFF' },
    card: darkMode ? {} : { background: '#FFFFFF', borderColor: '#E5E7EB' },
    text: darkMode ? { color: '#F9FAFB' } : { color: '#111827' },
    textMuted: darkMode ? { color: '#9CA3AF' } : { color: '#6B7280' },
    input: darkMode ? {} : { background: '#FFFFFF', borderColor: '#E5E7EB', color: '#111827' },
    chip: darkMode ? {} : { background: '#F3F4F6', color: '#4B5563' },
    chipActive: darkMode ? {} : { background: '#ef4444', color: '#FFFFFF' },
    border: darkMode ? {} : { borderColor: '#E5E7EB' },
    headerBg: darkMode ? {} : { background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' },
    headerBtn: darkMode ? {} : { background: '#F3F4F6', borderColor: '#E5E7EB' },
    tabBg: darkMode ? {} : { background: 'rgba(255,255,255,0.95)' },
    accent: darkMode ? '#BEFF46' : '#ef4444',
    accentMuted: darkMode ? '#9CDD20' : '#f97316',
  }), [darkMode]);

  // Home nutrition — always computed from TODAY's actual date, not trackerDate
  const homeDate = new Date().toISOString().split('T')[0];
  const { homeTotals, homeCalPct } = useMemo(() => {
    const log = foodLog[homeDate] || [];
    const totals = log.reduce((acc, e) => ({
      calories: acc.calories + (Number(e.calories) || 0),
      protein: acc.protein + (Number(e.protein) || 0),
      carbs: acc.carbs + (Number(e.carbs) || 0),
      fat: acc.fat + (Number(e.fat) || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    const target = userProfile.calorieTarget || 2000;
    const pct = target > 0 ? totals.calories / target : 0;
    return { homeTotals: totals, homeCalPct: pct };
  }, [foodLog, homeDate, userProfile.calorieTarget]);
  const homeCalTarget = userProfile.calorieTarget || 2000;

  const showBackButton = step !== 'home' || showSaved || showShoppingList || showSettings || selectedRecipe || cookMode || showTracker || showMealScanner || showStats;

  // ==================== REUSABLE UI HELPERS ====================
  const BackBtn = ({ onClick }) => (
    <button onClick={onClick} style={{width:36,height:36,borderRadius:10,...fc,border:`1px solid ${borderCol}`,background: cardBg,cursor:'pointer'}}><ArrowLeft style={{width:18,height:18,...t.text}} /></button>
  );
  const OverlayHeader = ({ onBack, title, subtitle }) => (
    <div className="flex items-center justify-between fade-up">
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <BackBtn onClick={onBack} />
        <div>
          <h2 className="font-extrabold" style={{fontSize:24,letterSpacing:'-0.5px',...t.text}}>{title}</h2>
          {subtitle && <p style={{fontSize:13,marginTop:2,...t.textMuted}}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
  const EmptyBox = ({ icon, title, message, action }) => (
    <div className="text-center py-12 fade-up">
      <div style={{fontSize:48,marginBottom:12}}>{icon}</div>
      <p className="font-bold" style={{fontSize:16,...t.text}}>{title}</p>
      <p style={{fontSize:13,marginTop:6,...t.textMuted}}>{message}</p>
      {action}
    </div>
  );
  const fc = {display:'flex',alignItems:'center',justifyContent:'center'};
  const frow = {display:'flex',alignItems:'center'};
  const fcol = {display:'flex',flexDirection:'column'};
  const sLabel = {fontSize:15,textTransform:'uppercase',letterSpacing:'0.5px',color: darkMode ? '#6B7280' : '#9CA3AF',fontWeight:600,display:'block',marginBottom:12};
  const overlayBg = {background: darkMode ? "#0C0F14" : "#FFFFFF"};
  // Design tokens — spacing & radius
  const R = { card: 16, inner: 12, sm: 8, xs: 4 };
  const S = { section: 24, card: 20, gap: 12, tight: 8, xs: 4 };
  // Type scale: 11 · 13 · 15 · 16 · 18 · 22 · 24 · 28


  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark-glass' : 'light-warm'}`} style={{position:'relative',overflowX:'hidden', background: rootBg}}>
      {darkMode && <>
        <div style={{position:'fixed',top:'-80px',right:'-120px',width:'400px',height:'400px',background:'radial-gradient(circle, rgba(190,255,70,0.045) 0%, transparent 70%)',borderRadius:'50%',pointerEvents:'none',zIndex:0}} />
        <div style={{position:'fixed',bottom:'80px',left:'-100px',width:'300px',height:'300px',background:'radial-gradient(circle, rgba(92,164,255,0.035) 0%, transparent 70%)',borderRadius:'50%',pointerEvents:'none',zIndex:0}} />
        <div style={{position:'fixed',top:'40%',right:'-60px',width:'250px',height:'250px',background:'radial-gradient(circle, rgba(176,124,255,0.025) 0%, transparent 70%)',borderRadius:'50%',pointerEvents:'none',zIndex:0}} />
      </>}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        html, body, #root, [data-reactroot] { background: ${darkMode ? '#0C0F14' : '#FFFFFF'} !important; overflow-x: hidden; max-width: 100vw; }
        *, *::before, *::after { font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif; box-sizing: border-box; }
        html, body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -webkit-tap-highlight-color: transparent; }
        @supports (padding-top: env(safe-area-inset-top)) {
          .safe-top { padding-top: env(safe-area-inset-top); }
        }

        /* === CARBON THEME === */
        .dark-glass, .dark-glass * { font-family: 'Manrope', -apple-system, sans-serif !important; }
        .dark-glass { background: #0C0F14 !important; }
        .dark-glass .bg-gray-950 { background: #0C0F14 !important; }
        .dark-glass .bg-gray-900 { background: #141820 !important; }
        .dark-glass .bg-gray-900\\/80 { background: rgba(12,15,20,0.9) !important; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .dark-glass .bg-gray-800 { background: #1A1F2B !important; }
        .dark-glass .bg-gray-700 { background: #222838 !important; }
        .dark-glass .bg-gray-100 { background: #141820 !important; }
        .dark-glass .text-gray-50, .dark-glass .text-gray-100 { color: #EFF1F5 !important; }
        .dark-glass .text-gray-300 { color: #8B92A0 !important; }
        .dark-glass .text-gray-400 { color: #4A5060 !important; }
        .dark-glass .text-gray-900 { color: #EFF1F5 !important; }
        .dark-glass .border-gray-100 { border-color: rgba(255,255,255,0.05) !important; }
        .dark-glass .border-gray-200, .dark-glass .border-gray-700 { border-color: rgba(255,255,255,0.06) !important; }
        .dark-glass .border-gray-800 { border-color: rgba(255,255,255,0.05) !important; }
        .dark-glass .hover\\:bg-gray-800:hover { background: #222838 !important; }
        .dark-glass .hover\\:bg-gray-700:hover { background: #2A3040 !important; }
        .dark-glass .hover\\:bg-gray-600:hover { background: #303848 !important; }
        .dark-glass .hover\\:bg-gray-300:hover { background: rgba(255,255,255,0.1) !important; }
        .dark-glass .focus\\:border-orange-500:focus { border-color: #BEFF46 !important; }
        .dark-glass .focus\\:ring-orange-500\\/30:focus { --tw-ring-color: rgba(190,255,70,0.15) !important; }
        .dark-glass .border-red-500 { border-color: #BEFF46 !important; }
        .dark-glass .bg-red-500\\/10 { background: rgba(190,255,70,0.08) !important; }
        .dark-glass .from-red-500 { --tw-gradient-from: #BEFF46 !important; }
        .dark-glass .to-orange-500 { --tw-gradient-to: #9CDD20 !important; }
        .dark-glass .from-red-500.to-orange-500:not(.bg-clip-text):not(.text-transparent) { color: #0C0F14 !important; }
        .dark-glass .shadow-red-500\\/20 { box-shadow: 0 8px 30px rgba(190,255,70,0.1) !important; }
        .dark-glass .text-red-500 { color: #FF5C72 !important; }
        .dark-glass .text-orange-500 { color: #FF8C42 !important; }
        .dark-glass .text-amber-400 { color: #BEFF46 !important; }
        .dark-glass .bg-red-950\\/40 { background: rgba(255,92,114,0.05) !important; }
        .dark-glass .border-red-900\\/50 { border-color: rgba(255,92,114,0.1) !important; }
        .dark-glass .text-red-200 { color: #FF5C72 !important; }
        .dark-glass .text-red-300 { color: #FF5C72 !important; }
        .dark-glass .bg-red-900\\/30 { background: rgba(255,92,114,0.06) !important; }
        .dark-glass .border-red-800 { border-color: rgba(255,92,114,0.1) !important; }
        .dark-glass .text-red-800 { color: #FF5C72 !important; }
        .dark-glass .bg-amber-900\\/20 { background: rgba(255,140,66,0.05) !important; }
        .dark-glass .border-amber-800\\/50 { border-color: rgba(255,140,66,0.1) !important; }
        .dark-glass .text-amber-200, .dark-glass .text-amber-300 { color: #FF8C42 !important; }
        .dark-glass .text-amber-900 { color: #FF8C42 !important; }
        .dark-glass .bg-green-900\\/30 { background: rgba(52,211,153,0.06) !important; }
        .dark-glass .bg-green-900 { background: rgba(52,211,153,0.08) !important; }
        .dark-glass .border-green-800 { border-color: rgba(52,211,153,0.1) !important; }
        .dark-glass .text-green-300, .dark-glass .text-green-800 { color: #34D399 !important; }
        .dark-glass .bg-violet-500\\/10 { background: rgba(176,124,255,0.08) !important; }
        .dark-glass .bg-orange-500\\/10 { background: rgba(255,140,66,0.08) !important; }
        .dark-glass .bg-orange-500\\/20 { background: rgba(255,140,66,0.12) !important; }
        .dark-glass .bg-blue-500 { background: #5CA4FF !important; }
        .dark-glass .rounded-2xl { border-radius: 14px !important; }
        .dark-glass .rounded-full { border-radius: 10px !important; }
        .dark-glass .card-hover:hover { border-color: rgba(255,255,255,0.1) !important; }
        /* === END CARBON THEME === */

        /* === LIGHT CLEAN THEME === */
        .light-warm, .light-warm > div { background: #FFFFFF !important; }
        .light-warm .bg-white { background: #FFFFFF !important; }
        .light-warm .bg-white\\/80 { background: rgba(255,255,255,0.95) !important; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .light-warm .border-gray-200\\/80 { border-color: #E5E7EB !important; }
        .light-warm .border-gray-200 { border-color: #E5E7EB !important; }
        .light-warm .bg-gray-50 { background: #FFFFFF !important; }
        .light-warm .bg-gray-100 { background: #FFFFFF !important; }
        .light-warm .bg-gray-200 { background: #F3F4F6 !important; }
        .light-warm .bg-gray-950 { background: #FFFFFF !important; }
        .light-warm .bg-gradient-to-b { background: #FFFFFF !important; }
        .light-warm .text-gray-900 { color: #111827 !important; }
        .light-warm .text-gray-400 { color: #9CA3AF !important; }
        .light-warm .hover\\:bg-orange-50:hover { background: #F9FAFB !important; }
        .light-warm .hover\\:bg-gray-50:hover { background: #F9FAFB !important; }
        .light-warm .hover\\:bg-gray-200:hover { background: #E5E7EB !important; }
        .light-warm .bg-orange-600 { background: #ef4444 !important; }
        .light-warm .text-orange-500 { color: #ef4444 !important; }
        .light-warm .shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important; }
        .light-warm .shadow-lg { box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important; }
        .light-warm .from-red-500 { --tw-gradient-from: #ef4444 !important; }
        .light-warm .to-orange-500 { --tw-gradient-to: #f97316 !important; }
        .light-warm .shadow-red-500\\/20 { --tw-shadow-color: rgba(239,68,68,0.2) !important; }
        /* === END LIGHT CLEAN THEME === */
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes toastOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(20px) scale(0.95); } }
        @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.95); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes pageIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes splashFade { 0% { opacity: 1; } 70% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes splashLogo { 0% { transform: scale(0.5); opacity: 0; } 40% { transform: scale(1.05); opacity: 1; } 60% { transform: scale(1); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes starPop { 0% { transform: scale(1); } 30% { transform: scale(1.5) rotate(-15deg); } 60% { transform: scale(0.85) rotate(10deg); } 100% { transform: scale(1) rotate(0); } }
        @keyframes splashText { 0% { opacity: 0; transform: translateY(8px); } 40% { opacity: 0; transform: translateY(8px); } 70% { opacity: 1; transform: translateY(0); } 100% { opacity: 1; } }
        @keyframes splashBar { 0% { width: 0%; } 100% { width: 100%; } }
        @keyframes skeletonShimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes screenSlideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes screenFadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes heroShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        @keyframes subtlePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes glowPulse { 0%,100% { box-shadow: 0 0 0 rgba(190,255,70,0); } 50% { box-shadow: 0 0 20px rgba(190,255,70,0.15); } }
        .fade-up { animation: fadeUp 0.4s ease-out both; }
        .fade-up-d1 { animation: fadeUp 0.4s ease-out 0.05s both; }
        .fade-up-d2 { animation: fadeUp 0.4s ease-out 0.1s both; }
        .fade-up-d3 { animation: fadeUp 0.4s ease-out 0.15s both; }
        .fade-up-d4 { animation: fadeUp 0.4s ease-out 0.2s both; }
        .bounce-in { animation: bounceIn 0.5s ease-out both; }
        .toast-in { animation: toastIn 0.3s ease-out both; }
        .toast-out { animation: toastOut 0.25s ease-in both; }
        .card-hover { transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1); cursor: pointer; position: relative; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: ${darkMode ? '0 8px 25px rgba(0,0,0,0.4)' : '0 8px 25px rgba(0,0,0,0.08)'}; }
        .card-hover:active { transform: translateY(0) scale(0.97); transition-duration: 0.1s; }
        .screen-enter { animation: screenSlideIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .screen-fade { animation: screenFadeIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .skel { background: ${darkMode ? 'linear-gradient(90deg, #1A1F2B 0%, #222838 50%, #1A1F2B 100%)' : 'linear-gradient(90deg, #E5E7EB 0%, #F3F4F6 50%, #E5E7EB 100%)'} ; background-size: 800px 100%; animation: skeletonShimmer 1.5s ease-in-out infinite; border-radius: 8px; }
        @media (pointer: coarse) { .card-hover:active { transform: scale(0.97); } .touch-target { min-height: 44px; min-width: 44px; } }
        * { transition-property: background-color, border-color, color, box-shadow; transition-duration: 0.15s; }
      `}</style>

      {/* ==================== SPLASH SCREEN ==================== */}
      {showSplash && (
        <div style={{position:'fixed',inset:0,zIndex:9999,...fcol,alignItems:'center',justifyContent:'center',gap:20,background: rootBg,animation:'splashFade 1.8s ease-in-out both'}}>
          {darkMode && <>
            <div style={{position:'absolute',top:'-60px',right:'-100px',width:'350px',height:'350px',background:'radial-gradient(circle, rgba(190,255,70,0.06) 0%, transparent 70%)',borderRadius:'50%'}} />
            <div style={{position:'absolute',bottom:'50px',left:'-80px',width:'250px',height:'250px',background:'radial-gradient(circle, rgba(92,164,255,0.05) 0%, transparent 70%)',borderRadius:'50%'}} />
          </>}
          <div style={{animation:'splashLogo 1s cubic-bezier(0.22, 1, 0.36, 1) both'}}>
            <SnapChefLogo size={80} />
          </div>
          <div style={{animation:'splashText 1.2s ease-out both',textAlign:'center'}}>
            <h1 style={{fontSize:28,fontWeight:800,letterSpacing:'-0.8px',color: darkMode ? '#F9FAFB' : '#111827',fontFamily:'Manrope, sans-serif'}}>Snap Chef</h1>
            <p style={{fontSize:15,marginTop:4,color: inactiveCol,fontFamily:'Manrope, sans-serif'}}>Cook smarter, not harder</p>
          </div>
          <div style={{width:120,height:3,borderRadius:2,background: darkMode ? 'rgba(255,255,255,0.05)' : '#F3F4F6',overflow:'hidden',marginTop:8}}>
            <div style={{height:'100%',borderRadius:2,background: darkMode ? 'linear-gradient(90deg, #BEFF46, #9CDD20)' : 'linear-gradient(90deg, #ef4444, #f97316)',animation:'splashBar 1.4s ease-out both'}} />
          </div>
        </div>
      )}
      {/* Header — Carbon: brand left, square buttons right */}
      <div className={`safe-top ${darkMode ? 'bg-gray-900/80 border-gray-800' : ''} shadow-sm border-b backdrop-blur-lg sticky top-0 z-40`} style={{...t.headerBg, borderBottomColor: darkMode ? undefined : '#E5E7EB', position:'sticky',top:0}}>
        <div className="max-w-2xl mx-auto flex items-center justify-between" style={{padding:'14px 20px'}}>
          {showBackButton ? (
            <button aria-label="Go back" onClick={goBack} className={`${darkMode ? 'bg-gray-800 border border-gray-700' : 'border'} ${hoverClass} transition flex items-center justify-center`} style={{width:36,height:36,borderRadius:10,...t.headerBtn}}>
              <ArrowLeft className={`w-5 h-5 ${textMutedClass}`} />
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <SnapChefLogo size={30} />
              <span className={`font-bold ${textClass}`} style={{fontSize:16,letterSpacing:'-0.3px',...t.text}}>Snap Chef</span>
              {Object.keys(cachedRecipes).length > 0 && (
                <span title={`${Object.keys(cachedRecipes).length} recipes saved offline`} style={{width:6,height:6,borderRadius:'50%',background:'#34D399',display:'inline-block',marginLeft:4,flexShrink:0}} />
              )}
            </div>
          )}
          <div className="flex items-center" style={{gap:6}}>
            <button aria-label="Toggle dark mode" onClick={toggleDarkMode} className={`${darkMode ? 'bg-gray-800 border border-gray-700' : 'border'} ${hoverClass} transition flex items-center justify-center`} style={{width:36,height:36,borderRadius:10,...t.headerBtn}}>
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" style={{color:'#6B7280'}} />}
            </button>
            <button aria-label="Settings" onClick={() => { setShowSettings(true); loadCacheStats(); }} className={`${darkMode ? 'bg-gray-800 border border-gray-700' : 'border'} ${hoverClass} transition flex items-center justify-center`} style={{width:36,height:36,borderRadius:10,...t.headerBtn}}>
              <Settings className={`w-4 h-4`} style={t.textMuted} />
            </button>
          </div>
        </div>
        {/* Accent gradient line */}
        <div style={{height:2,background: darkMode ? 'linear-gradient(90deg, transparent, rgba(190,255,70,0.3), transparent)' : 'linear-gradient(90deg, transparent, rgba(239,68,68,0.3), transparent)',marginTop:-1}} />
      </div>
      <div className="max-w-2xl mx-auto px-5 py-7" style={{position:'relative',zIndex:1,paddingBottom:120}}>
        {/* FIX #9: Global error display */}
        {error && (
          <div role="alert" aria-live="assertive" className={`mb-4 ${darkMode ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'} border rounded-lg p-4 text-sm flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
            <button onClick={() => setError('')} className="p-1"><X className="w-4 h-4" /></button>
          </div>
        )}
        {/* Offline banner */}
        {isOffline && (
          <div role="alert" style={{...frow,gap:8,padding:'10px 14px',marginBottom:12,borderRadius:10,background: darkMode ? 'rgba(239,68,68,0.1)' : '#FEF2F2',border:`1px solid ${darkMode ? 'rgba(239,68,68,0.2)' : '#FECACA'}`}}>
            <div style={{width:8,height:8,borderRadius:4,background:'#EF4444',flexShrink:0}} />
            <span style={{fontSize:13,fontWeight:600,color: darkMode ? '#FCA5A5' : '#B91C1C'}}>You're offline — some features need internet</span>
          </div>
        )}
        {/* FIX #10: Timer completion notification */}
        {timerDone && (
          <div className={`mb-4 ${darkMode ? 'bg-green-900/30 border-green-800 text-green-300' : 'bg-green-100 border-green-300 text-green-800'} border rounded-lg p-4 text-sm font-semibold flex items-center justify-between animate-pulse`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Timer complete! Time to check your food.
            </div>
            <button onClick={() => setTimerDone(false)} className="p-1"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* ==================== HOME ==================== */}
        {/* ==================== ONBOARDING ==================== */}
        {!onboardingDone && step === 'home' && !showSettings && (() => {
          const steps = [
            { title: "What's your name?", subtitle: 'We\'ll use it to greet you', type: 'name', emoji: '👋' },
            { title: "How do you eat?", subtitle: 'We\'ll only show recipes that work for you', type: 'dietary', emoji: '🥗' },
            { title: "How comfortable are you in the kitchen?", subtitle: 'No wrong answer — we\'ll match the difficulty', type: 'skill', emoji: '👨‍🍳' },
            { title: "Anything you're allergic to?", subtitle: 'We\'ll flag recipes so you stay safe', type: 'allergens', emoji: '🛡️' },
          ];
          const dietaryEmojis = { None: '✓', Vegetarian: '🥕', Vegan: '🌱', 'Gluten-Free': '🌾', 'Dairy-Free': '🥛', Keto: '🥑', Paleo: '🍖', 'Low-Carb': '📉', Pescatarian: '🐟', Halal: '🕌', Kosher: '✡️' };
          const allergenEmojis = { None: '✓', Dairy: '🧀', Gluten: '🍞', Nuts: '🥜', Peanuts: '🥜', Shellfish: '🦐', Fish: '🐟', Eggs: '🥚', Soy: '🫘' };
          const s = steps[onboardingStep];
          return (
            <div className="fade-up" style={{...fcol,gap:28}}>
              <div className="text-center" style={{...fcol,alignItems:'center',gap:15}}>
                <SnapChefLogo size={56} />
                <div>
                  <h2 className={`font-extrabold ${textClass}`} style={{fontSize:28,letterSpacing:'-0.6px'}}>Welcome to Snap Chef</h2>
                  <p className={textMutedClass} style={{fontSize:15,marginTop:4}}>Quick setup — takes 30 seconds</p>
                </div>
                <div style={{...frow,gap:8}}>
                  {steps.map((_, i) => (
                    <div key={i} style={{width: i <= onboardingStep ? 32 : 8,height:8,borderRadius:4,
                      background: i < onboardingStep ? (darkMode ? '#BEFF46' : '#22c55e') : i === onboardingStep ? (darkMode ? '#BEFF46' : '#ef4444') : (darkMode ? 'rgba(255,255,255,0.08)' : '#E5E7EB'),
                      transition:'all 0.4s ease-out'}} />
                  ))}
                </div>
              </div>
              <div className={`${cardClass} border rounded-2xl shadow-sm`} style={{padding:'28px 24px'}}>
                <div style={{textAlign:'center',marginBottom:22}}>
                  <span style={{fontSize:42,display:'block',marginBottom:8}}>{s.emoji}</span>
                  <h3 className={`font-bold ${textClass}`} style={{fontSize:18}}>{s.title}</h3>
                  <p className={textMutedClass} style={{fontSize:13,marginTop:4}}>{s.subtitle}</p>
                </div>
                {s.type === 'name' && (
                  <input type="text" placeholder="Your name..." value={userProfile.name} onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                    className={`w-full px-4 py-3.5 rounded-xl border ${inputClass} text-lg`} style={{textAlign:'center'}} autoFocus />
                )}
                {s.type === 'dietary' && (
                  <div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Low-Carb', 'Pescatarian', 'Halal', 'Kosher'].map(opt => (
                        <button key={opt} onClick={() => {
                          const d = opt === 'None' ? ['None'] : userProfile.dietary.filter(x => x !== 'None').includes(opt) ? userProfile.dietary.filter(x => x !== opt) : [...userProfile.dietary.filter(x => x !== 'None'), opt];
                          setUserProfile({...userProfile, dietary: d});
                        }} className={`px-4 py-2.5 rounded-full text-sm font-medium transition ${userProfile.dietary.includes(opt) ? chipActiveClass : chipClass}`}>
                          <span style={{marginRight:4}}>{dietaryEmojis[opt]}</span>{opt}
                        </button>
                      ))}
                    </div>
                    <p className={`text-xs ${textMutedClass} text-center`} style={{marginTop:13}}>Select all that apply — change anytime in Settings</p>
                  </div>
                )}
                {s.type === 'skill' && (
                  <div style={{...fcol,gap:10}}>
                    {[['beginner', '🔰', 'Beginner', 'Simple recipes, basic techniques'], ['intermediate', '👩‍🍳', 'Intermediate', 'Comfortable with most recipes'], ['advanced', '⭐', 'Advanced', 'Bring on the challenge']].map(([val, icon, label, desc]) => (
                      <button key={val} onClick={() => setUserProfile({...userProfile, skillLevel: val})}
                        className={`text-left transition ${cardClass} border`}
                        style={{...frow,gap:R.card,padding:'16px 18px',borderRadius:R.card,borderWidth:2,borderColor: userProfile.skillLevel === val ? (darkMode ? '#BEFF46' : '#ef4444') : (darkMode ? 'rgba(255,255,255,0.06)' : '#E5E7EB'),background: userProfile.skillLevel === val ? (darkMode ? 'rgba(190,255,70,0.06)' : 'rgba(239,68,68,0.04)') : undefined}}>
                        <span style={{fontSize:28}}>{icon}</span>
                        <div>
                          <span className="font-bold" style={{fontSize:15,color: userProfile.skillLevel === val ? t.accent : (darkMode ? '#F9FAFB' : '#111827')}}>{label}</span>
                          <p style={{fontSize:13,marginTop:1,...t.textMuted}}>{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {s.type === 'allergens' && (
                  <div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['None', 'Dairy', 'Gluten', 'Nuts', 'Peanuts', 'Shellfish', 'Fish', 'Eggs', 'Soy'].map(a => (
                        <button key={a} onClick={() => {
                          if (a === 'None') { setAllergens([]); return; }
                          const lower = a.toLowerCase();
                          const updated = allergens.includes(lower) ? allergens.filter(x => x !== lower) : [...allergens, lower];
                          setAllergens(updated);
                        }} className={`px-4 py-2.5 rounded-full text-sm font-medium transition ${a === 'None' && allergens.length === 0 ? chipActiveClass : allergens.includes(a.toLowerCase()) ? 'bg-red-500 text-white shadow-md' : chipClass}`}>
                          <span style={{marginRight:4}}>{allergenEmojis[a]}</span>{a}
                        </button>
                      ))}
                    </div>
                    <p className={`text-xs ${textMutedClass} text-center`} style={{marginTop:13}}>You can update these in Settings anytime</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                {onboardingStep > 0 && (
                  <button onClick={() => setOnboardingStep(onboardingStep - 1)} className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} ${textClass} rounded-2xl py-4 font-semibold`}>Back</button>
                )}
                <button onClick={() => {
                  if (onboardingStep < steps.length - 1) setOnboardingStep(onboardingStep + 1);
                  else completeOnboarding(userProfile);
                }} className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl py-4 font-bold shadow-lg shadow-red-500/20">
                  {onboardingStep < steps.length - 1 ? 'Continue' : "Let's Cook! 🎉"}
                </button>
              </div>
              {onboardingStep === 0 && (
                <button onClick={() => { setOnboardingDone(true); saveToStorage('onboarding-done', true); }} className={`w-full text-sm ${textMutedClass}`} style={{padding:'4px 0'}}>Skip for now</button>
              )}
            </div>
          );
        })()}
        {step === 'home' && onboardingDone && !cookMode && !showSaved && !showShoppingList && !showSettings && !showTracker && !showMealScanner && !showStats && !showScanHistory && (
          <div style={{...fcol,gap:24}}>
            {/* Greeting */}
            <div className="fade-up">
              <h2 className={`font-extrabold ${textClass}`} style={{fontSize:28,letterSpacing:'-0.8px',lineHeight:1.2,...t.text}}>
                {(() => { const h = new Date().getHours(); const name = userProfile.name ? `, ${userProfile.name}` : '';
                  if (h < 5) return <>Late night <span style={{color: t.accent}}>cravings</span>{name}?</>;
                  if (h < 12) return <>Good morning{name}, <br/>what's for <span style={{color: t.accent}}>breakfast</span>?</>;
                  if (h < 17) return <>Good afternoon{name}, <br/>ready to <span style={{color: t.accent}}>cook</span>?</>;
                  if (h < 21) return <>Good evening{name}, <br/>what's for <span style={{color: t.accent}}>dinner</span>?</>;
                  return <>Late night <span style={{color: t.accent}}>snack</span>{name}?</>;
                })()}
              </h2>
              <p className={`${textMutedClass}`} style={{fontSize:15,marginTop:6,...t.textMuted}}>Snap, search, or plan your next meal</p>
            </div>
            {/* Setup reminder — shown when user skipped onboarding */}
            {!userProfile.name && (
              <button onClick={() => { setOnboardingDone(false); setOnboardingStep(0); }}
                className={`fade-up-d1 w-full text-left ${darkMode ? 'border-gray-700' : ''} border`}
                style={{...frow,gap:14,padding:'14px 16px',borderRadius:R.card,background: darkMode ? 'rgba(190,255,70,0.04)' : '#FFFFFF',cursor:'pointer',...t.border}}>
                <div style={{width:38,height:38,borderRadius:R.inner,background: darkMode ? 'rgba(190,255,70,0.1)' : '#F3F4F6',...fc,flexShrink:0}}>
                  <Users className="w-5 h-5" style={{color: t.accent}} />
                </div>
                <div style={{flex:1}}>
                  <p className={`font-bold text-sm`} style={t.text}>Complete your profile</p>
                  <p className={`text-xs`} style={{marginTop:1,...t.textMuted}}>Set dietary goals, allergens & preferences for personalized recipes</p>
                </div>
                <ArrowLeft className={`w-4 h-4`} style={{transform:'rotate(180deg)',flexShrink:0,...t.textMuted}} />
              </button>
            )}
            {/* Alert — vertical bar accent */}
            {expiringItems.length > 0 && (
              <div className={`fade-up-d1 ${darkMode ? 'bg-red-950/40 border-red-900/50' : 'bg-red-50 border-red-100'} border`} style={{...frow,gap:S.gap,padding:'14px 16px',borderRadius:R.card}}>
                <div style={{width:3,height:32,borderRadius:2,background: darkMode ? '#FF5C72' : '#ef4444',flexShrink:0}} />
                <div>
                  <p className={`font-bold text-sm ${darkMode ? 'text-red-200' : 'text-red-800'}`}>{expiringItems.length} items expiring</p>
                  <p className={`text-xs ${darkMode ? 'text-red-300' : 'text-red-700'}`} style={{marginTop:1}}>{expiringItems.map(item => item.name).join(', ')}</p>
                </div>
              </div>
            )}
            {/* Hero CTA */}
            <button aria-label="Scan ingredients" onClick={() => nav('capture')} className="card-hover w-full fade-up-d1"
              style={darkMode ? {
                width:'100%',padding:'22px 24px',borderRadius:R.card,cursor:'pointer',fontFamily:'inherit',
                border:'1px solid rgba(190,255,70,0.15)',background:'linear-gradient(135deg, rgba(190,255,70,0.08), rgba(190,255,70,0.02))',
                ...frow,gap:16,position:'relative',overflow:'hidden'
              } : {
                width:'100%',padding:'22px 24px',borderRadius:R.card,cursor:'pointer',fontFamily:'inherit',
                background:'linear-gradient(135deg, #ef4444, #f97316)',boxShadow:'0 8px 32px rgba(239,68,68,0.25)',
                ...frow,gap:16,border:'none',position:'relative',overflow:'hidden'
              }}>
              {/* Animated shimmer */}
              <div style={{position:'absolute',inset:0,overflow:'hidden',borderRadius:R.card,pointerEvents:'none'}}>
                <div style={{position:'absolute',top:0,left:0,width:'50%',height:'100%',background: darkMode ? 'linear-gradient(90deg, transparent, rgba(190,255,70,0.06), transparent)' : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',animation:'heroShimmer 3s ease-in-out infinite'}} />
              </div>
              <div style={darkMode ? {width:48,height:48,borderRadius:R.inner,...fc,background:'#BEFF46',flexShrink:0,boxShadow:'0 4px 16px rgba(190,255,70,0.25)'} : {width:48,height:48,borderRadius:R.inner,background:'rgba(255,255,255,0.2)',backdropFilter:'blur(8px)',...fc,flexShrink:0}}>
                <Camera style={{width:22,height:22,color: gradientBtnCol}} />
              </div>
              <div style={{textAlign:'left'}}>
                <span style={{fontSize:16,fontWeight:700,color: darkMode ? '#BEFF46' : '#FFFFFF',display:'block',letterSpacing:'-0.2px'}}>Scan Ingredients</span>
                <span style={{fontSize:11,fontWeight:500,color: darkMode ? 'rgba(190,255,70,0.6)' : 'rgba(255,255,255,0.75)',marginTop:2,display:'block'}}>Snap a photo of what you have</span>
              </div>
              <div style={{marginLeft:'auto',color: darkMode ? 'rgba(190,255,70,0.4)' : 'rgba(255,255,255,0.4)',flexShrink:0}}>
                <ArrowLeft style={{width:18,height:18,transform:'rotate(180deg)'}} />
              </div>
            </button>
            {/* Action Grid — Primary tools */}
            <div className="fade-up-d2" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:S.gap}}>
              {[
                { action: () => nav('pantry'), icon: <Package className="w-6 h-6" />, label: 'Pantry', color: darkMode ? '#34D399' : '#16a34a', bg: darkMode ? 'rgba(52,211,153,0.15)' : 'rgba(22,163,74,0.07)', glow: darkMode ? '0 4px 20px rgba(52,211,153,0.12)' : '0 4px 16px rgba(22,163,74,0.08)', badge: pantryItems.length || null },
                { action: () => nav('mealPlan'), icon: <Calendar className="w-6 h-6" />, label: 'Meal Plan', color: darkMode ? '#B07CFF' : '#7c3aed', bg: darkMode ? 'rgba(176,124,255,0.15)' : 'rgba(124,58,237,0.07)', glow: darkMode ? '0 4px 20px rgba(176,124,255,0.12)' : '0 4px 16px rgba(124,58,237,0.08)' },
                { action: () => setShowShoppingList(true), icon: <ShoppingCart className="w-6 h-6" />, label: 'Shopping', color: darkMode ? '#5CA4FF' : '#2563eb', bg: darkMode ? 'rgba(92,164,255,0.15)' : 'rgba(37,99,235,0.07)', glow: darkMode ? '0 4px 20px rgba(92,164,255,0.12)' : '0 4px 16px rgba(37,99,235,0.08)', badge: shoppingList.filter(i=>!i.checked).length || null },
              ].map((item, i) => (
                <button key={i} onClick={item.action} className={`card-hover ${cardClass} border`}
                  style={{borderRadius:R.card,padding:'18px 12px',...fcol,alignItems:'center',gap:S.tight,cursor:'pointer',textAlign:'center',...t.card,
                    boxShadow: darkMode ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)'}}>
                  <div style={{width:48,height:48,borderRadius:R.inner,background:item.bg,color:item.color,...fc,flexShrink:0,boxShadow:item.glow}}>
                    {item.icon}
                  </div>
                  <span className="font-semibold" style={{fontSize:13,...t.text}}>{item.label}</span>
                  {item.badge ? <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:11,fontWeight:600,color: t.accent}}>{item.badge}</span> : null}
                </button>
              ))}
            </div>
            {/* Action Grid — Secondary tools */}
            <div className="fade-up-d2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:S.tight,marginTop:-S.gap}}>
              {[
                { action: () => setShowStats(true), icon: <Award className="w-4 h-4" />, label: 'CookStats', color: darkMode ? '#FBBF24' : '#D97706' },
                { action: () => setShowScanHistory(true), icon: <History className="w-4 h-4" />, label: 'ScanLog', color: darkMode ? '#A78BFA' : '#7C3AED' },
              ].map((item, i) => (
                <button key={i} onClick={item.action}
                  style={{...frow,justifyContent:'center',gap:6,padding:'10px 8px',borderRadius:R.sm,cursor:'pointer',
                    background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',border:'none'}}>
                  <span style={{color:item.color}}>{item.icon}</span>
                  <span style={{fontSize:11,fontWeight:600,...t.textMuted}}>{item.label}</span>
                </button>
              ))}
            </div>
            {/* Nutrition ring — always visible, uses today's actual date */}
            <div className="fade-up-d3" style={{position:'relative'}}>
              <div className="flex items-center justify-between" style={{marginBottom:12}}>
                <span style={{...sLabel,marginBottom:0}}>Nutrition</span>
                <div style={{...frow,gap:12}}>
                  <button onClick={() => setShowNutritionEdit(!showNutritionEdit)}
                    style={{fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:20,cursor:'pointer',transition:'all 0.2s',
                      background: showNutritionEdit ? (darkMode ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)') : (darkMode ? 'rgba(255,255,255,0.06)' : '#F3F4F6'),
                      color: showNutritionEdit ? '#ef4444' : (darkMode ? '#D1D5DB' : '#374151'),
                      border: `1px solid ${showNutritionEdit ? (darkMode ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)') : (darkMode ? 'rgba(255,255,255,0.08)' : '#E5E7EB')}`}}>
                    {showNutritionEdit ? '✕ Done' : '⚙ Set limits'}
                  </button>
                  <button onClick={() => setShowTracker(true)} style={{fontSize:11,color: t.accent,fontWeight:600,background:'none',border:'none',cursor:'pointer'}}>View all →</button>
                </div>
              </div>
              {showNutritionEdit && (
                <div className={`${cardClass} border`} style={{borderRadius:R.card,padding:16,marginBottom:10,...t.card,animation:'fadeUp 0.2s ease-out both'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8}}>
                    {[
                      { field: 'calorieTarget', label: 'Calories', unit: 'kcal', color: darkMode ? '#BEFF46' : '#ef4444' },
                      { field: 'proteinTarget', label: 'Protein', unit: 'g', color: darkMode ? '#FF8C42' : '#ef4444' },
                      { field: 'carbTarget', label: 'Carbs', unit: 'g', color: darkMode ? '#BEFF46' : '#16a34a' },
                      { field: 'fatTarget', label: 'Fat', unit: 'g', color: darkMode ? '#B07CFF' : '#7c3aed' },
                    ].map(m => (
                      <div key={m.field} style={{textAlign:'center'}}>
                        <label style={{fontSize:11,fontWeight:600,...t.textMuted,display:'block',marginBottom:4}}>{m.label}</label>
                        <input type="number" value={userProfile[m.field] || ''} onChange={(e) => updateMacroTarget(m.field, e.target.value)}
                          className={`${inputClass}`} style={{width:'100%',padding:'6px 4px',borderRadius:8,fontSize:15,fontWeight:700,fontFamily:'JetBrains Mono, monospace',textAlign:'center'}} />
                        <span style={{fontSize:11,color:m.color,fontWeight:600}}>{m.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className={`${cardClass} border`} style={{borderRadius:R.card,overflow:'hidden',...t.card,boxShadow: darkMode ? '0 4px 24px rgba(0,0,0,0.35)' : '0 2px 16px rgba(0,0,0,0.05)'}}>
                {/* Calorie ring — centered hero */}
                <div style={{padding:'28px 20px 18px',textAlign:'center'}}>
                  {(() => {
                    const ringColor = homeCalPct > 1 ? '#ef4444' : homeCalPct > 0.85 ? '#f59e0b' : (darkMode ? '#BEFF46' : '#22c55e');
                    const r = 44, circ = 2 * Math.PI * r;
                    return (
                      <div style={{position:'relative',display:'inline-block'}}>
                        <svg width="108" height="108" viewBox="0 0 108 108">
                          <circle cx="54" cy="54" r={r} fill="none" stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#F3F4F6'} strokeWidth="8" />
                          <circle cx="54" cy="54" r={r} fill="none" stroke={ringColor} strokeWidth="8"
                            strokeDasharray={`${Math.min(circ, homeCalPct * circ)} ${circ}`} strokeLinecap="round" transform="rotate(-90 54 54)"
                            style={{transition:'stroke-dasharray 0.6s ease-out', filter: homeCalPct > 0 ? `drop-shadow(0 0 6px ${ringColor}40)` : 'none'}} />
                        </svg>
                        <div style={{position:'absolute',inset:0,...fcol,alignItems:'center',justifyContent:'center'}}>
                          <span className="font-bold" style={{fontSize:24,fontFamily:'JetBrains Mono, monospace',letterSpacing:'-1px',...t.text}}>{homeTotals.calories.toLocaleString()}</span>
                          <span style={{fontSize:11,fontWeight:500,...t.textMuted}}>/ {homeCalTarget.toLocaleString()} cal</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                {/* Macro bars — horizontal row */}
                <div style={{padding:'0 20px 16px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                  {[
                    { label: 'Protein', val: homeTotals.protein, target: userProfile.proteinTarget || 150, color: darkMode ? '#FF8C42' : '#F97316' },
                    { label: 'Carbs', val: homeTotals.carbs, target: userProfile.carbTarget || 200, color: darkMode ? '#34D399' : '#16a34a' },
                    { label: 'Fat', val: homeTotals.fat, target: userProfile.fatTarget || 65, color: darkMode ? '#B07CFF' : '#8B5CF6' },
                  ].map(m => {
                    const pct = m.target > 0 ? Math.min(1, m.val / m.target) : 0;
                    const over = m.val > m.target;
                    const barColor = over ? '#ef4444' : pct > 0.85 ? '#f59e0b' : m.color;
                    return (
                      <div key={m.label} style={{textAlign:'center'}}>
                        <span style={{fontSize:13,fontWeight:600,...t.textMuted,display:'block',marginBottom:6}}>{m.label}</span>
                        <div style={{height:6,borderRadius:3,background: darkMode ? 'rgba(255,255,255,0.06)' : '#F3F4F6',overflow:'hidden',marginBottom:6}}>
                          <div style={{height:'100%',borderRadius:3,width:`${pct * 100}%`,background:barColor,transition:'width 0.5s ease-out',boxShadow: pct > 0 ? `0 0 8px ${barColor}40` : 'none'}} />
                        </div>
                        <span style={{fontSize:15,fontFamily:'JetBrains Mono, monospace',fontWeight:700,color: over ? '#ef4444' : (darkMode ? '#F9FAFB' : '#111827')}}>{m.val}</span>
                        <span style={{fontSize:13,...t.textMuted,fontWeight:400}}>/{m.target}g</span>
                      </div>
                    );
                  })}
                </div>
                {/* Status footer */}
                <div style={{padding:'12px 20px',borderTop:`1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : '#F3F4F6'}`,background: darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'}}>
                  {homeTotals.calories === 0 ? (
                    <p style={{fontSize:13,textAlign:'center',...t.textMuted}}>Log a meal to start tracking</p>
                  ) : (
                    <div style={{display:'flex',justifyContent:'space-between'}}>
                      {[
                        { label: 'calories', val: homeCalTarget - homeTotals.calories, unit: '' },
                        { label: 'protein', val: (userProfile.proteinTarget || 150) - homeTotals.protein, unit: 'g' },
                        { label: 'carbs', val: (userProfile.carbTarget || 200) - homeTotals.carbs, unit: 'g' },
                        { label: 'fat', val: (userProfile.fatTarget || 65) - homeTotals.fat, unit: 'g' },
                      ].map((i, idx) => {
                        const c = i.val <= 0 ? '#ef4444' : i.val < (idx === 0 ? 300 : 20) ? '#f59e0b' : (darkMode ? '#34D399' : '#16a34a');
                        return (
                          <span key={i.label} style={{fontSize:11,fontWeight:600,color:c,textAlign:'center',lineHeight:1.4}}>
                            {i.val <= 0 ? `+${Math.abs(i.val)}${i.unit}` : `${i.val}${i.unit}`}<br/>
                            <span style={{fontWeight:500,opacity:0.8}}>{i.label} {i.val <= 0 ? 'over' : 'left'}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Recent Scans */}
            {scanHistory.length > 0 && (
              <div className="fade-up-d4">
                <span style={{...sLabel}}>Recent Scans</span>
                <div className="flex overflow-x-auto pb-2 scrollbar-hide" style={{gap:8}}>
                  {scanHistory.slice(0, 5).map((scan) => (
                    <button key={scan.id} onClick={() => loadScan(scan)} className="card-hover flex-shrink-0" style={{width:110}}>
                      <div className={`relative overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} style={{width:110,height:72,borderRadius:10}}>
                        {scan.thumbnails?.filter(Boolean).length > 0 ? (
                          <img src={scan.thumbnails[0]} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <Camera className={`w-5 h-5 ${textMutedClass}`} />
                          </div>
                        )}
                        <div style={{position:'absolute',bottom:4,left:4,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(4px)',color: darkMode ? '#BEFF46' : '#ef4444',fontFamily:'JetBrains Mono, monospace',fontSize:11,padding:'2px 7px',borderRadius:4,fontWeight:600}}>{scan.ingredients.length} items</div>
                      </div>
                      <div className="mt-1.5 text-left">
                        <p className={`font-bold ${textClass}`} style={{fontSize:11}}>{scan.ingredients.slice(0, 2).join(', ')}</p>
                        <p className={textMutedClass} style={{fontSize:11}}>{new Date(scan.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Expiring Soon Alert */}
            {expiringItems.length > 0 && (
              <div className="fade-up-d3" style={{padding:'14px 16px',borderRadius:R.card,border:`1px solid ${darkMode ? 'rgba(250,204,21,0.2)' : 'rgba(234,179,8,0.3)'}`,background: darkMode ? 'rgba(250,204,21,0.05)' : 'rgba(254,249,195,0.5)'}}>
                <p style={{fontSize:13,fontWeight:700,marginBottom:6,color: darkMode ? '#FACC15' : '#A16207'}}>⏰ Expiring soon</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {expiringItems.slice(0, 5).map((item, i) => {
                    const days = getDaysUntilExpiry(item.expiry);
                    return (
                      <span key={i} style={{fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:8,
                        background: days <= 1 ? (darkMode ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)') : (darkMode ? 'rgba(250,204,21,0.1)' : 'rgba(234,179,8,0.08)'),
                        color: days <= 1 ? '#EF4444' : (darkMode ? '#FACC15' : '#A16207')}}>
                        {item.name} · {days <= 0 ? 'today' : days === 1 ? 'tomorrow' : `${days}d`}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {/* New user hint */}
            {recipeHistory.length === 0 && savedRecipes.length === 0 && (
              <p className="fade-up-d3 text-center" style={{fontSize:13,padding:'4px 20px',lineHeight:1.5,...t.textMuted}}>Scan ingredients, search for a craving, or plan your week — pick any spot to start.</p>
            )}
            {/* Recently Cooked */}
            {recipeHistory.length > 0 && (
              <div className="fade-up-d4">
                <span style={{...sLabel}}>Recently Cooked</span>
                <div style={{...fcol,gap:8}}>
                  {recipeHistory.slice(0, 3).map((recipe, i) => (
                    <button key={recipe.id || i} onClick={() => getFullRecipe(recipe)} className={`card-hover w-full ${cardClass} border shadow-sm text-left flex items-center gap-3`} style={{borderRadius:R.card,padding:14}}>
                      <div className={`${darkMode ? 'bg-orange-500/10' : 'bg-orange-50'} flex items-center justify-center flex-shrink-0`} style={{width:38,height:38,borderRadius:R.inner}}>
                        <RotateCcw className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold ${textClass} truncate`} style={{fontSize:13}}>{recipe.name}</h4>
                        <p className={`text-xs ${textMutedClass}`}>{new Date(recipe.cookedDate).toLocaleDateString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== CAPTURE ==================== */}
        {step === 'capture' && (
          <div className="space-y-6 fade-up screen-enter">
            <div className="text-center space-y-2">
              <h2 className={`text-3xl font-extrabold tracking-tight ${textClass}`}>What ingredients do you have?</h2>
              <p className={`${textMutedClass} text-base`}>Add one or more photos for better results</p>
            </div>
            {/* Staged photos */}
            {images.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-medium ${textClass}`}>{images.length}/{MAX_PHOTOS} photo{images.length !== 1 ? 's' : ''}</p>
                  <button onClick={() => tapConfirm('clear-photos', () => setImages([]))} className="text-xs text-red-500 hover:text-red-600">{confirmId === 'clear-photos' ? 'Tap to confirm' : 'Clear all'}</button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden border-2 border-orange-300 shadow-sm">
                      <img src={img.src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                  {/* Add more button inline */}
                  {images.length < MAX_PHOTOS && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex-shrink-0 w-28 h-28 rounded-lg border-2 border-dashed ${darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-orange-400'} flex flex-col items-center justify-center gap-1 transition`}
                    >
                      <Plus className={`w-6 h-6 ${textMutedClass}`} />
                      <span className={`text-xs ${textMutedClass}`}>Add more</span>
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* Add photo buttons */}
            {images.length < MAX_PHOTOS && (
              <div className="grid gap-3">
                <button onClick={() => cameraInputRef.current?.click()} className="card-hover flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-5 shadow-lg shadow-red-500/20">
                  <Camera className="w-6 h-6" /><span className="text-lg font-bold">Take Photo</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className={`card-hover flex items-center justify-center gap-3 ${cardClass} border-2 rounded-2xl p-5 shadow-sm`}>
                  <Upload className="w-6 h-6 text-orange-500" /><span className={`text-lg font-bold ${textClass}`}>Upload Photo</span>
                </button>
              </div>
            )}
            {/* Find Recipes button */}
            {images.length > 0 && (
              <button
                onClick={analyzeAllImages}
                className="card-hover w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-5 font-bold text-lg shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <SnapChefIcon className="w-6 h-6" />
                Find Recipes ({images.length} photo{images.length !== 1 ? 's' : ''})
              </button>
            )}
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageCapture} className="hidden" />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageCapture} className="hidden" />
            <div className={`${darkMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border rounded-lg p-4 space-y-2`}>
              <p className={`font-semibold text-sm ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>Tips for best results:</p>
              <ul className={`text-sm space-y-1 ml-4 list-disc ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                <li>Add multiple photos for the most complete results</li>
                <li>Works with fridges, counters, shopping carts, pantries</li>
                <li>Good lighting helps identify ingredients</li>
                <li>Spread items out so labels are visible</li>
              </ul>
            </div>
          </div>
        )}

        {/* ==================== SEARCH ==================== */}
        {/* FIX #1 & #2: Controlled input, onKeyDown, proper button handler */}
        {step === 'search' && (
          <div className="space-y-6 fade-up screen-enter">
            <div className="text-center space-y-2">
              <h2 className={`text-3xl font-extrabold tracking-tight ${textClass}`}>Search Recipes</h2>
              <p className={`${textMutedClass} text-base`}>Find recipes by ingredient, cuisine, or dish</p>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                aria-label="Search for recipes" placeholder="E.g., 'pasta', 'chicken curry', 'Italian'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-3.5 rounded-xl border ${inputClass} text-base`}
                onKeyDown={(e) => { if (e.key === 'Enter' && searchQuery.trim()) searchRecipes(searchQuery.trim()); }}
              />
              <button
                onClick={() => { if (searchQuery.trim()) searchRecipes(searchQuery.trim()); }}
                disabled={streamingRecipes}
                className={`card-hover w-full bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 ${streamingRecipes ? 'opacity-50' : ''}`}
              >
                {streamingRecipes ? <><Loader2 className="w-5 h-5 animate-spin" /> Searching...</> : <><Search className="w-5 h-5" /> Search</>}
              </button>
            </div>
            <div>
              <p className={`text-sm ${textMutedClass} mb-3 font-medium`}>Quick searches:</p>
              <div className="flex flex-wrap gap-2">
                {['Quick dinner', 'Healthy', 'Vegetarian', 'Dessert', 'Breakfast'].map(term => (
                  <button key={term} onClick={() => searchRecipes(term)} className={`px-4 py-2 rounded-full text-sm font-medium ${chipClass} transition`}>{term}</button>
                ))}
              </div>
            </div>
            {recentSearches.length > 0 && (
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                  <p className={`text-sm ${textMutedClass} font-medium`}>Recent:</p>
                  <button onClick={() => { setRecentSearches([]); saveToStorage('recent-searches', []); }} style={{fontSize:11,color:'#ef4444',fontWeight:600,background:'none',border:'none',cursor:'pointer'}}>Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map(term => (
                    <button key={term} onClick={() => { setSearchQuery(term); searchRecipes(term); }}
                      style={{...frow,gap:5,padding:'8px 14px',borderRadius:20,fontSize:13,fontWeight:500,background: subtleBg,border:`1px solid ${borderCol}`,cursor:'pointer',...t.text}}>
                      <Clock style={{width:12,height:12,...t.textMuted}} /> {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== PANTRY ==================== */}
        {step === 'pantry' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${textClass}`}>My Pantry</h2>
              <button onClick={() => setShowAddPantry(true)} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            {showAddPantry && (
              <div className={`${cardClass} border rounded-lg p-4 space-y-3`}>
                <input type="text" aria-label="Pantry item name" placeholder="Item name" value={newPantryItem.name} onChange={(e) => setNewPantryItem({ ...newPantryItem, name: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') addPantryItem(); }} className={`w-full px-3 py-2 rounded border ${inputClass}`} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Quantity" value={newPantryItem.quantity} onChange={(e) => setNewPantryItem({ ...newPantryItem, quantity: e.target.value })} className={`px-3 py-2 rounded border ${inputClass}`} />
                  <input type="date" value={newPantryItem.expiry} onChange={(e) => setNewPantryItem({ ...newPantryItem, expiry: e.target.value })} className={`px-3 py-2 rounded border ${inputClass}`} />
                </div>
                <div className="flex gap-2">
                  <button onClick={addPantryItem} className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition">Add</button>
                  <button onClick={() => setShowAddPantry(false)} className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-2 rounded transition`}>Cancel</button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {pantryItems.map(item => {
                const days = getDaysUntilExpiry(item.expiry);
                const isExpired = days !== null && days < 0;
                const isExpiring = days !== null && days >= 0 && days <= 3;
                return (
                  <div key={item.id} className={`${cardClass} border rounded-lg p-4 flex items-center justify-between`}
                    style={{borderColor: isExpired ? '#EF4444' : isExpiring ? (darkMode ? '#B45309' : '#F59E0B') : undefined}}>
                    <div className="flex-1">
                      <div style={{...frow,gap:8}}>
                        <h4 className={`font-semibold ${textClass}`}>{item.name}</h4>
                        {isExpired && <span style={{fontSize:11,fontWeight:700,padding:'2px 6px',borderRadius:4,background:'rgba(239,68,68,0.1)',color:'#EF4444'}}>EXPIRED</span>}
                        {isExpiring && !isExpired && <span style={{fontSize:11,fontWeight:700,padding:'2px 6px',borderRadius:4,background: darkMode ? 'rgba(250,204,21,0.1)' : 'rgba(234,179,8,0.08)',color: darkMode ? '#FACC15' : '#A16207'}}>{days === 0 ? 'TODAY' : days === 1 ? '1 DAY' : `${days} DAYS`}</span>}
                      </div>
                      <div className={`text-sm ${textMutedClass} flex items-center gap-3`} style={{marginTop:2}}>
                        {item.quantity && <span>{item.quantity}</span>}
                        {item.expiry && !isExpired && !isExpiring && <span>Exp: {new Date(item.expiry).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <button onClick={() => removePantryItem(item.id)} className={`p-2 ${darkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-100'} rounded transition`}>
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                );
              })}
              {pantryItems.length === 0 && (
                <div className="text-center" style={{padding:'40px 20px'}}>
                  <div style={{width:80,height:80,borderRadius:20,background: darkMode ? 'rgba(52,211,153,0.08)' : 'rgba(22,163,74,0.06)',...fc,margin:'0 auto 16px'}}>
                    <Package style={{width:36,height:36,color: darkMode ? '#34D399' : '#16a34a',opacity:0.6}} />
                  </div>
                  <p className="font-bold" style={{fontSize:16,...t.text}}>Your pantry is empty</p>
                  <p style={{fontSize:13,marginTop:6,maxWidth:240,margin:'6px auto 0',...t.textMuted}}>Add ingredients you have at home so we can find recipes that match</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== MEAL PLANNER ==================== */}
        {step === 'mealPlan' && (
          <div className="space-y-5">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <h2 className={`text-2xl font-bold ${textClass}`}>Meal Planner</h2>
              <button onClick={autoFillMealPlan} disabled={fillingMealPlan} style={{padding:'8px 14px',borderRadius:10,fontSize:13,fontWeight:700,border:'none',cursor: fillingMealPlan ? 'not-allowed' : 'pointer',
                background: darkMode ? 'rgba(190,255,70,0.08)' : 'rgba(239,68,68,0.06)',color: t.accent,opacity: fillingMealPlan ? 0.6 : 1,display:'flex',alignItems:'center',gap:6}}>
                {fillingMealPlan ? <><Loader2 className="w-4 h-4 animate-spin" /> Planning...</> : '✨ Auto-fill week'}
              </button>
            </div>
            {/* Week at a glance */}
            <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4}} className="scrollbar-hide">
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date(); d.setDate(d.getDate() + i);
                const key = d.toISOString().split('T')[0];
                const dayMeals = mealPlan[key] || {};
                const filledCount = mealSlots.filter(m => dayMeals[m]).length;
                const isSelected = key === selectedDate;
                const isToday = i === 0;
                return (
                  <button key={key} onClick={() => setSelectedDate(key)}
                    style={{minWidth:56,padding:'10px 6px',borderRadius:12,textAlign:'center',cursor:'pointer',flexShrink:0,border: isSelected ? `2px solid ${t.accent}` : `1px solid ${borderCol}`,
                      background: isSelected ? (darkMode ? 'rgba(190,255,70,0.08)' : 'rgba(239,68,68,0.04)') : cardBg,transition:'all 0.2s'}}>
                    <p style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',color: isToday ? t.accent : (darkMode ? '#9CA3AF' : '#6B7280')}}>{isToday ? 'Today' : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]}</p>
                    <p style={{fontSize:18,fontWeight:800,marginTop:2,color: isSelected ? t.accent : (darkMode ? '#F9FAFB' : '#111827')}}>{d.getDate()}</p>
                    <div style={{display:'flex',gap:3,justifyContent:'center',marginTop:4}}>
                      {mealSlots.map((_, j) => (
                        <div key={j} style={{width:6,height:6,borderRadius:3,background: j < filledCount ? t.accent : (darkMode ? 'rgba(255,255,255,0.08)' : '#E5E7EB')}} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Day detail */}
            <div className="space-y-3">
              {mealSlots.map((mealType, slotIdx) => {
                const meal = mealPlan[selectedDate]?.[mealType];
                const isCustom = slotIdx >= 3; // First 3 slots are defaults (can rename but not remove)
                const isEditing = editingMealSlot?.index === slotIdx;
                return (
                  <div key={slotIdx} className={`${cardClass} border rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      {isEditing ? (
                        <input type="text" autoFocus value={editingMealSlot.name} onChange={(e) => setEditingMealSlot({ ...editingMealSlot, name: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') renameMealSlot(mealType, editingMealSlot.name); if (e.key === 'Escape') setEditingMealSlot(null); }}
                          onBlur={() => renameMealSlot(mealType, editingMealSlot.name)}
                          maxLength={20}
                          style={{fontSize:15,fontWeight:600,padding:'2px 6px',borderRadius:6,border:`1.5px solid ${t.accent}`,background:'transparent',color: darkMode ? '#F9FAFB' : '#111827',outline:'none',width:140}} />
                      ) : (
                        <button onClick={() => setEditingMealSlot({ index: slotIdx, name: mealType })}
                          style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',gap:6}}>
                          <h3 className={`font-semibold ${textClass}`}>{mealType}</h3>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={darkMode ? '#6B7280' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.6}}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                      )}
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        {isCustom && !meal && (
                          <button onClick={() => removeMealSlot(mealType)} className="text-red-600 text-sm">Remove</button>
                        )}
                        {meal ? (
                          <button onClick={() => removeFromMealPlan(selectedDate, mealType)} className="text-red-600 text-sm">Remove</button>
                        ) : (
                          <button onClick={() => setShowMealPicker(mealType)} className="text-orange-600 text-sm font-medium">+ Add Recipe</button>
                        )}
                      </div>
                    </div>
                    {meal ? (
                      <div className={`text-sm ${textMutedClass}`}>
                        <p className={`font-medium ${textClass}`}>{meal.name}</p>
                        <p>{meal.cookTime}{meal.calories ? ` · ${meal.calories} cal` : ''}{meal.servings ? ` · ${meal.servings} servings` : ''}</p>
                      </div>
                    ) : (
                      <p className={`text-sm ${textMutedClass}`}>No meal planned</p>
                    )}
                  </div>
                );
              })}
              {/* Add meal slot */}
              {mealSlots.length < 5 && (
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <input type="text" placeholder="e.g. Snack, Brunch..." value={newMealSlotName} onChange={(e) => setNewMealSlotName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && newMealSlotName.trim()) addMealSlot(newMealSlotName); }}
                    maxLength={20}
                    style={{flex:1,padding:'12px 14px',borderRadius:12,fontSize:14,border:`1.5px dashed ${darkMode ? 'rgba(255,255,255,0.1)' : '#D1D5DB'}`,
                      background:'transparent',color: darkMode ? '#E5E7EB' : '#374151',outline:'none'}} />
                  <button onClick={() => { if (newMealSlotName.trim()) addMealSlot(newMealSlotName); }}
                    disabled={!newMealSlotName.trim()}
                    style={{padding:'12px 16px',borderRadius:12,fontSize:13,fontWeight:700,border:'none',cursor: newMealSlotName.trim() ? 'pointer' : 'not-allowed',
                      background: newMealSlotName.trim() ? (darkMode ? 'rgba(190,255,70,0.1)' : 'rgba(239,68,68,0.06)') : 'transparent',
                      color: newMealSlotName.trim() ? t.accent : (darkMode ? '#555' : '#9CA3AF'),transition:'all 0.2s',whiteSpace:'nowrap'}}>
                    <Plus style={{width:16,height:16}} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== ANALYZING ==================== */}
        {step === 'analyzing' && (
          <div className="space-y-6 screen-fade" style={{paddingTop:8}}>
            {/* Scanning status */}
            <div className="flex items-center gap-4 fade-up">
              <div style={{position:'relative'}}>
                <div style={{width:56,height:56,borderRadius:R.card,background: darkMode ? 'rgba(190,255,70,0.06)' : 'rgba(239,68,68,0.06)',...fc}}>
                  <SnapChefLogo size={32} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{background: darkMode ? '#BEFF46' : '#ef4444',boxShadow:`0 2px 8px ${darkMode ? 'rgba(190,255,70,0.3)' : 'rgba(239,68,68,0.3)'}`}}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{color: gradientBtnCol}} />
                </div>
              </div>
              <div style={{flex:1}}>
                <p className={`font-bold`} style={{fontSize:18,...t.text}}>
                  {scanProgress.total > 0 ? `Scanning ${images.length} photo${images.length !== 1 ? 's' : ''}...` : 'Finding recipes...'}
                </p>
                <p style={{fontSize:13,marginTop:2,...t.textMuted}}>
                  {scanProgress.total > 0 ? 'Identifying ingredients' + (images.length > 1 ? ` · ${scanProgress.current} of ${images.length} scanned` : '') : 'Matching ingredients to great meals'}
                </p>
                {scanProgress.total > 0 && (
                  <div style={{marginTop:8,height:4,borderRadius:2,background: darkMode ? 'rgba(255,255,255,0.05)' : '#E5E7EB',overflow:'hidden'}}>
                    <div style={{height:'100%',borderRadius:2,transition:'width 0.5s ease-out',width:`${(scanProgress.current / scanProgress.total) * 100}%`,background: darkMode ? 'linear-gradient(90deg, #BEFF46, #9CDD20)' : 'linear-gradient(90deg, #ef4444, #f97316)'}} />
                  </div>
                )}
              </div>
            </div>
            {/* Skeleton recipe cards */}
            <div className="space-y-3 fade-up-d1">
              <Skeleton className="h-4 w-32" style={{marginBottom:12}} />
              {[0,1,2].map(i => (
                <div key={i} className={`${cardClass} border rounded-2xl p-4`} style={{display:'flex',gap:14,animation:`fadeUp 0.4s ease-out ${0.1 + i * 0.08}s both`}}>
                  <Skeleton className="" style={{width:72,height:72,borderRadius:12,flexShrink:0}} />
                  <div style={{flex:1,...fcol,gap:8}}>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div style={{display:'flex',gap:6}}>
                      <Skeleton className="" style={{width:48,height:22,borderRadius:12}} />
                      <Skeleton className="" style={{width:56,height:22,borderRadius:12}} />
                      <Skeleton className="" style={{width:44,height:22,borderRadius:12}} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Skeleton nutrition preview */}
            <div className={`${cardClass} border rounded-2xl p-5 fade-up-d2`}>
              <Skeleton className="h-4 w-40" style={{marginBottom:14}} />
              <div style={{display:'flex',gap:12}}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{flex:1,textAlign:'center'}}>
                    <Skeleton className="" style={{width:36,height:36,borderRadius:8,margin:'0 auto 8px'}} />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== REVIEW INGREDIENTS ==================== */}
        {step === 'review' && (
          <div className="screen-enter" style={{...fcol,gap:20}}>
            {/* Header with count badge */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <h2 className={`font-extrabold ${textClass}`} style={{fontSize:24,letterSpacing:'-0.5px'}}>Review Ingredients</h2>
                <p className={textMutedClass} style={{fontSize:13,marginTop:4}}>Remove wrong items, add anything missed</p>
              </div>
              <div style={{width:48,height:48,borderRadius:R.card,background: darkMode ? 'rgba(52,211,153,0.1)' : 'rgba(22,163,74,0.06)',...fc}}>
                <span className="font-bold" style={{fontSize:18,color: darkMode ? '#34D399' : '#16a34a'}}>{ingredients.length}</span>
              </div>
            </div>
            {/* Photo strip */}
            {images.length > 0 && (
              <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4}} className="scrollbar-hide">
                {images.map((img, i) => (
                  <div key={i} onClick={() => { setFullImageIndex(i); setShowFullImage(true); }}
                    style={{width:72,height:72,borderRadius:12,overflow:'hidden',flexShrink:0,cursor:'pointer',border:`2px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`}}>
                    <img src={img.src} alt={`Photo ${i + 1}`} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  </div>
                ))}
              </div>
            )}
            {/* Add ingredient input */}
            <div style={{display:'flex',gap:8}}>
              <div style={{flex:1,position:'relative'}}>
                <input
                  type="text"
                  placeholder="Add missing ingredient..."
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addIngredient(); }}
                  className={`w-full border ${inputClass}`}
                  style={{padding:'14px 16px',borderRadius:12,fontSize:15}}
                />
              </div>
              <button aria-label="Voice input" onClick={startVoiceInput} style={{width:48,height:48,borderRadius:12,...fc,background: mutedBg,border:`1px solid ${borderCol}`,cursor:'pointer',flexShrink:0}}>
                <svg viewBox="0 0 24 24" style={{width:20,height:20,color: darkMode ? '#9CA3AF' : '#6B7280'}} fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
              </button>
              <button onClick={addIngredient}
                style={{width:48,height:48,borderRadius:12,...fc,background: gradientBtn,cursor:'pointer',flexShrink:0}}>
                <Plus style={{width:20,height:20,color: gradientBtnCol}} />
              </button>
            </div>
            {/* Ingredient chips */}
            <div className={`${cardClass} border`} style={{borderRadius:R.card,padding:20,...t.card}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <span className="font-semibold" style={{fontSize:15,...t.text}}>{ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''} found</span>
                {ingredients.length > 0 && (
                  <button onClick={() => tapConfirm('clear-ing', () => setIngredients([]))} style={{fontSize:13,color:'#ef4444',fontWeight:600,background:'none',border:'none',cursor:'pointer'}}>{confirmId === 'clear-ing' ? 'Tap to confirm' : 'Clear all'}</button>
                )}
              </div>
              {ingredients.length > 0 ? (
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {ingredients.map((ing, i) => (
                    <div key={i} style={{...frow,gap:6,padding:'8px 10px 8px 14px',borderRadius:20,fontSize:15,fontWeight:500,background: darkMode ? 'rgba(52,211,153,0.1)' : 'rgba(22,163,74,0.06)',color: darkMode ? '#6EE7B7' : '#15803d',border:`1px solid ${darkMode ? 'rgba(52,211,153,0.15)' : 'rgba(22,163,74,0.12)'}`}}>
                      <span>{ing}</span>
                      <button onClick={() => removeIngredient(i)}
                        style={{width:22,height:22,borderRadius:11,...fc,background: darkMode ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)',cursor:'pointer',border:'none',transition:'background 0.15s'}}>
                        <X style={{width:12,height:12,color:'#ef4444'}} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{textAlign:'center',padding:'24px 0'}}>
                  <p style={{fontSize:13,...t.textMuted}}>No ingredients yet. Add some above or re-scan your photos.</p>
                </div>
              )}
            </div>
            {/* Actions */}
            <div style={{...fcol,gap:10}}>
              <button onClick={generateRecipes} disabled={ingredients.length === 0 || streamingRecipes}
                className="card-hover"
                style={{width:'100%',borderRadius:R.card,padding:'18px 20px',fontSize:16,fontWeight:700,...fc,gap:10,cursor: (ingredients.length === 0 || streamingRecipes) ? 'not-allowed' : 'pointer',border:'none',
                  background: (ingredients.length === 0 || streamingRecipes) ? (darkMode ? '#1A1F2B' : '#E5E7EB') : (darkMode ? 'linear-gradient(135deg, #BEFF46, #9CDD20)' : 'linear-gradient(135deg, #ef4444, #f97316)'),
                  color: (ingredients.length === 0 || streamingRecipes) ? (inactiveCol) : (darkMode ? '#0C0F14' : 'white'),
                  boxShadow: (ingredients.length > 0 && !streamingRecipes) ? (darkMode ? '0 4px 20px rgba(190,255,70,0.2)' : '0 4px 20px rgba(239,68,68,0.25)') : 'none'}}>
                {streamingRecipes ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><SnapChefIcon className="w-5 h-5" /> Find Recipes ({ingredients.length})</>}
              </button>
              <button onClick={() => nav(images.length > 0 ? 'capture' : 'home')}
                style={{width:'100%',borderRadius:R.card,padding:'14px 20px',fontSize:15,fontWeight:600,cursor:'pointer',border:'none',
                  background: mutedBg,...t.text}}>
                {images.length > 0 ? '← Re-scan Photos' : '← Back to Home'}
              </button>
            </div>
          </div>
        )}

        {/* ==================== RESULTS ==================== */}
        {step === 'results' && !selectedRecipe && (
          <div className="screen-enter" style={{...fcol,gap:20}}>
            {/* Compact photo + ingredient summary */}
            {(images.length > 0 || ingredients.length > 0) && (
              <div className={`${cardClass} border`} style={{borderRadius:R.card,padding:16,...t.card}}>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  {images.length > 0 && (
                    <div onClick={() => { setFullImageIndex(0); setShowFullImage(true); }}
                      style={{width:56,height:56,borderRadius:12,overflow:'hidden',flexShrink:0,cursor:'pointer',border:`2px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#E5E7EB'}`}}>
                      <img src={images[0].src} alt="Scan" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    </div>
                  )}
                  <div style={{flex:1,minWidth:0}}>
                    <p className="font-semibold" style={{fontSize:15,...t.text}}>{ingredients.length} ingredients scanned</p>
                    <p style={{fontSize:13,marginTop:2,...t.textMuted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ingredients.slice(0, 5).join(', ')}{ingredients.length > 5 ? ` +${ingredients.length - 5} more` : ''}</p>
                  </div>
                  <button onClick={() => nav('review')} style={{fontSize:13,fontWeight:600,color: t.accent,background:'none',border:'none',cursor:'pointer',flexShrink:0}}>Edit</button>
                </div>
              </div>
            )}
            {/* Results header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <h3 className="font-bold" style={{fontSize:22,letterSpacing:'-0.3px',...t.text}}>Recipe Ideas</h3>
                <p style={{fontSize:13,marginTop:2,...t.textMuted}}>
                  {streamingRecipes ? (recipes.length > 0 ? `${recipes.length} found, finding more...` : 'Generating recipes...') : `${recipes.length} recipes found for you`}
                </p>
              </div>
              <div style={{...frow,gap:8}}>
                {streamingRecipes && <Loader2 className="w-4 h-4 animate-spin" style={{color: t.accent}} />}
                {!streamingRecipes && recipes.length > 0 && (
                  <button onClick={regenerateRecipes} title="Get new recipes"
                    style={{...frow,gap:6,height:38,padding:'0 14px',borderRadius:10,background: darkMode ? 'rgba(190,255,70,0.08)' : 'rgba(239,68,68,0.06)',border:`1px solid ${borderCol}`,cursor:'pointer'}}>
                    <RefreshCw style={{width:14,height:14,color: t.accent}} />
                    <span style={{fontSize:13,fontWeight:700,color: t.accent}}>New</span>
                  </button>
                )}
                <select value={recipeSort} onChange={(e) => setRecipeSort(e.target.value)}
                  aria-label="Sort recipes"
                  style={{height:38,borderRadius:10,padding:'0 10px',fontSize:13,fontWeight:600,background: mutedBg,border:`1px solid ${borderCol}`,cursor:'pointer',appearance:'auto',...t.text}}>
                  <option value="default">Default</option>
                  <option value="time">Quickest</option>
                  <option value="difficulty">Easiest</option>
                  <option value="match">Best match</option>
                </select>
                <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
                  style={{width:38,height:38,borderRadius:10,...fc,background: mutedBg,border:`1px solid ${borderCol}`,cursor:'pointer'}}>
                  {viewMode === 'grid' ? <List style={{width:18,height:18,...t.textMuted}} /> : <Grid style={{width:18,height:18,...t.textMuted}} />}
                </button>
              </div>
            </div>
            {/* Loading skeleton while waiting for first recipe */}
            {recipes.length === 0 && streamingRecipes && (
              <div style={viewMode === 'grid' ? {display:'grid',gridTemplateColumns:'1fr 1fr',gap:12} : {...fcol,gap:10}}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{border:`1px solid ${borderCol}`,borderRadius:R.card,overflow:'hidden',background: cardBg,animation:`fadeUp 0.3s ease-out ${i * 0.08}s both`}}>
                    <div className="skel" style={{height:72,borderRadius:0}} />
                    <div style={{padding:14,...fcol,gap:8}}>
                      <div className="skel" style={{height:16,width:'80%',borderRadius:6}} />
                      <div className="skel" style={{height:12,width:'60%',borderRadius:6}} />
                      <div style={{display:'flex',gap:6}}>
                        <div className="skel" style={{height:20,width:50,borderRadius:6}} />
                        <div className="skel" style={{height:20,width:40,borderRadius:6}} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* No results state */}
            {recipes.length === 0 && !streamingRecipes && (
              <div style={{...fcol,alignItems:'center',justifyContent:'center',gap:16,padding:'40px 20px',textAlign:'center'}}>
                <div style={{width:72,height:72,borderRadius:18,background: darkMode ? 'rgba(190,255,70,0.06)' : 'rgba(239,68,68,0.04)',...fc}}>
                  <Search style={{width:32,height:32,color: t.accent,opacity:0.5}} />
                </div>
                <p className="font-bold" style={{fontSize:16,...t.text}}>No recipes found</p>
                <p style={{fontSize:13,maxWidth:260,...t.textMuted}}>Try different ingredients or a broader search term</p>
                <button onClick={() => nav('search')} style={{padding:'10px 24px',borderRadius:12,fontSize:13,fontWeight:700,background: darkMode ? 'rgba(190,255,70,0.08)' : 'rgba(239,68,68,0.06)',color: t.accent,border:'none',cursor:'pointer'}}>Search Again</button>
              </div>
            )}
            {/* Recipe cards */}
            {showPrefNudge && (
              <div style={{borderRadius:14,padding:'14px 16px',marginBottom:4,border:`1.5px solid ${darkMode ? 'rgba(190,255,70,0.15)' : 'rgba(239,68,68,0.12)'}`,
                background: darkMode ? 'rgba(190,255,70,0.04)' : 'rgba(239,68,68,0.03)',display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:24,flexShrink:0}}>🎯</span>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:14,fontWeight:700,...t.text}}>Get better recipes!</p>
                  <p style={{fontSize:12,marginTop:2,...t.textMuted}}>Set dietary preferences & favorite cuisines for tailored results.</p>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  <button onClick={() => setShowPrefNudge(false)} style={{padding:'6px 10px',borderRadius:8,fontSize:12,fontWeight:600,background:'none',border:`1px solid ${borderCol}`,cursor:'pointer',...t.textMuted}}>✕</button>
                  <button onClick={() => { setShowPrefNudge(false); setShowSettings(true); }} style={{padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:700,background: darkMode ? '#BEFF46' : '#EF4444',color: darkMode ? '#0C0F14' : '#FFF',border:'none',cursor:'pointer',whiteSpace:'nowrap'}}>Set up</button>
                </div>
              </div>
            )}
            <div style={viewMode === 'grid' ? {display:'grid',gridTemplateColumns:'1fr 1fr',gap:12} : {...fcol,gap:10}}>
              {sortedRecipes.map((recipe, i) => (
                viewMode === 'grid' ? (
                  <button key={i} onClick={() => getFullRecipe(recipe)} className="card-hover"
                    style={{width:'100%',textAlign:'left',border:`1px solid ${borderCol}`,borderRadius:R.card,padding:0,overflow:'hidden',cursor:'pointer',background: cardBg,animation:`fadeUp 0.35s ease-out ${i * 0.04}s both`,
                      boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.06)',
                      opacity: tappedRecipeId === recipe.name ? 0.6 : 1, transform: tappedRecipeId === recipe.name ? 'scale(0.97)' : 'none', transition:'opacity 0.2s, transform 0.2s'}}>
                    {/* Recipe visual header */}
                    {renderRecipeImage(recipe, 400, 96, {height:96})}
                    <div style={{padding:'16px 14px 14px'}}>
                      <div style={{display:'flex',alignItems:'start',justifyContent:'space-between',gap:4,marginBottom:8}}>
                        <h4 className="font-bold" style={{fontSize:15,lineHeight:1.3,...t.text,flex:1}}>{recipe.name}</h4>
                        <button onClick={(e) => { e.stopPropagation(); toggleSaveRecipe(recipe); }} style={{padding:2,background:'none',border:'none',cursor:'pointer',flexShrink:0}}>
                          <Heart style={{width:18,height:18,color: isRecipeSaved(recipe) ? '#f43f5e' : (darkMode ? '#4A5060' : '#D1D5DB'),fill: isRecipeSaved(recipe) ? '#f43f5e' : 'none'}} />
                        </button>
                      </div>
                      <p style={{fontSize:13,lineHeight:1.4,...t.textMuted,marginBottom:12,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{recipe.description}</p>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        <span style={{...frow,gap:4,fontSize:11,fontWeight:600,padding:'4px 8px',borderRadius:8,background: darkMode ? 'rgba(255,255,255,0.04)' : '#F3F4F6',...t.textMuted}}>
                          <Clock style={{width:12,height:12}} /> {recipe.cookTime}
                        </span>
                        <span style={{fontSize:11,fontWeight:600,padding:'4px 8px',borderRadius:8,background: darkMode ? 'rgba(255,140,66,0.1)' : 'rgba(234,88,12,0.06)',color: darkMode ? '#FF8C42' : '#ea580c'}}>{recipe.difficulty}</span>
                        {recipe.costTier && (
                          <span style={{fontSize:11,fontWeight:600,padding:'4px 8px',borderRadius:8,background: darkMode ? 'rgba(52,211,153,0.08)' : 'rgba(22,163,74,0.05)',color: darkMode ? '#6EE7B7' : '#15803d'}}>
                            {recipe.costTier === 'budget' ? '💰' : recipe.costTier === 'moderate' ? '💰💰' : '💰💰💰'}
                          </span>
                        )}
                        {pantryItems.length > 0 && recipe.ingredients && (() => { const m = getPantryMatchPercent(recipe); return m > 0 ? (
                          <span style={{fontSize:11,fontWeight:600,padding:'4px 8px',borderRadius:8,background: m >= 80 ? (darkMode ? 'rgba(52,211,153,0.1)' : 'rgba(22,163,74,0.06)') : (darkMode ? 'rgba(255,255,255,0.04)' : '#F3F4F6'),color: m >= 80 ? (darkMode ? '#34D399' : '#16a34a') : (darkMode ? '#9CA3AF' : '#6B7280')}}>{m}%</span>
                        ) : null; })()}
                        {allergens.length > 0 && getAllergenWarnings(recipe).length > 0 && (
                          <span style={{fontSize:11,fontWeight:600,padding:'4px 8px',borderRadius:8,background: darkMode ? 'rgba(239,68,68,0.1)' : '#FEF2F2',color: darkMode ? '#FCA5A5' : '#B91C1C'}}>⚠️</span>
                        )}
                      </div>
                    </div>
                  </button>
                ) : (
                  <button key={i} onClick={() => getFullRecipe(recipe)} className="card-hover"
                    style={{width:'100%',textAlign:'left',...frow,gap:14,padding:'14px 16px',borderRadius:R.card,border:`1px solid ${borderCol}`,cursor:'pointer',background: cardBg,animation:`fadeUp 0.35s ease-out ${i * 0.04}s both`,
                      opacity: tappedRecipeId === recipe.name ? 0.6 : 1, transform: tappedRecipeId === recipe.name ? 'scale(0.98)' : 'none', transition:'opacity 0.2s, transform 0.2s'}}>
                    {renderRecipeImage(recipe, 88, 44, {width:44,height:44,borderRadius:R.inner,flexShrink:0})}
                    <div style={{flex:1,minWidth:0}}>
                      <h4 className="font-bold" style={{fontSize:15,...t.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{recipe.name}</h4>
                      <div style={{...frow,gap:10,marginTop:4}}>
                        <span style={{...frow,gap:3,fontSize:13,...t.textMuted}}><Clock style={{width:12,height:12}} /> {recipe.cookTime}</span>
                        <span style={{fontSize:13,fontWeight:600,color: darkMode ? '#FF8C42' : '#ea580c'}}>{recipe.difficulty}</span>
                        {recipe.costTier && (
                          <span style={{fontSize:12}}>
                            {recipe.costTier === 'budget' ? '💰' : recipe.costTier === 'moderate' ? '💰💰' : '💰💰💰'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleSaveRecipe(recipe); }} style={{padding:6,background:'none',border:'none',cursor:'pointer',flexShrink:0}}>
                      <Heart style={{width:20,height:20,color: isRecipeSaved(recipe) ? '#f43f5e' : (darkMode ? '#4A5060' : '#D1D5DB'),fill: isRecipeSaved(recipe) ? '#f43f5e' : 'none'}} />
                    </button>
                  </button>
                )
              ))}
            </div>
          </div>
        )}

        {/* ==================== RECIPE DETAIL ==================== */}
        {selectedRecipe && !cookMode && (
          <div className="fade-up" style={{...fcol,gap:16}}>
            {/* Hero card */}
            <div className={`${cardClass} border`} style={{borderRadius:20,overflow:'hidden',...t.card,boxShadow: darkMode ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 20px rgba(0,0,0,0.06)'}}>
              {/* Recipe photo hero */}
              {renderRecipeImage(selectedRecipe, 600, 180, {height:180})}
              <div style={{padding:'24px 22px 20px'}}>
                <div style={{display:'flex',alignItems:'start',justifyContent:'space-between',gap:8,marginBottom:10}}>
                  <h2 className="font-extrabold" style={{fontSize:22,letterSpacing:'-0.4px',lineHeight:1.25,...t.text,flex:1}}>{selectedRecipe.name}</h2>
                  <button onClick={() => toggleSaveRecipe(selectedRecipe)} aria-label="Save recipe" style={{padding:6,background: darkMode ? 'rgba(255,255,255,0.04)' : '#F3F4F6',borderRadius:10,border:'none',cursor:'pointer',flexShrink:0}}>
                    <Heart style={{width:22,height:22,color: isRecipeSaved(selectedRecipe) ? '#f43f5e' : (darkMode ? '#4A5060' : '#D1D5DB'),fill: isRecipeSaved(selectedRecipe) ? '#f43f5e' : 'none'}} />
                  </button>
                </div>
                <p style={{fontSize:15,lineHeight:1.5,...t.textMuted,marginBottom:16}}>{selectedRecipe.description}</p>
                {/* Meta badges row */}
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}}>
                  <span style={{...frow,gap:5,fontSize:13,fontWeight:600,padding:'6px 12px',borderRadius:10,background: darkMode ? 'rgba(255,255,255,0.04)' : '#F3F4F6',...t.text}}>
                    <Clock style={{width:14,height:14,...t.textMuted}} /> {selectedRecipe.cookTime}
                  </span>
                  <span style={{fontSize:13,fontWeight:600,padding:'6px 12px',borderRadius:10,background: darkMode ? 'rgba(255,140,66,0.1)' : 'rgba(234,88,12,0.06)',color: darkMode ? '#FF8C42' : '#ea580c'}}>{selectedRecipe.difficulty}</span>
                  {selectedRecipe.cuisine && (
                    <span style={{fontSize:13,fontWeight:600,padding:'6px 12px',borderRadius:10,background: darkMode ? 'rgba(176,124,255,0.1)' : 'rgba(124,58,237,0.06)',color: darkMode ? '#B07CFF' : '#7c3aed'}}>{selectedRecipe.cuisine}</span>
                  )}
                </div>
                {/* Star rating */}
                <div style={{...frow,gap:2,marginBottom:18}}>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button key={rating} onClick={() => saveRecipeRating(selectedRecipe.name, rating)} style={{padding:2,background:'none',border:'none',cursor:'pointer'}}>
                      <Star style={{width:24,height:24,color: recipeRatings[selectedRecipe.name] >= rating ? '#f59e0b' : (darkMode ? '#2A2D35' : '#E5E7EB'),fill: recipeRatings[selectedRecipe.name] >= rating ? '#f59e0b' : 'none'}} />
                    </button>
                  ))}
                  {recipeRatings[selectedRecipe.name] && <span style={{fontSize:13,marginLeft:6,...t.textMuted}}>Your rating</span>}
                </div>
                {/* Servings control */}
                <div style={{...frow,gap:12,padding:'12px 16px',borderRadius:12,background: subtleBg,border:`1px solid ${darkMode ? 'rgba(255,255,255,0.04)' : '#F3F4F6'}`}}>
                  <span style={{fontSize:13,fontWeight:600,...t.text,flex:1}}>Servings</span>
                  <button aria-label="Decrease servings" onClick={() => { const n = Math.max(1, servings - 1); setServings(n); savePreferredServings(selectedRecipe.name, n); }}
                    style={{width:34,height:34,borderRadius:10,...fc,border:`1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,background:'none',cursor:'pointer'}}>
                    <Minus style={{width:16,height:16,...t.textMuted}} />
                  </button>
                  <span className="font-bold" style={{fontSize:18,width:28,textAlign:'center',...t.text}}>{servings}</span>
                  <button aria-label="Increase servings" onClick={() => { const n = servings + 1; setServings(n); savePreferredServings(selectedRecipe.name, n); }}
                    style={{width:34,height:34,borderRadius:10,...fc,border:`1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,background:'none',cursor:'pointer'}}>
                    <Plus style={{width:16,height:16,...t.textMuted}} />
                  </button>
                </div>
              </div>
            </div>
            {/* Allergen warnings */}
            {getAllergenWarnings(selectedRecipe).length > 0 && (
              <div style={{display:'flex',alignItems:'start',gap:12,padding:'14px 16px',borderRadius:R.card,background: darkMode ? 'rgba(239,68,68,0.06)' : '#FEF2F2',border:`1px solid ${darkMode ? 'rgba(239,68,68,0.12)' : '#FECACA'}`}}>
                <AlertCircle style={{width:18,height:18,color:'#ef4444',flexShrink:0,marginTop:1}} />
                <div>
                  <span className="font-bold" style={{fontSize:13,color: darkMode ? '#FCA5A5' : '#B91C1C'}}>Allergen Warning</span>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6}}>
                    {getAllergenWarnings(selectedRecipe).map(w => (
                      <span key={w.allergen} style={{fontSize:11,fontWeight:600,padding:'3px 8px',borderRadius:6,background: darkMode ? 'rgba(239,68,68,0.1)' : '#FEE2E2',color: darkMode ? '#FCA5A5' : '#991B1B'}}>{w.allergen}: {w.triggers.join(', ')}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Budget estimate */}
            {(() => {
              const tier = selectedRecipe.costTier;
              if (!tier) return null;
              const t3 = tier.toLowerCase();
              const emoji = t3.includes('budget') ? '💰' : t3.includes('moderate') ? '💰💰' : '💰💰💰';
              const label = t3.includes('budget') ? 'Budget-friendly' : t3.includes('moderate') ? 'Moderate' : 'Pricey';
              const col = t3.includes('budget') ? (darkMode ? '#34D399' : '#16a34a') : t3.includes('moderate') ? (darkMode ? '#FACC15' : '#D97706') : (darkMode ? '#FF8C42' : '#ea580c');
              return (
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',borderRadius:R.card,background: subtleBg,border:`1px solid ${darkMode ? 'rgba(255,255,255,0.04)' : '#F3F4F6'}`,animation:'fadeUp 0.3s ease-out both'}}>
                <span style={{fontSize:13,...t.textMuted}}>Cost estimate</span>
                <span style={{fontSize:14,fontWeight:700,color:col}}>{emoji} {label}</span>
              </div>
            ); })()}
            {/* Primary action — Start Cooking */}
            <button onClick={() => startCookMode(selectedRecipe)} className="card-hover"
              disabled={selectedRecipe.loading || !selectedRecipe.instructions?.length}
              style={{width:'100%',borderRadius:R.card,padding:'18px 20px',fontSize:16,fontWeight:700,...fc,gap:10,cursor: (selectedRecipe.loading || !selectedRecipe.instructions?.length) ? 'not-allowed' : 'pointer',border:'none',
                background: (selectedRecipe.loading || !selectedRecipe.instructions?.length) ? (darkMode ? 'rgba(255,255,255,0.06)' : '#E5E7EB') : gradientBtn,
                color: (selectedRecipe.loading || !selectedRecipe.instructions?.length) ? (darkMode ? '#4A5060' : '#9CA3AF') : gradientBtnCol,
                boxShadow: (selectedRecipe.loading || !selectedRecipe.instructions?.length) ? 'none' : gradientShadow}}>
              <Play style={{width:20,height:20}} /> {selectedRecipe.loading ? 'Loading...' : !selectedRecipe.instructions?.length ? 'Loading recipe...' : 'Start CookAlong'}
            </button>
            {/* Secondary actions — compact 2-column */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {selectedRecipe.ingredients && (
                <button onClick={() => { pantryItems.length > 0 ? addMissingToShoppingList(selectedRecipe) : addToShoppingList(selectedRecipe.ingredients); }} className="card-hover"
                  style={{padding:'12px 14px',borderRadius:12,fontSize:13,fontWeight:600,...fc,gap:6,cursor:'pointer',border:`1px solid ${borderCol}`,background: cardBg,...t.text}}>
                  <ShoppingCart style={{width:14,height:14}} /> {pantryItems.length > 0 ? 'Add Missing' : 'Add to Shopping'}
                </button>
              )}
              {selectedRecipe.nutrition && (() => {
                const today = new Date().toISOString().split('T')[0];
                const logged = (foodLog[today] || []).find(e => e.name && e.name.startsWith(selectedRecipe.name));
                return (
                  <button onClick={() => {
                    if (logged) {
                      // Unlog
                      const newLog = { ...foodLog };
                      newLog[today] = (newLog[today] || []).filter(e => e.id !== logged.id);
                      setFoodLog(newLog);
                      saveToStorage('food-log', newLog);
                      showToast('Calories removed');
                    } else {
                      // Log
                      const scale = originalServings ? servings / originalServings : 1;
                      addFoodEntry({
                        name: selectedRecipe.name + (servings !== originalServings ? ` (${servings} servings)` : ''),
                        calories: Math.round((parseInt(selectedRecipe.nutrition.calories) || 0) * scale),
                        protein: Math.round((parseInt(selectedRecipe.nutrition.protein) || 0) * scale),
                        carbs: Math.round((parseInt(selectedRecipe.nutrition.carbs) || 0) * scale),
                        fat: Math.round((parseInt(selectedRecipe.nutrition.fat) || 0) * scale)
                      });
                    }
                  }} className="card-hover"
                    style={{padding:'12px 14px',borderRadius:12,fontSize:13,fontWeight:600,...fc,gap:6,cursor:'pointer',
                      border: logged ? '1px solid rgba(234,179,8,0.4)' : `1px solid ${borderCol}`,
                      background: logged ? (darkMode ? 'rgba(234,179,8,0.1)' : 'rgba(234,179,8,0.08)') : cardBg,
                      ...t.text,
                      color: logged ? '#EAB308' : (darkMode ? '#F9FAFB' : '#111827'),
                      transition: 'all 0.3s ease'}}>
                    <Star style={{width:14,height:14,
                      fill: logged ? '#EAB308' : 'none',
                      color: logged ? '#EAB308' : (darkMode ? '#F9FAFB' : '#111827'),
                      transition: 'all 0.3s ease',
                      animation: logged ? 'starPop 0.4s ease' : 'none'}} />
                    {logged ? 'Logged ✓' : 'Log Calories'}
                  </button>
                );
              })()}
              <button onClick={() => generateShareCard(selectedRecipe)} className="card-hover"
                style={{padding:'12px 14px',borderRadius:12,fontSize:13,fontWeight:600,...fc,gap:6,cursor:'pointer',border:`1px solid ${borderCol}`,background: cardBg,...t.text}}>
                <Upload style={{width:14,height:14}} /> Share
              </button>
              <button onClick={() => {
                const r = selectedRecipe;
                const text = `🍳 ${r.name}\n⏱ ${r.cookTime} · 👨‍🍳 ${r.difficulty} · 🍽 ${r.servings} servings\n\n📝 Ingredients:\n${(r.ingredients || []).map(i => `• ${typeof i === 'string' ? i : `${i.amount || ''} ${i.unit || ''} ${i.name || ''}`.trim()}`).join('\n')}\n\n👩‍🍳 Steps:\n${(r.instructions || []).map((s, i) => `${i+1}. ${s}`).join('\n')}\n\nShared from Snap Chef`;
                navigator.clipboard?.writeText(text).then(() => showToast('Recipe copied!')).catch(() => showToast('Copy failed', 'error'));
              }} className="card-hover"
                style={{padding:'12px 14px',borderRadius:12,fontSize:13,fontWeight:600,...fc,gap:6,cursor:'pointer',border:`1px solid ${borderCol}`,background: cardBg,...t.text}}>
                <List style={{width:14,height:14}} /> Copy Text
              </button>
            </div>
            <button onClick={() => cacheRecipe(selectedRecipe)} className="card-hover"
              style={{width:'100%',padding:'12px 14px',borderRadius:12,fontSize:13,fontWeight:600,...fc,gap:6,cursor:'pointer',border:`1px solid ${borderCol}`,background: cardBg,...t.text}}>
              <Package style={{width:14,height:14}} /> {cachedRecipes[selectedRecipe.name] ? '✓ Saved Offline' : 'Save Offline'}
            </button>
            {selectedRecipe.loading ? (
              <div className="space-y-5 py-4">
                <div className={`${cardClass} border rounded-2xl p-6 shadow-sm`}>
                  <Skeleton className="h-5 w-40 mb-4" />
                  <div className="grid grid-cols-4 gap-4">
                    {[0,1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
                  </div>
                </div>
                <div className={`${cardClass} border rounded-2xl p-6 shadow-sm`}>
                  <Skeleton className="h-5 w-32 mb-4" />
                  {[0,1,2,3,4].map(i => <Skeleton key={i} className="h-4 w-full mb-2" />)}
                </div>
                <div className={`${cardClass} border rounded-2xl p-6 shadow-sm`}>
                  <Skeleton className="h-5 w-36 mb-4" />
                  {[0,1,2].map(i => <div key={i} className="flex gap-3 mb-3"><Skeleton className="h-7 w-7 rounded-lg flex-shrink-0" /><Skeleton className="h-12 flex-1 rounded-lg" /></div>)}
                </div>
              </div>
            ) : (
              <>
                {/* Nutrition */}
                {selectedRecipe.nutrition ? (
                  <div className={`${cardClass} border`} style={{borderRadius:R.card,padding:'22px 20px',...t.card,animation:'fadeUp 0.3s ease-out both'}}>
                    <h3 className="font-bold" style={{fontSize:16,marginBottom:14,...t.text}}>Nutrition <span style={{fontWeight:400,...t.textMuted,fontSize:13}}>(per serving)</span></h3>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10}}>
                      {[['calories', 'Cal', '#ef4444', '#f97316'], ['protein', 'Protein', '#3b82f6', '#06b6d4'], ['carbs', 'Carbs', '#10b981', '#14b8a6'], ['fat', 'Fat', '#8b5cf6', '#a855f7']].map(([key, label, c1, c2]) => (
                        <div key={key} style={{textAlign:'center',padding:'14px 8px',borderRadius:12,background: subtleBg}}>
                          <div className="font-extrabold" style={{fontSize:22,background:`linear-gradient(135deg, ${c1}, ${c2})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{(() => {
                            const raw = selectedRecipe.nutrition[key];
                            const num = parseFloat(raw);
                            if (isNaN(num) || !originalServings) return raw;
                            const scaled = Math.round(num * (servings / originalServings));
                            const unit = String(raw).replace(/[\d.]/g, '').trim();
                            return scaled + unit;
                          })()}</div>
                          <div style={{fontSize:11,fontWeight:500,marginTop:4,...t.textMuted}}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className={`${cardClass} border`} style={{borderRadius:R.card,padding:'22px 20px',...t.card}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                    <h3 className="font-bold" style={{fontSize:16,...t.text}}>Ingredients</h3>
                    <button onClick={() => addToShoppingList(selectedRecipe.ingredients)} style={{...frow,gap:5,fontSize:13,fontWeight:600,color: t.accent,background:'none',border:'none',cursor:'pointer'}}>
                      <ShoppingCart style={{width:14,height:14}} /> Add to list
                    </button>
                  </div>
                  <div style={{...fcol,gap:10}}>
                    {selectedRecipe.ingredients?.map((ing, i) => (
                      <div key={i} style={{display:'flex',alignItems:'baseline',gap:10}}>
                        <div style={{width:6,height:6,borderRadius:3,background: t.accent,flexShrink:0,marginTop:7}} />
                        {editingIngredient?.index === i ? (
                          <div style={{display:'flex',gap:6,flex:1}}>
                            <input value={editingIngredient.amount} onChange={(e) => setEditingIngredient(prev => ({...prev, amount: e.target.value}))}
                              style={{width:80,padding:'4px 8px',borderRadius:6,fontSize:13,fontWeight:700,border:`1px solid ${t.accent}`,background: cardBg,color: t.accent,...t.text}}
                              autoFocus />
                            <input value={editingIngredient.item} onChange={(e) => setEditingIngredient(prev => ({...prev, item: e.target.value}))}
                              style={{flex:1,padding:'4px 8px',borderRadius:6,fontSize:13,border:`1px solid ${borderCol}`,background: cardBg,...t.text}} />
                            <button onClick={() => {
                              const updated = [...selectedRecipe.ingredients];
                              updated[i] = { ...updated[i], amount: editingIngredient.amount, item: editingIngredient.item };
                              setSelectedRecipe(prev => ({...prev, ingredients: updated}));
                              setEditingIngredient(null);
                            }} style={{padding:'4px 10px',borderRadius:6,fontSize:13,fontWeight:700,background: t.accent,color: darkMode ? '#0C0F14' : '#FFF',border:'none',cursor:'pointer'}}>✓</button>
                          </div>
                        ) : (
                          <button onClick={() => setEditingIngredient({ index: i, amount: ing.amount || '', item: ing.item || '' })}
                            style={{background:'none',border:'none',cursor:'pointer',textAlign:'left',padding:0,fontSize:15,lineHeight:1.5,...t.text}}>
                            <strong style={{color: t.accent}}>{convertToMetric(scaleIngredient(ing, originalServings, servings))}</strong> {ing.item}
                          </button>
                        )}
                      </div>
                    ))}
                    <p style={{fontSize:11,marginTop:4,...t.textMuted,opacity:0.5}}>Tap any ingredient to edit</p>
                  </div>
                </div>
                <div className={`${cardClass} border`} style={{borderRadius:R.card,padding:'22px 20px',...t.card}}>
                  <h3 className="font-bold" style={{fontSize:16,marginBottom:16,...t.text}}>Instructions</h3>
                  <div style={{...fcol,gap:18}}>
                    {selectedRecipe.instructions?.map((stepText, i) => (
                      <div key={i} style={{display:'flex',gap:14}}>
                        <div style={{width:30,height:30,borderRadius:10,background: darkMode ? 'linear-gradient(135deg, rgba(190,255,70,0.15), rgba(92,164,255,0.15))' : 'linear-gradient(135deg, #ef4444, #f97316)',...fc,flexShrink:0}}>
                          <span style={{fontSize:13,fontWeight:700,color: darkMode ? '#BEFF46' : 'white'}}>{i + 1}</span>
                        </div>
                        <p style={{fontSize:15,lineHeight:1.6,paddingTop:4,...t.text}}>{stepText}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Substitutions */}
                {selectedRecipe.substitutions && Object.keys(selectedRecipe.substitutions).length > 0 ? (
                  <div className={`${cardClass} border rounded-2xl p-6 shadow-sm`} style={{animation:'fadeUp 0.3s ease-out both'}}>
                    <h3 className={`font-bold text-lg ${textClass} mb-4`}>Substitutions</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedRecipe.substitutions).map(([ingredient, substitute], i) => (
                        <div key={i} className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                          <span className={textClass}>{ingredient}</span><span>→</span>
                          <span className={darkMode ? 'text-green-400' : 'text-green-600'}>{substitute}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Tips */}
                {selectedRecipe.tips && selectedRecipe.tips.length > 0 ? (
                  <div className={`${darkMode ? 'bg-amber-900/20 border-amber-800/50' : 'bg-amber-50 border-amber-200'} border rounded-2xl p-5`} style={{animation:'fadeUp 0.3s ease-out both'}}>
                    <p className={`font-bold text-sm mb-3 ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>Chef's Tips</p>
                    <ul className="space-y-2">
                      {selectedRecipe.tips.map((tip, i) => (
                        <li key={i} className={`text-sm flex items-start gap-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                          <span className="mt-1">💡</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Drink Pairing */}
                <div className={`${cardClass} border rounded-2xl p-5 shadow-sm`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-bold ${textClass}`}>Drink Pairings</h3>
                    {!selectedRecipe.pairings && (
                      <button onClick={() => getDrinkPairing(selectedRecipe)} className="text-sm text-orange-500 font-semibold flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M6 2l.01 6L10 12l-3.99 4-.01 6h12l-.01-6L14 12l3.99-4L18 2H6zm10 14.5V20H8v-3.5l4-4 4 4z"/></svg>
                        Suggest
                      </button>
                    )}
                  </div>
                  {selectedRecipe.pairings ? (
                    <div className="space-y-2">
                      {selectedRecipe.pairings.map((p, i) => (
                        <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <span className="text-lg">{p.type === 'wine' ? '🍷' : p.type === 'beer' ? '🍺' : p.type === 'cocktail' ? '🍸' : '🥤'}</span>
                          <div>
                            <p className={`font-semibold text-sm ${textClass}`}>{p.drink}</p>
                            <p className={`text-xs ${textMutedClass}`}>{p.why}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${textMutedClass}`}>Tap "Suggest" to get drink pairing recommendations.</p>
                  )}
                </div>
                <div className={`${cardClass} border rounded-2xl p-5 shadow-sm`}>
                  <h3 className={`font-semibold ${textClass} mb-3`}>My Notes</h3>
                  <textarea
                    value={recipeNotes[selectedRecipe.name] || ''}
                    onChange={(e) => saveRecipeNote(selectedRecipe.name, e.target.value)}
                    placeholder="Add your own tips, modifications, or notes..."
                    className={`w-full px-4 py-3 rounded-xl border ${inputClass} text-sm`}
                    rows="3"
                  />
                </div>
                {/* YouTube Video Guides */}
                <div className={`${cardClass} border rounded-2xl p-5 shadow-sm`}>
                  <div style={{...frow,gap:8,marginBottom:14}}>
                    <div style={{width:32,height:32,borderRadius:8,background:'#FF0000',...fc}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </div>
                    <h3 className={`font-bold ${textClass}`}>Video Guides</h3>
                  </div>
                  <div style={{...fcol,gap:8}}>
                    {[['👨‍🍳', `How to make ${selectedRecipe.name}`, `how to make ${selectedRecipe.name} recipe`],
                      ['💡', `${selectedRecipe.name} tips & tricks`, `${selectedRecipe.name} cooking tips tricks`],
                      ['🎓', `Easy ${selectedRecipe.cuisine || ''} cooking`, `easy ${selectedRecipe.cuisine || selectedRecipe.name} cooking tutorial beginner`]
                    ].map(([emoji, label, query], i) => (
                      <a key={i} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer"
                        style={{...frow,gap:12,padding:'12px 14px',borderRadius:12,border:`1px solid ${borderCol}`,background: subtleBg,textDecoration:'none',cursor:'pointer'}}>
                        <span style={{fontSize:22}}>{emoji}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:13,fontWeight:600,...t.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{label}</p>
                          <p style={{fontSize:11,marginTop:2,color:'#FF0000',fontWeight:500}}>Search on YouTube →</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
            {/* Recipe Remix panel */}
            {!selectedRecipe?.loading && (
              <div className={`${cardClass} border`} style={{borderRadius:R.card,overflow:'hidden',...t.card}}>
                <button onClick={() => { setRemixOpen(!remixOpen); if (!remixOpen) setRemixHistory([]); }}
                  style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px',background:'none',border:'none',cursor:'pointer'}}>
                  <div style={{...frow,gap:10}}>
                    <span style={{fontSize:22}}>✨</span>
                    <div style={{textAlign:'left'}}>
                      <span className="font-bold" style={{fontSize:15,...t.text}}>Recipe Remix</span>
                      <p style={{fontSize:11,marginTop:1,...t.textMuted}}>Make it spicier, swap ingredients, adjust diet</p>
                    </div>
                  </div>
                  <ChevronDown style={{width:18,height:18,...t.textMuted,transform: remixOpen ? 'rotate(180deg)' : 'none',transition:'transform 0.2s'}} />
                </button>
                {remixOpen && (
                  <div style={{padding:'0 18px 18px',borderTop:`1px solid ${darkMode ? 'rgba(255,255,255,0.04)' : '#F3F4F6'}`}}>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6,paddingTop:14,paddingBottom:12}}>
                      {['Make it spicier', 'Add more protein', 'Make it kid-friendly'].map(suggestion => (
                        <button key={suggestion} onClick={() => { setRemixInput(suggestion); }}
                          style={{fontSize:11,fontWeight:500,padding:'5px 10px',borderRadius:8,cursor:'pointer',border:`1px solid ${borderCol}`,background: subtleBg,...t.textMuted}}>
                          {suggestion}
                        </button>
                      ))}
                    </div>
                    {remixHistory.length > 0 && (
                      <div style={{maxHeight:200,overflowY:'auto',...fcol,gap:8,marginBottom:12}}>
                        {remixHistory.map((msg, i) => (
                          <div key={i} style={{display:'flex',justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'}}>
                            <div style={{maxWidth:'80%',padding:'8px 12px',borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',fontSize:13,lineHeight:1.4,
                              background: msg.role === 'user' ? (darkMode ? 'rgba(190,255,70,0.12)' : 'rgba(239,68,68,0.08)') : (darkMode ? 'rgba(255,255,255,0.04)' : '#F3F4F6'),
                              color: msg.role === 'user' ? t.accent : (darkMode ? '#D1D5DB' : '#374151')}}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        {remixLoading && (
                          <div style={{display:'flex',justifyContent:'flex-start'}}>
                            <div style={{padding:'8px 12px',borderRadius:'12px 12px 12px 4px',fontSize:13,background: darkMode ? 'rgba(255,255,255,0.04)' : '#F3F4F6',...t.textMuted}}>
                              Remixing<span className="animate-pulse">...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{display:'flex',gap:8}}>
                      <input value={remixInput} onChange={(e) => setRemixInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') sendRemix(); }}
                        placeholder="e.g. Make it gluten-free..."
                        className={`border ${inputClass}`}
                        style={{flex:1,padding:'12px 14px',borderRadius:10,fontSize:13}} />
                      <button onClick={sendRemix} disabled={!remixInput.trim() || remixLoading}
                        style={{padding:'12px 16px',borderRadius:10,fontSize:13,fontWeight:700,cursor: !remixInput.trim() || remixLoading ? 'not-allowed' : 'pointer',border:'none',
                          background: !remixInput.trim() || remixLoading ? (darkMode ? '#1A1F2B' : '#E5E7EB') : (darkMode ? 'linear-gradient(135deg, #BEFF46, #9CDD20)' : 'linear-gradient(135deg, #ef4444, #f97316)'),
                          color: !remixInput.trim() || remixLoading ? (inactiveCol) : (darkMode ? '#0C0F14' : 'white')}}>
                        Remix
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <button onClick={() => { setSelectedRecipe(null); setRemixOpen(false); setRemixHistory([]); }} className={`card-hover w-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} ${textClass} rounded-2xl p-4 font-semibold transition`}>
              ← Back to Recipes
            </button>
          </div>
        )}

        {/* ==================== COOK MODE ==================== */}
        {cookMode && selectedRecipe && !showCookComplete && (
          <div className="screen-enter" style={{...fcol,gap:14,paddingBottom:32}}>
            {/* Guard: no instructions loaded */}
            {(!selectedRecipe.instructions || selectedRecipe.instructions.length === 0) ? (
              <div style={{...fcol,alignItems:'center',justifyContent:'center',gap:16,minHeight:'40vh',textAlign:'center'}}>
                <Loader2 className="animate-spin" style={{width:32,height:32,color: t.accent}} />
                <p style={{fontSize:15,fontWeight:600,...t.text}}>Loading recipe steps...</p>
                <button onClick={exitCookMode} style={{padding:'10px 24px',borderRadius:12,fontSize:13,fontWeight:600,border:`1px solid ${borderCol}`,background: cardBg,cursor:'pointer',...t.text}}>Cancel</button>
              </div>
            ) : (
            <>
            {/* Top bar — recipe name + elapsed time + exit */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
              <div style={{flex:1,minWidth:0}}>
                <h3 className="font-bold" style={{fontSize:16,...t.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{selectedRecipe.name}</h3>
                <div style={{...frow,gap:8,marginTop:3}}>
                  <span style={{fontSize:13,fontFamily:'JetBrains Mono, monospace',fontWeight:600,...t.textMuted}}>{formatTime(cookElapsed)}</span>
                  <span style={{fontSize:11,...t.textMuted}}>elapsed</span>
                </div>
              </div>
              <div style={{display:'flex',gap:6}}>
                <button onClick={startVoiceCookMode} aria-label="Voice commands"
                  className={`transition ${voiceListening ? 'animate-pulse' : ''}`}
                  style={{width:44,height:44,borderRadius:12,...fc,border:'none',cursor:'pointer',
                    background: voiceListening ? '#EF4444' : (darkMode ? 'rgba(190,255,70,0.08)' : '#F3F4F6'),
                    color: voiceListening ? '#FFF' : t.accent}}>
                  {voiceListening ? <span style={{fontSize:16}}>●</span> : <span style={{fontSize:18}}>🎤</span>}
                </button>
                <button onClick={exitCookMode} aria-label="Exit cook mode"
                  style={{width:44,height:44,borderRadius:12,...fc,border:'none',cursor:'pointer',
                    background: darkMode ? 'rgba(255,92,114,0.08)' : 'rgba(239,68,68,0.06)',color:'#FF5C72',fontSize:18,fontWeight:700}}>✕</button>
              </div>
            </div>
            {/* Step dots — tap to jump */}
            <div style={{...frow,gap:4,justifyContent:'center',flexWrap:'wrap'}}>
              {selectedRecipe.instructions?.map((_, i) => (
                <button key={i} onClick={() => setCurrentStep(i)} aria-label={`Go to step ${i+1}`}
                  style={{width: i === currentStep ? 28 : 10,height:10,borderRadius:5,border:'none',cursor:'pointer',transition:'all 0.3s ease',
                    background: i < currentStep ? t.accent : i === currentStep ? `linear-gradient(90deg, ${t.accent}, ${darkMode ? '#9CDD20' : '#f97316'})` : (darkMode ? 'rgba(255,255,255,0.08)' : '#E5E7EB')}}>
                </button>
              ))}
            </div>
            {/* Main instruction card — swipeable */}
            <div className={`${cardClass} border rounded-2xl`} style={{minHeight:280,...fcol,touchAction:'pan-y',position:'relative',overflow:'hidden'}}
              onTouchStart={(e) => { e.currentTarget._touchX = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                const dx = e.changedTouches[0].clientX - (e.currentTarget._touchX || 0);
                if (Math.abs(dx) > 60) {
                  if (dx < 0 && currentStep < (selectedRecipe.instructions?.length || 0) - 1) setCurrentStep(currentStep + 1);
                  if (dx > 0 && currentStep > 0) setCurrentStep(currentStep - 1);
                }
              }}>
              {/* Step badge */}
              <div style={{padding:'20px 24px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{...frow,gap:10}}>
                  <div style={{width:40,height:40,borderRadius:12,...fc,fontSize:18,fontWeight:800,
                    background:`linear-gradient(135deg, ${t.accent}, ${darkMode ? '#9CDD20' : '#f97316'})`,color: darkMode ? '#0C0F14' : '#FFF'}}>{currentStep + 1}</div>
                  <span style={{fontSize:15,fontWeight:600,...t.textMuted}}>of {selectedRecipe.instructions?.length || 0}</span>
                </div>
              </div>
              {/* Instruction text */}
              <div style={{flex:1,...fcol,alignItems:'center',justifyContent:'center',padding:'24px 28px',gap:20}}>
                <p className="leading-relaxed font-medium" style={{fontSize:22,textAlign:'center',maxWidth:480,...t.text}}>{selectedRecipe.instructions?.[currentStep]}</p>
                {/* Start timer CTA — only shows when step has a time and timer isn't running */}
                {detectTimer(selectedRecipe.instructions?.[currentStep]) && (!timers[currentStep] || timers[currentStep] === 0) && (
                  <button onClick={() => startTimer(currentStep, detectTimer(selectedRecipe.instructions[currentStep]).seconds)}
                    style={{...frow,gap:10,padding:'16px 32px',borderRadius:R.card,fontSize:18,fontWeight:700,border:'none',cursor:'pointer',
                      background:`linear-gradient(135deg, ${t.accent}, ${darkMode ? '#9CDD20' : '#f97316'})`,color: darkMode ? '#0C0F14' : '#FFF',
                      boxShadow: gradientShadow}}>
                    <Play style={{width:20,height:20}} /> Start {detectTimer(selectedRecipe.instructions[currentStep]).label} Timer
                  </button>
                )}
              </div>
              {/* Timer area */}
              {timers[currentStep] > 0 && (
                <div style={{padding:'0 24px 24px',...fcol,alignItems:'center',gap:12}}>
                  <div style={{position:'relative',width:120,height:120}}>
                    <svg width="120" height="120" viewBox="0 0 120 120" style={{transform:'rotate(-90deg)'}}>
                      <circle cx="60" cy="60" r="52" fill="none" stroke={darkMode ? 'rgba(255,255,255,0.06)' : '#E5E7EB'} strokeWidth="6" />
                      <circle cx="60" cy="60" r="52" fill="none" stroke={t.accent} strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 52}`} strokeDashoffset={`${2 * Math.PI * 52 * (1 - (timers[currentStep] / ((detectTimer(selectedRecipe.instructions?.[currentStep])?.seconds) || timers[currentStep] || 1)))}`}
                        style={{transition:'stroke-dashoffset 1s linear'}} />
                    </svg>
                    <div style={{position:'absolute',inset:0,...fc}}>
                      <span style={{fontSize:28,fontWeight:800,fontFamily:'JetBrains Mono, monospace',letterSpacing:'-1px',color: t.accent}}>{formatTime(timers[currentStep])}</span>
                    </div>
                  </div>
                  <button onClick={() => activeTimer === currentStep ? pauseTimer() : setActiveTimer(currentStep)}
                    style={{padding:'12px 40px',borderRadius:R.card,fontSize:16,fontWeight:700,border:'none',cursor:'pointer',...frow,gap:8,
                      background: activeTimer === currentStep ? 'rgba(255,92,114,0.1)' : `linear-gradient(135deg, ${t.accent}, ${darkMode ? '#9CDD20' : '#f97316'})`,
                      color: activeTimer === currentStep ? '#FF5C72' : (darkMode ? '#0C0F14' : '#FFF')}}>
                    {activeTimer === currentStep ? <><Pause style={{width:18,height:18}} /> Pause</> : <><Play style={{width:18,height:18}} /> {timers[currentStep] > 0 && activeTimer !== currentStep ? 'Resume' : 'Start'}</>}
                  </button>
                </div>
              )}
              {/* Step-relevant ingredients */}
              {getStepIngredients(selectedRecipe.instructions?.[currentStep], selectedRecipe.ingredients).length > 0 && (
                <div style={{padding:'0 20px 16px',borderTop:`1px solid ${borderCol}`,marginTop:4,paddingTop:12}}>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {getStepIngredients(selectedRecipe.instructions[currentStep], selectedRecipe.ingredients).map((ing, j) => (
                      <span key={j} style={{fontSize:11,fontWeight:600,padding:'5px 10px',borderRadius:8,
                        background: darkMode ? 'rgba(190,255,70,0.06)' : 'rgba(239,68,68,0.04)',color: t.accent}}>
                        {convertToMetric(scaleIngredient(ing, originalServings, servings))} {ing.item || ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Next step peek */}
            {currentStep < (selectedRecipe.instructions?.length || 0) - 1 && (
              <div style={{padding:'12px 16px',borderRadius:R.card,border:`1px solid ${borderCol}`,background: subtleBg,opacity:0.7}}>
                <p style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:4,...t.textMuted}}>Up next</p>
                <p style={{fontSize:13,...t.textMuted,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{selectedRecipe.instructions[currentStep + 1]}</p>
              </div>
            )}
            {/* Navigation buttons */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}
                aria-label="Previous step"
                style={{padding:'24px 16px',borderRadius:R.card,fontSize:18,fontWeight:700,border:'none',cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  background: currentStep === 0 ? (darkMode ? 'rgba(255,255,255,0.02)' : '#F3F4F6') : (darkMode ? 'rgba(255,255,255,0.06)' : '#E5E7EB'),
                  color: currentStep === 0 ? (darkMode ? '#2A2D35' : '#D1D5DB') : (darkMode ? '#E5E7EB' : '#111827')}}>
                ← Back
              </button>
              <button onClick={() => { if (currentStep < (selectedRecipe.instructions?.length || 0) - 1) setCurrentStep(currentStep + 1); else completeCook(); }}
                aria-label={currentStep < (selectedRecipe.instructions?.length || 0) - 1 ? 'Next step' : 'Finish cooking'}
                style={{padding:'24px 16px',borderRadius:R.card,fontSize:18,fontWeight:700,border:'none',cursor:'pointer',
                  background:`linear-gradient(135deg, ${t.accent}, ${darkMode ? '#9CDD20' : '#f97316'})`,color: darkMode ? '#0C0F14' : '#FFF',
                  boxShadow: gradientShadow}}>
                {currentStep < (selectedRecipe.instructions?.length || 0) - 1 ? 'Next →' : '✓ Done!'}
              </button>
            </div>
            {/* Ingredients drawer */}
            <button onClick={() => setShowIngredientPanel(!showIngredientPanel)}
              style={{width:'100%',padding:'14px 18px',borderRadius:R.card,border:`1px solid ${borderCol}`,background: cardBg,cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'space-between',...t.text,fontSize:15,fontWeight:600}}>
              <span>📝 Ingredients ({selectedRecipe.ingredients?.length || 0})</span>
              <span style={{fontSize:13,...t.textMuted}}>{showIngredientPanel ? '▲ Hide' : '▼ Show'}</span>
            </button>
            {showIngredientPanel && (
              <div className={`${cardClass} border rounded-2xl`} style={{padding:'16px 20px'}}>
                <div style={{...fcol,gap:8}}>
                  {selectedRecipe.ingredients?.map((ing, i) => {
                    const key = `${ing.item || ing.name || i}`;
                    const isChecked = checkedIngredients[key];
                    return (
                      <button key={i} onClick={() => setCheckedIngredients(prev => ({...prev, [key]: !prev[key]}))}
                        style={{...frow,gap:10,padding:'8px 0',background:'none',border:'none',cursor:'pointer',textAlign:'left',width:'100%',
                          textDecoration: isChecked ? 'line-through' : 'none',opacity: isChecked ? 0.4 : 1,transition:'all 0.2s ease'}}>
                        <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${isChecked ? t.accent : (darkMode ? 'rgba(255,255,255,0.15)' : '#D1D5DB')}`,
                          background: isChecked ? t.accent : 'transparent',...fc,flexShrink:0,transition:'all 0.2s ease'}}>
                          {isChecked && <span style={{color: darkMode ? '#0C0F14' : '#FFF',fontSize:13,fontWeight:800}}>✓</span>}
                        </div>
                        <span style={{fontSize:15,...t.text}}>{convertToMetric(scaleIngredient(ing, originalServings, servings))} {ing.item || ing.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Voice commands hint */}
            <p style={{textAlign:'center',fontSize:11,...t.textMuted,opacity:0.5}}>Swipe card or say "next", "back", "timer", "done", "ingredients"</p>
            </>
            )}
          </div>
        )}
        {/* Cook Complete celebration */}
        {showCookComplete && selectedRecipe && (
          <div className="screen-enter" style={{...fcol,alignItems:'center',justifyContent:'center',gap:20,minHeight:'60vh',textAlign:'center',padding:'20px 0'}}>
            <div style={{width:100,height:100,borderRadius:28,background:`linear-gradient(135deg, ${t.accent}, ${darkMode ? '#9CDD20' : '#f97316'})`,...fc,
              boxShadow: `0 8px 40px ${darkMode ? 'rgba(190,255,70,0.3)' : 'rgba(239,68,68,0.3)'}`,animation:'bounceIn 0.5s ease-out'}}>
              <span style={{fontSize:48}}>🎉</span>
            </div>
            <div>
              <h2 className="font-extrabold" style={{fontSize:28,letterSpacing:'-0.5px',...t.text}}>Nailed it!</h2>
              <p style={{fontSize:15,marginTop:6,...t.textMuted}}>{selectedRecipe.name}</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,width:'100%',maxWidth:320}}>
              <div className={`${cardClass} border`} style={{borderRadius:R.card,padding:'16px 8px',textAlign:'center'}}>
                <p style={{fontSize:22,fontWeight:800,fontFamily:'JetBrains Mono, monospace',color: t.accent}}>{formatTime(cookElapsed)}</p>
                <p style={{fontSize:11,marginTop:4,...t.textMuted}}>cook time</p>
              </div>
              <div className={`${cardClass} border`} style={{borderRadius:R.card,padding:'16px 8px',textAlign:'center'}}>
                <p style={{fontSize:22,fontWeight:800,color: t.accent}}>{selectedRecipe.instructions?.length || 0}</p>
                <p style={{fontSize:11,marginTop:4,...t.textMuted}}>steps done</p>
              </div>
              <div className={`${cardClass} border`} style={{borderRadius:R.card,padding:'16px 8px',textAlign:'center'}}>
                <p style={{fontSize:22,fontWeight:800,color: t.accent}}>{selectedRecipe.nutrition?.calories || '—'}</p>
                <p style={{fontSize:11,marginTop:4,...t.textMuted}}>calories</p>
              </div>
            </div>
            {selectedRecipe.nutrition && (() => {
              const today = new Date().toISOString().split('T')[0];
              const logged = (foodLog[today] || []).some(e => e.name && e.name.startsWith(selectedRecipe.name));
              return <p style={{fontSize:13,...t.textMuted}}>{logged ? '✅' : '⬜'} Nutrition {logged ? 'logged' : 'not logged'}</p>;
            })()}
            <p style={{fontSize:13,...t.textMuted}}>🧊 Pantry updated • 📊 Stats tracked</p>
            <div style={{display:'flex',gap:10,width:'100%',maxWidth:320}}>
              <button onClick={() => { toggleSaveRecipe(selectedRecipe); }}
                style={{flex:1,padding:'14px',borderRadius:R.card,fontSize:15,fontWeight:700,border:`1px solid ${borderCol}`,background: cardBg,cursor:'pointer',...t.text}}>
                {isRecipeSaved(selectedRecipe) ? '❤️ Saved' : '🤍 Save'}
              </button>
              <button onClick={() => { setShowCookComplete(false); setCookMode(false); if (wakeLockRef.current) { wakeLockRef.current.release().catch(() => {}); wakeLockRef.current = null; } }}
                style={{flex:1,padding:'14px',borderRadius:R.card,fontSize:15,fontWeight:700,border:'none',cursor:'pointer',
                  background: gradientBtn,color: gradientBtnCol,boxShadow: gradientShadow}}>
                Done
              </button>
            </div>
          </div>
        )}

        {/* ==================== SAVED RECIPES ==================== */}
        {showSaved && (
          <div className="space-y-4">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <h2 className={`text-2xl font-bold ${textClass}`}>Saved Recipes</h2>
              <span style={{fontSize:13,...t.textMuted}}>{savedRecipes.length} saved</span>
            </div>
            {savedRecipes.length > 3 && (
              <input type="text" placeholder="Filter saved recipes..." value={savedFilter || ''} onChange={(e) => setSavedFilter(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border ${inputClass} text-sm`} />
            )}
            {/* Collections */}
            {collections.length > 0 && (
              <div style={{...fcol,gap:8}}>
                <p style={{fontSize:13,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',...t.textMuted}}>Collections</p>
                <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4}} className="scrollbar-hide">
                  {collections.map(col => (
                    <div key={col.id} style={{...frow,gap:0,flexShrink:0}}>
                      <button onClick={() => setSavedFilter(`col:${col.name}`)}
                        style={{padding:'8px 12px 8px 14px',borderRadius: '10px 0 0 10px',fontSize:13,fontWeight:600,whiteSpace:'nowrap',cursor:'pointer',
                          border: savedFilter === `col:${col.name}` ? `2px solid ${t.accent}` : `1px solid ${borderCol}`,borderRight:'none',
                          background: savedFilter === `col:${col.name}` ? (darkMode ? 'rgba(190,255,70,0.08)' : 'rgba(239,68,68,0.04)') : cardBg,
                          color: savedFilter === `col:${col.name}` ? t.accent : (darkMode ? '#D1D5DB' : '#374151')}}>
                        {col.name} ({col.recipes?.length || 0})
                      </button>
                      <button onClick={() => tapConfirm(`del-col-${col.id}`, () => deleteCollection(col.id))}
                        style={{padding:'8px 10px',borderRadius:'0 10px 10px 0',fontSize:11,cursor:'pointer',
                          border: savedFilter === `col:${col.name}` ? `2px solid ${t.accent}` : `1px solid ${borderCol}`,borderLeft:'none',
                          background: savedFilter === `col:${col.name}` ? (darkMode ? 'rgba(190,255,70,0.08)' : 'rgba(239,68,68,0.04)') : cardBg,
                          color: confirmId === `del-col-${col.id}` ? '#ef4444' : (darkMode ? '#6B7280' : '#9CA3AF')}}>
                        {confirmId === `del-col-${col.id}` ? '⚠' : '✕'}
                      </button>
                    </div>
                  ))}
                  {savedFilter?.startsWith('col:') && (
                    <button onClick={() => setSavedFilter('')}
                      style={{padding:'8px 14px',borderRadius:10,fontSize:13,fontWeight:600,whiteSpace:'nowrap',flexShrink:0,cursor:'pointer',border:`1px solid ${borderCol}`,background:'none',color:'#EF4444'}}>
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* New collection input */}
            <div style={{display:'flex',gap:8}}>
              <input type="text" placeholder="New collection name..." value={newCollection} onChange={(e) => setNewCollection(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createCollection(); }}
                className={`flex-1 px-3 py-2 rounded-lg border ${inputClass} text-sm`} />
              <button onClick={createCollection} disabled={!newCollection.trim()}
                style={{padding:'8px 14px',borderRadius:10,fontSize:13,fontWeight:700,border:'none',cursor: newCollection.trim() ? 'pointer' : 'not-allowed',
                  background: newCollection.trim() ? (darkMode ? 'rgba(190,255,70,0.1)' : 'rgba(239,68,68,0.06)') : (darkMode ? 'rgba(255,255,255,0.03)' : '#F3F4F6'),
                  color: newCollection.trim() ? t.accent : (darkMode ? '#4A5060' : '#9CA3AF')}}>
                + Create
              </button>
            </div>
            <div className="space-y-2">
              {savedRecipes.filter(r => {
                if (savedFilter?.startsWith('col:')) {
                  const colName = savedFilter.replace('col:', '');
                  const col = collections.find(c => c.name === colName);
                  return col?.recipes?.some(cr => cr.name === r.name);
                }
                return !savedFilter || r.name.toLowerCase().includes((savedFilter||'').toLowerCase());
              }).map((recipe, i) => (
                <div key={i} style={{...frow,gap:8}}>
                  <button onClick={() => { setShowSaved(false); getFullRecipe(recipe); }} className={`flex-1 text-left p-4 rounded-lg border ${cardClass} ${hoverClass} transition`}>
                    <div className="flex items-center justify-between">
                      <div><h4 className={`font-semibold ${textClass}`}>{recipe.name}</h4><p className={`text-sm ${textMutedClass}`}>{recipe.cookTime} · {recipe.difficulty}{recipe.cuisine ? ` · ${recipe.cuisine}` : ''}</p></div>
                      <Heart className="w-5 h-5 text-orange-500 fill-orange-500" />
                    </div>
                  </button>
                  {collections.length > 0 && (
                    <select onChange={(e) => { if (e.target.value) { addRecipeToCollection(Number(e.target.value), recipe); showToast(`Added to collection`); e.target.value = ''; }}}
                      style={{width:36,height:36,borderRadius:8,padding:0,textAlign:'center',fontSize:15,background: cardBg,border:`1px solid ${borderCol}`,cursor:'pointer',appearance:'none',...t.textMuted}}
                      title="Add to collection">
                      <option value="">+</option>
                      {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}
                </div>
              ))}
              {savedRecipes.length === 0 && (
                <div className="text-center" style={{padding:'40px 20px'}}>
                  <div style={{width:80,height:80,borderRadius:20,background: darkMode ? 'rgba(255,92,114,0.08)' : 'rgba(219,39,119,0.06)',...fc,margin:'0 auto 16px'}}>
                    <Heart style={{width:36,height:36,color: darkMode ? '#FF5C72' : '#db2777',opacity:0.6}} />
                  </div>
                  <p className="font-bold" style={{fontSize:16,...t.text}}>No saved recipes yet</p>
                  <p style={{fontSize:13,marginTop:6,maxWidth:240,margin:'6px auto 0',...t.textMuted}}>Tap the heart on any recipe to save it here for quick access</p>
                  <button onClick={() => nav('search')} style={{marginTop:16,padding:'10px 24px',borderRadius:12,fontSize:13,fontWeight:700,background: darkMode ? 'rgba(190,255,70,0.08)' : 'rgba(239,68,68,0.06)',color: t.accent,border:'none',cursor:'pointer'}}>Browse Recipes</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== SHOPPING LIST ==================== */}
        {showShoppingList && (() => {
          const checkedCount = shoppingList.filter(i => i.checked).length;
          const totalCount = shoppingList.length;
          const pct = totalCount > 0 ? checkedCount / totalCount : 0;
          return (
          <div style={{...fcol,gap:20}}>
            <div>
              <div style={{...frow,justifyContent:'space-between',marginBottom:16}}>
                <h2 className={`text-2xl font-bold ${textClass}`}>Shopping List</h2>
                {checkedCount > 0 && (
                  <button onClick={() => tapConfirm('clear-checked', () => { const newList = shoppingList.filter(item => !item.checked); setShoppingList(newList); saveToStorage('shopping-list', newList); })}
                    style={{fontSize:13,fontWeight:600,color:'#ef4444',background:'none',border:'none',cursor:'pointer'}}>
                    {confirmId === 'clear-checked' ? 'Tap to confirm' : 'Clear checked'}
                  </button>
                )}
              </div>
              {totalCount > 0 && (
                <div>
                  <div style={{...frow,justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontSize:13,fontWeight:600,...t.text}}>{checkedCount} of {totalCount} items</span>
                    <span style={{fontSize:13,fontWeight:700,color: pct === 1 ? '#22c55e' : t.accent}}>{Math.round(pct * 100)}%</span>
                  </div>
                  <div style={{height:6,borderRadius:3,background: darkMode ? 'rgba(255,255,255,0.06)' : '#E5E7EB',overflow:'hidden'}}>
                    <div style={{height:'100%',borderRadius:3,width:`${pct * 100}%`,background: pct === 1 ? '#22c55e' : (darkMode ? '#BEFF46' : 'linear-gradient(90deg, #ef4444, #f97316)'),transition:'width 0.4s ease-out'}} />
                  </div>
                </div>
              )}
            </div>
            {totalCount > 0 ? (
              <div style={{...fcol,gap:20}}>
                {groupedShoppingList.map(([category, items]) => {
                  const catChecked = items.filter(i => i.checked).length;
                  const allChecked = catChecked === items.length;
                  return (
                  <div key={category}>
                    <div style={{...frow,justifyContent:'space-between',marginBottom:S.tight}}>
                      <span style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px',color: allChecked ? '#22c55e' : (darkMode ? '#6B7280' : '#9CA3AF')}}>
                        {allChecked ? '✓ ' : ''}{category}
                      </span>
                      <span style={{fontSize:11,fontWeight:600,...t.textMuted}}>{catChecked}/{items.length}</span>
                    </div>
                    <div className={`${cardClass} border`} style={{borderRadius:R.card,overflow:'hidden',...t.card}}>
                      {items.map((item, i) => {
                        const globalIdx = shoppingList.indexOf(item);
                        return (
                          <div key={globalIdx}
                            style={{...frow,gap:S.gap,padding:'13px 16px',
                              borderTop: i > 0 ? `1px solid ${darkMode ? 'rgba(255,255,255,0.04)' : '#F3F4F6'}` : 'none',
                              opacity: item.checked ? 0.4 : 1,transition:'opacity 0.25s'}}>
                            <button onClick={() => toggleShoppingItem(globalIdx)}
                              style={{width:22,height:22,borderRadius:6,border: item.checked ? 'none' : `2px solid ${darkMode ? 'rgba(255,255,255,0.15)' : '#D1D5DB'}`,
                                background: item.checked ? (darkMode ? '#BEFF46' : '#22c55e') : 'none',...fc,flexShrink:0,cursor:'pointer',transition:'all 0.2s'}}>
                              {item.checked && <span style={{fontSize:13,color: darkMode ? '#0C0F14' : '#fff',fontWeight:700}}>✓</span>}
                            </button>
                            <span style={{flex:1,fontSize:15,fontWeight: item.checked ? 400 : 500,
                              textDecoration: item.checked ? 'line-through' : 'none',
                              color: item.checked ? (darkMode ? '#4B5563' : '#9CA3AF') : (darkMode ? '#F9FAFB' : '#111827')}}>
                              {item.amount} {item.item}
                            </span>
                            <button onClick={() => { const newList = shoppingList.filter((_, idx) => idx !== globalIdx); setShoppingList(newList); saveToStorage('shopping-list', newList); }}
                              style={{padding:4,background:'none',border:'none',cursor:'pointer',opacity:0.4}}>
                              <X style={{width:15,height:15,...t.textMuted}} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  );
                })}
                {pct === 1 && (
                  <div style={{textAlign:'center',padding:'12px 0'}}>
                    <span style={{fontSize:22}}>🎉</span>
                    <p style={{fontSize:15,fontWeight:700,marginTop:4,color:'#22c55e'}}>All done!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center" style={{padding:'48px 20px'}}>
                <div style={{width:80,height:80,borderRadius:20,background: darkMode ? 'rgba(92,164,255,0.08)' : 'rgba(37,99,235,0.06)',...fc,margin:'0 auto 16px'}}>
                  <ShoppingCart style={{width:36,height:36,color: darkMode ? '#5CA4FF' : '#2563eb',opacity:0.6}} />
                </div>
                <p className="font-bold" style={{fontSize:16,...t.text}}>Shopping list is empty</p>
                <p style={{fontSize:13,marginTop:6,maxWidth:260,margin:'6px auto 0',...t.textMuted}}>Open a recipe and tap "Add to Shopping" to get started</p>
                <button onClick={() => { setShowShoppingList(false); nav('search'); }}
                  style={{marginTop:16,padding:'10px 24px',borderRadius:R.card,fontSize:13,fontWeight:700,background: darkMode ? 'rgba(190,255,70,0.08)' : 'rgba(239,68,68,0.06)',color: t.accent,border:'none',cursor:'pointer'}}>
                  Find Recipes →
                </button>
              </div>
            )}
          </div>
          );
        })()}

        {/* ==================== SETTINGS ==================== */}
        {showSettings && (() => {
          const SectionHead = ({ icon, title }) => (
            <div style={{...frow,gap:10,paddingBottom:12,borderBottom:`1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,marginBottom:16}}>
              <span style={{fontSize:18}}>{icon}</span>
              <h3 className={`font-bold ${textClass}`} style={{fontSize:16}}>{title}</h3>
            </div>
          );
          return (
          <div style={{...fcol,gap:24}}>
            <h2 className={`text-2xl font-bold ${textClass}`}>Settings</h2>

            {/* Profile */}
            {onboardingDone && userProfile.name && (
              <div className={`${cardClass} border rounded-2xl`} style={{padding:'20px'}}>
                <SectionHead icon="👤" title="Profile" />
                <div style={{...frow,gap:14}}>
                  <div style={{width:48,height:48,borderRadius:R.card,background: darkMode ? 'rgba(190,255,70,0.08)' : '#F3F4F6',...fc,fontSize:22,flexShrink:0}}>
                    {userProfile.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{flex:1}}>
                    <p className="font-bold" style={{fontSize:15,...t.text}}>{userProfile.name}</p>
                    <p style={{fontSize:13,...t.textMuted}}>{userProfile.calorieTarget} cal/day target</p>
                  </div>
                  <button onClick={() => { setOnboardingDone(false); setOnboardingStep(0); setShowSettings(false); saveToStorage('onboarding-done', false); }}
                    style={{fontSize:13,fontWeight:600,color: t.accent,background:'none',border:'none',cursor:'pointer'}}>Edit</button>
                </div>
              </div>
            )}

            {/* Recipe Preferences */}
            <div className={`${cardClass} border rounded-2xl`} style={{padding:'20px'}}>
              <SectionHead icon="🍳" title="Recipe Preferences" />
              <div style={{...fcol,gap:20}}>
                <div>
                  <h4 className={`font-semibold ${textClass} mb-2`} style={{fontSize:13}}>Dietary Restrictions</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Low-Carb', 'Halal', 'Kosher', 'Pescatarian'].map(option => (
                      <button key={option} onClick={() => toggleDietary(option)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${preferences.dietary.includes(option) ? chipActiveClass : chipClass}`}>{option}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className={`font-semibold ${textClass} mb-2`} style={{fontSize:13}}>Cuisine Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mediterranean', 'American', 'French', 'Korean', 'Vietnamese', 'Greek'].map(cuisine => (
                      <button key={cuisine} onClick={() => toggleCuisine(cuisine)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${preferences.cuisines.includes(cuisine) ? chipActiveClass : chipClass}`}>{cuisine}</button>
                    ))}
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  <div>
                    <h4 className={`font-semibold ${textClass} mb-2`} style={{fontSize:13}}>Skill Level</h4>
                    <div style={{...fcol,gap:4}}>
                      {['Any', 'Beginner', 'Intermediate', 'Advanced'].map(level => (
                        <button key={level} onClick={() => { const newPrefs = { ...preferences, skillLevel: level.toLowerCase() }; setPreferences(newPrefs); saveToStorage('preferences', newPrefs); }}
                          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition ${preferences.skillLevel === level.toLowerCase() ? chipActiveClass : chipClass}`}>{level}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className={`font-semibold ${textClass} mb-2`} style={{fontSize:13}}>Max Cook Time</h4>
                    <div style={{...fcol,gap:4}}>
                      {[['Any','any'], ['Under 15 min','under 15 mins'], ['Under 30 min','under 30 mins'], ['Under 1 hour','under 1 hour']].map(([label, val]) => (
                        <button key={val} onClick={() => { const newPrefs = { ...preferences, maxTime: val }; setPreferences(newPrefs); saveToStorage('preferences', newPrefs); }}
                          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition ${preferences.maxTime === val ? chipActiveClass : chipClass}`}>{label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety & Units */}
            <div className={`${cardClass} border rounded-2xl`} style={{padding:'20px'}}>
              <SectionHead icon="🛡️" title="Safety & Units" />
              <div style={{...fcol,gap:20}}>
                <div>
                  <h4 className={`font-semibold ${textClass} mb-1`} style={{fontSize:13}}>Allergen Alerts</h4>
                  <p className={`text-xs ${textMutedClass} mb-3`}>We'll warn you when recipes contain these</p>
                  <div className="flex flex-wrap gap-2">
                    {['Dairy', 'Gluten', 'Nuts', 'Peanuts', 'Shellfish', 'Fish', 'Eggs', 'Soy'].map(a => (
                      <button key={a} onClick={() => {
                        const lower = a.toLowerCase();
                        const updated = allergens.includes(lower) ? allergens.filter(x => x !== lower) : [...allergens, lower];
                        setAllergens(updated);
                        saveToStorage('allergens', updated);
                      }} className={`px-4 py-2 rounded-full text-sm font-medium transition ${allergens.includes(a.toLowerCase()) ? 'bg-red-500 text-white shadow-md' : chipClass}`}>{a}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className={`font-semibold ${textClass} mb-2`} style={{fontSize:13}}>Measurement Units</h4>
                  <div className="flex gap-2">
                    {[{ label: 'US (cups, oz)', metric: false }, { label: 'Metric (ml, g)', metric: true }].map(opt => (
                      <button key={opt.label} onClick={() => { setUseMetric(opt.metric); saveToStorage('use-metric', opt.metric); }}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition ${useMetric === opt.metric ? chipActiveClass : chipClass}`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Data & Storage */}
            <div className={`${cardClass} border rounded-2xl`} style={{padding:'20px'}}>
              <SectionHead icon="💾" title="Data & Storage" />
              <div style={{...fcol,gap:16}}>
                <div>
                  <h4 className={`font-semibold ${textClass} mb-2`} style={{fontSize:13}}>Backup</h4>
                  <div className="flex gap-2">
                    <button onClick={exportData} className={`flex-1 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} ${textClass} rounded-lg py-2.5 text-sm font-semibold transition`}>Export</button>
                    <label className={`flex-1 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} ${textClass} rounded-lg py-2.5 text-sm font-semibold transition text-center cursor-pointer`}>
                      Import
                      <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                    </label>
                  </div>
                </div>
                <div style={{borderTop:`1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,paddingTop:16}}>
                  <div style={{...frow,justifyContent:'space-between',marginBottom:8}}>
                    <h4 className={`font-semibold ${textClass}`} style={{fontSize:13}}>API Cache</h4>
                    <button onClick={() => loadCacheStats()} style={{fontSize:11,color: t.accent,fontWeight:600,background:'none',border:'none',cursor:'pointer'}}>Refresh</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[['text-emerald-500', cacheStats.hits, 'Hits'],['text-orange-500', cacheStats.misses, 'API calls'],[textClass, cacheStats.totalEntries, 'Cached']].map(([col,val,lbl],i) => (
                      <div key={i} className={`text-center p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}><p className={`text-lg font-bold ${col}`}>{val}</p><p className={`text-xs ${textMutedClass}`}>{lbl}</p></div>
                    ))}
                  </div>
                  {cacheStats.hits + cacheStats.misses > 0 && (
                    <p className={`text-xs ${textMutedClass} mb-3`}>
                      {Math.round((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100)}% served from cache this session
                    </p>
                  )}
                  <button onClick={() => tapConfirm('clear-cache', clearAllCache)} className={`w-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} ${textClass} rounded-lg py-2.5 text-sm font-semibold transition`}>
                    {confirmId === 'clear-cache' ? 'Tap again to confirm' : 'Clear Cache'}
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => setShowSettings(false)} className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-4 font-semibold transition">Done</button>
          </div>
          );
        })()}
      </div>

      {/* ==================== CALORIE TRACKER SCREEN ==================== */}
      {showTracker && !showMealScanner && (
        <div className="fixed inset-0 z-40 overflow-y-auto" style={overlayBg}>
          <div className="max-w-lg mx-auto p-4 pt-20 pb-24 space-y-5">
            <div className="flex items-center justify-between fade-up">
              <h2 className={`text-2xl font-extrabold tracking-tight ${textClass}`}>Nutrition Tracker</h2>
              <button onClick={() => setShowTracker(false)} className={`p-2 rounded-full ${hoverClass}`}><X aria-hidden="true" className={`w-5 h-5 ${textMutedClass}`} /></button>
            </div>
            {/* Date nav */}
            <div className="flex items-center justify-between fade-up">
              <button onClick={() => { const d = new Date(trackerDate); d.setDate(d.getDate() - 1); setTrackerDate(d.toISOString().split('T')[0]); }} className={`p-2 rounded-full ${hoverClass}`}><ArrowLeft className={`w-5 h-5 ${textMutedClass}`} /></button>
              <span className={`font-bold ${textClass}`}>{new Date(trackerDate + 'T12:00').toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              <button onClick={() => { const d = new Date(trackerDate); d.setDate(d.getDate() + 1); setTrackerDate(d.toISOString().split('T')[0]); }} className={`p-2 rounded-full ${hoverClass} rotate-180`}><ArrowLeft className={`w-5 h-5 ${textMutedClass}`} /></button>
            </div>
            {/* Calorie ring */}
            <div className={`fade-up ${cardClass} border rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke={darkMode ? '#1f2937' : '#e5e7eb'} strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="url(#calGrad2)" strokeWidth="2.5" strokeDasharray={`${Math.min(100, (todayTotals.calories / (userProfile.calorieTarget || 2000)) * 100) * 0.94} 94`} strokeLinecap="round" />
                    <defs><linearGradient id="calGrad2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ef4444"/><stop offset="100%" stopColor="#f97316"/></linearGradient></defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-xl font-extrabold ${textClass}`}>{todayTotals.calories}</span>
                    <span className={`text-[10px] ${textMutedClass}`}>/ {userProfile.calorieTarget || 2000}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <MacroBar label="Protein" current={todayTotals.protein} target={userProfile.proteinTarget || 150} color="bg-blue-500" />
                  <MacroBar label="Carbs" current={todayTotals.carbs} target={userProfile.carbTarget || 200} color="bg-emerald-500" />
                  <MacroBar label="Fat" current={todayTotals.fat} target={userProfile.fatTarget || 65} color="bg-violet-500" />
                </div>
              </div>
            </div>
            {/* Week chart */}
            <div className={`fade-up ${cardClass} border rounded-2xl p-5 shadow-sm`}>
              <h3 className={`font-bold ${textClass} mb-3`}>This Week</h3>
              <div className="flex items-end gap-2 h-24">
                {getWeekData().map((d, i) => {
                  const maxCal = Math.max(...getWeekData().map(x => x.calories), userProfile.calorieTarget || 2000);
                  const h = maxCal > 0 ? Math.max(4, (d.calories / maxCal) * 100) : 4;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col justify-end h-20">
                        <div className={`w-full rounded-t-md ${d.date === trackerDate ? 'bg-gradient-to-t from-red-500 to-orange-400' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ height: `${h}%` }} />
                      </div>
                      <span className={`text-[10px] ${d.date === trackerDate ? 'text-orange-500 font-bold' : textMutedClass}`}>{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 fade-up">
              <button onClick={() => { setShowMealScanner(true); }} className="card-hover bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-4 font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
                <Camera className="w-5 h-5" /> Scan Meal
              </button>
              <button onClick={() => setShowManualLog(true)} className={`card-hover ${cardClass} border rounded-2xl p-4 font-bold ${textClass} flex items-center justify-center gap-2`}>
                <Plus className="w-5 h-5" /> Manual Log
              </button>
            </div>
            {/* Manual entry form */}
            {showManualLog && (
              <div className={`fade-up ${cardClass} border rounded-2xl p-5 shadow-sm space-y-3`}>
                <h3 className={`font-bold ${textClass}`}>Add Food</h3>
                <input placeholder="Food name..." value={manualEntry.name} onChange={(e) => setManualEntry({...manualEntry, name: e.target.value})} className={`w-full px-4 py-3 rounded-xl border ${inputClass}`} />
                <div className="grid grid-cols-2 gap-2">
                  {[['calories', 'Calories'], ['protein', 'Protein (g)'], ['carbs', 'Carbs (g)'], ['fat', 'Fat (g)']].map(([key, ph]) => (
                    <input key={key} type="number" placeholder={ph} value={manualEntry[key]} onChange={(e) => setManualEntry({...manualEntry, [key]: e.target.value})} className={`px-3 py-2.5 rounded-lg border ${inputClass}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowManualLog(false)} className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} ${textClass} rounded-xl py-3 font-semibold`}>Cancel</button>
                  <button onClick={addManualEntry} className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl py-3 font-bold">Add</button>
                </div>
              </div>
            )}
            {/* Food log */}
            <div className={`fade-up ${cardClass} border rounded-2xl p-5 shadow-sm`}>
              <h3 className={`font-bold ${textClass} mb-3`}>Food Log</h3>
              {todayLog.length === 0 ? (
                <p className={`text-sm ${textMutedClass} text-center py-4`}>No entries yet today. Scan a meal or add manually.</p>
              ) : (
                <div className="space-y-2">
                  {todayLog.map((entry) => (
                    <div key={entry.id} className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold ${textClass} truncate`}>{entry.name}</p>
                        <p className={`text-xs ${textMutedClass}`}>{entry.time} — {entry.calories} cal • {entry.protein}p • {entry.carbs}c • {entry.fat}f</p>
                      </div>
                      <button onClick={() => removeFoodEntry(entry.id)} className={`p-1.5 rounded-full ${hoverClass}`}><X className={`w-4 h-4 ${textMutedClass}`} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MEAL SCANNER SCREEN ==================== */}
      {showMealScanner && (
        <div className="fixed inset-0 z-40 overflow-y-auto" style={overlayBg}>
          <div className="max-w-lg mx-auto p-4 pt-20 pb-24 space-y-5">
            <div className="flex items-center justify-between fade-up">
              <h2 className={`text-2xl font-extrabold tracking-tight ${textClass}`}>Scan Your Meal</h2>
              <button onClick={() => { setShowMealScanner(false); setMealScanImage(null); setMealScanResult(null); }} className={`p-2 rounded-full ${hoverClass}`}><X aria-hidden="true" className={`w-5 h-5 ${textMutedClass}`} /></button>
            </div>
            {!mealScanResult ? (
              <div className="space-y-5 fade-up">
                {mealScanImage ? (
                  <div className="space-y-4">
                    <img src={mealScanImage.src} alt="Meal" className="w-full h-64 object-cover rounded-2xl" />
                    <button onClick={scanMealPhoto} disabled={scanningMeal} className="card-hover w-full bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-4 font-bold flex items-center justify-center gap-2 shadow-lg">
                      {scanningMeal ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Search className="w-5 h-5" /> Analyze Nutrition</>}
                    </button>
                    <button onClick={() => setMealScanImage(null)} className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} ${textClass} rounded-2xl p-3 font-semibold`}>Retake Photo</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`${cardClass} border-2 border-dashed rounded-2xl p-12 text-center`}>
                      <Camera className={`w-12 h-12 mx-auto mb-3 ${textMutedClass}`} />
                      <p className={`font-semibold ${textClass}`}>Take a photo of your meal</p>
                      <p className={`text-sm ${textMutedClass} mt-1`}>We'll estimate the calories and macros</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => mealCameraInputRef.current?.click()} className="card-hover bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-4 font-bold flex items-center justify-center gap-2">
                        <Camera className="w-5 h-5" /> Camera
                      </button>
                      <button onClick={() => mealScanInputRef.current?.click()} className={`card-hover ${cardClass} border rounded-2xl p-4 font-bold ${textClass} flex items-center justify-center gap-2`}>
                        <Upload className="w-5 h-5" /> Upload
                      </button>
                    </div>
                  </div>
                )}
                <input ref={mealCameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleMealScanCapture} className="hidden" />
                <input ref={mealScanInputRef} type="file" accept="image/*" onChange={handleMealScanCapture} className="hidden" />
              </div>
            ) : (
              <div className="space-y-5 fade-up">
                {mealScanImage && <img src={mealScanImage.src} alt="Meal" className="w-full h-48 object-cover rounded-2xl" />}
                <div className={`${cardClass} border rounded-2xl p-5 shadow-sm`}>
                  <h3 className={`font-bold text-lg ${textClass} mb-1`}>{mealScanResult.meal_name}</h3>
                  <div className="grid grid-cols-4 gap-2 mt-4 mb-4">
                    {[['calories', 'Cal', 'from-red-500 to-orange-500'], ['protein', 'Protein', 'from-blue-500 to-sky-500'], ['carbs', 'Carbs', 'from-emerald-500 to-teal-500'], ['fat', 'Fat', 'from-violet-500 to-purple-500']].map(([key, label, grad]) => (
                      <div key={key} className={`text-center p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <p className={`text-lg font-extrabold bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>{mealScanResult.total?.[key] || 0}{key !== 'calories' ? 'g' : ''}</p>
                        <p className={`text-xs ${textMutedClass}`}>{label}</p>
                      </div>
                    ))}
                  </div>
                  <h4 className={`font-semibold ${textClass} mb-2`}>Items detected:</h4>
                  <div className="space-y-1.5">
                    {(mealScanResult.items || []).map((item, i) => (
                      <div key={i} className={`flex justify-between text-sm py-1.5 ${i > 0 ? `border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'}` : ''}`}>
                        <span className={textClass}>{item.name} <span className={textMutedClass}>({item.portion})</span></span>
                        <span className={`font-semibold ${textClass}`}>{item.calories} cal</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={logScannedMeal} className="card-hover w-full bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-4 font-bold shadow-lg">
                  Log This Meal ({mealScanResult.total?.calories || 0} cal)
                </button>
                <button onClick={() => { setMealScanResult(null); setMealScanImage(null); }} className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} ${textClass} rounded-2xl p-3 font-semibold`}>Try Another Photo</button>
              </div>
            )}
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">{error}</div>}
          </div>
        </div>
      )}

      {/* ==================== COOKSTATS SCREEN ==================== */}
      {showStats && (
        <div className="fixed inset-0 z-40 overflow-y-auto" style={overlayBg}>
          <div className="max-w-lg mx-auto p-4 pt-20 pb-24 space-y-5">
            <OverlayHeader onBack={() => setShowStats(false)} title="CookStats" />
            {/* Streak card */}
            <div className={`fade-up ${cardClass} border rounded-2xl p-6 shadow-sm text-center`}>
              <div className="text-4xl mb-2">🔥</div>
              <p className={`text-4xl font-extrabold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent`}>{stats.streak || 0}</p>
              <p className={`text-sm ${textMutedClass}`}>day streak</p>
              {stats.longestStreak > 0 && <p className={`text-xs ${textMutedClass} mt-1`}>Best: {stats.longestStreak} days</p>}
            </div>
            {/* Stat numbers */}
            <div className="grid grid-cols-2 gap-3 fade-up">
              {[
                ['📸', stats.totalScans || 0, 'Scans'],
                ['👁️', stats.totalRecipesViewed || 0, 'Recipes Viewed'],
                ['🍳', stats.totalCooked || 0, 'Recipes Cooked'],
                ['📊', stats.totalMealsLogged || 0, 'Meals Logged']
              ].map(([icon, count, label], i) => (
                <div key={i} className={`${cardClass} border rounded-2xl p-4 text-center shadow-sm`}>
                  <span className="text-2xl">{icon}</span>
                  <p className={`text-2xl font-extrabold ${textClass} mt-1`}>{count}</p>
                  <p className={`text-xs ${textMutedClass}`}>{label}</p>
                </div>
              ))}
            </div>
            {/* Weekly Trend */}
            {getWeeklyTrend.some(w => w.meals > 0) && (
              <div className={`fade-up ${cardClass} border rounded-2xl p-5 shadow-sm`}>
                <h3 className={`font-bold ${textClass} mb-3`} style={{fontSize:15}}>Meals per Week</h3>
                <div style={{display:'flex',alignItems:'flex-end',gap:6,height:120}}>
                  {getWeeklyTrend.map((w, i) => {
                    const max = Math.max(...getWeeklyTrend.map(x => x.meals), 1);
                    const h = Math.max(4, (w.meals / max) * 100);
                    const isCurrent = i === getWeeklyTrend.length - 1;
                    return (
                      <div key={i} style={{flex:1,...fcol,alignItems:'center',gap:4}}>
                        <span style={{fontSize:11,fontWeight:700,...t.text}}>{w.meals || ''}</span>
                        <div style={{width:'100%',height:`${h}%`,minHeight:4,borderRadius:'4px 4px 0 0',
                          background: isCurrent ? (darkMode ? '#BEFF46' : '#EF4444') : (darkMode ? 'rgba(190,255,70,0.25)' : 'rgba(239,68,68,0.25)'),
                          transition:'height 0.5s ease'}} />
                        <span style={{fontSize:11,...t.textMuted}}>{w.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Cuisine Breakdown */}
            {getCuisineCounts.length > 0 && (
              <div className={`fade-up ${cardClass} border rounded-2xl p-5 shadow-sm`}>
                <h3 className={`font-bold ${textClass} mb-3`} style={{fontSize:15}}>Top Cuisines</h3>
                <div style={{...fcol,gap:8}}>
                  {getCuisineCounts.map(([cuisine, count], i) => {
                    const max = getCuisineCounts[0][1];
                    const pct = Math.round((count / max) * 100);
                    return (
                      <div key={cuisine} style={{...frow,gap:10}}>
                        <span style={{fontSize:13,fontWeight:600,width:80,textAlign:'right',...t.text}}>{cuisine}</span>
                        <div style={{flex:1,height:20,borderRadius:6,background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${pct}%`,borderRadius:6,background: i === 0 ? (darkMode ? '#BEFF46' : '#EF4444') : (darkMode ? 'rgba(190,255,70,0.4)' : 'rgba(239,68,68,0.4)'),transition:'width 0.5s ease'}} />
                        </div>
                        <span style={{fontSize:11,fontWeight:700,width:24,...t.textMuted}}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SHARE CARD OVERLAY ==================== */}
      {/* ==================== SCAN HISTORY ==================== */}
      {showScanHistory && (
        <div className="fixed inset-0 z-40 overflow-y-auto" style={overlayBg}>
          <div className="max-w-lg mx-auto p-4 pt-20 pb-24 space-y-5">
            <div className="flex items-center justify-between fade-up">
              <div style={{...frow,gap:12}}>
                <BackBtn onClick={() => setShowScanHistory(false)} />
                <h2 className="font-extrabold" style={{fontSize:24,letterSpacing:'-0.5px',...t.text}}>Scan History</h2>
              </div>
              <span style={{fontSize:13,...t.textMuted}}>{scanHistory.length} scans</span>
            </div>
            {scanHistory.length === 0 ? (
              <div className="text-center" style={{padding:'40px 20px'}}>
                <div style={{width:72,height:72,borderRadius:18,background: darkMode ? 'rgba(190,255,70,0.06)' : 'rgba(239,68,68,0.04)',...fc,margin:'0 auto 16px'}}>
                  <Camera style={{width:32,height:32,color: t.accent,opacity:0.5}} />
                </div>
                <p className="font-bold" style={{fontSize:16,...t.text}}>No scans yet</p>
                <p style={{fontSize:13,marginTop:6,maxWidth:240,margin:'6px auto 0',...t.textMuted}}>Your ingredient scans will appear here</p>
                <button onClick={() => { setShowScanHistory(false); setStep('capture'); }} style={{marginTop:16,padding:'10px 24px',borderRadius:12,fontSize:13,fontWeight:700,background: darkMode ? 'rgba(190,255,70,0.08)' : 'rgba(239,68,68,0.06)',color: t.accent,border:'none',cursor:'pointer'}}>Scan Ingredients</button>
              </div>
            ) : (
              <div style={{...fcol,gap:10}}>
                {scanHistory.slice().reverse().map((scan, i) => (
                  <div key={scan.id || i} className={`${cardClass} border`} style={{borderRadius:R.card,padding:16,...t.card}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                      <span style={{fontSize:13,fontWeight:600,...t.textMuted}}>{new Date(scan.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span style={{fontSize:11,fontWeight:500,...t.textMuted}}>{scan.ingredients?.length || 0} items</span>
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {(scan.ingredients || []).slice(0, 8).map((ing, j) => (
                        <span key={j} style={{fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:8,background: darkMode ? 'rgba(190,255,70,0.06)' : 'rgba(239,68,68,0.04)',color: t.accent}}>{ing}</span>
                      ))}
                      {(scan.ingredients || []).length > 8 && <span style={{fontSize:11,padding:'4px 10px',borderRadius:8,...t.textMuted}}>+{scan.ingredients.length - 8} more</span>}
                    </div>
                    <button onClick={() => { setShowScanHistory(false); setIngredients(scan.ingredients || []); setStep('review'); }}
                      style={{marginTop:10,fontSize:13,fontWeight:700,color: t.accent,background:'none',border:'none',cursor:'pointer',padding:0}}>
                      Re-use these ingredients →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {shareCardRecipe && (
        <div style={{position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.65)',...fc,padding:16}} onClick={() => setShareCardRecipe(null)}>
          <div style={{width:'100%',maxWidth:384}} onClick={(e) => e.stopPropagation()}>
            <div id="share-card" className="bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl p-6 text-white space-y-3 shadow-2xl">
              <div className="flex items-center gap-2 opacity-80">
                <SnapChefLogo size={24} />
                <span className="text-sm font-semibold">Snap Chef</span>
              </div>
              <h3 className="text-2xl font-extrabold">{shareCardRecipe.name}</h3>
              {shareCardRecipe.description && <p className="text-sm opacity-90">{shareCardRecipe.description}</p>}
              <div className="flex gap-4 text-sm">
                {shareCardRecipe.cookTime && <span>⏱ {shareCardRecipe.cookTime}</span>}
                {shareCardRecipe.servings && <span>👥 {shareCardRecipe.servings} servings</span>}
                {shareCardRecipe.difficulty && <span>📊 {shareCardRecipe.difficulty}</span>}
              </div>
              {shareCardRecipe.ingredients && (
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-xs font-semibold mb-1 opacity-80">Ingredients:</p>
                  <p className="text-xs opacity-90">{shareCardRecipe.ingredients.slice(0, 8).map(i => `${i.amount} ${i.item}`).join(' • ')}{shareCardRecipe.ingredients.length > 8 ? '...' : ''}</p>
                </div>
              )}
              {shareCardRecipe.nutrition && (
                <div className="flex justify-around text-center">
                  {[['calories', 'Cal'], ['protein', 'Pro'], ['carbs', 'Carbs'], ['fat', 'Fat']].map(([k, l]) => (
                    <div key={k}><p className="text-lg font-bold">{shareCardRecipe.nutrition[k]}</p><p className="text-[10px] opacity-70">{l}</p></div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => shareRecipe(shareCardRecipe)} style={{flex:1,padding:'14px 0',borderRadius:R.card,fontSize:15,fontWeight:700,border:'none',cursor:'pointer',background:'#22C55E',color:'#111827'}}>Share</button>
              <button onClick={() => setShareCardRecipe(null)} style={{flex:1,padding:'14px 0',borderRadius:R.card,fontSize:15,fontWeight:600,border:'none',cursor:'pointer',background: darkMode ? '#FFFFFF' : '#111827',color: darkMode ? '#111827' : '#FFFFFF'}}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TOAST NOTIFICATIONS ==================== */}
      {toasts.length > 0 && (
        <div style={{position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',zIndex:60,...fcol,gap:8,alignItems:'center',pointerEvents:'none'}}>
          {toasts.map(t => (
            <div key={t.id} style={{pointerEvents:'auto'}} className={`${t.removing ? 'toast-out' : 'toast-in'} flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-lg ${
              t.type === 'error'
                ? 'bg-red-600/90 text-white'
                : darkMode ? 'bg-gray-800/95 text-gray-100 border border-gray-700' : 'bg-white/95 text-gray-900 border border-gray-200'
            }`}>
              <span className="text-sm font-semibold">{t.message}</span>
              {t.undoAction && (
                <button onClick={() => { t.undoAction(); setToasts(prev => prev.filter(x => x.id !== t.id)); }} className="text-sm font-bold text-orange-500 ml-1">Undo</button>
              )}
            </div>
          ))}
        </div>
      )}


      {/* ==================== FULLSCREEN IMAGE VIEWER ==================== */}
      {showFullImage && images.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col" onClick={() => { setShowFullImage(false); setImageZoom(1); setImagePan({ x: 0, y: 0 }); }}>
          <div className="flex items-center justify-between p-4 z-10">
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); setImageZoom(z => { const nz = Math.max(1, z - 0.5); if (nz === 1) setImagePan({ x: 0, y: 0 }); return nz; }); }} className="p-2 text-white bg-white/20 hover:bg-white/30 rounded-full transition"><ZoomOut className="w-5 h-5" /></button>
              <span className="text-white text-sm font-medium min-w-[3rem] text-center">{Math.round(imageZoom * 100)}%</span>
              <button onClick={(e) => { e.stopPropagation(); setImageZoom(z => Math.min(5, z + 0.5)); }} className="p-2 text-white bg-white/20 hover:bg-white/30 rounded-full transition"><ZoomIn className="w-5 h-5" /></button>
              {imageZoom > 1 && <button onClick={(e) => { e.stopPropagation(); setImageZoom(1); setImagePan({ x: 0, y: 0 }); }} className="text-white text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition ml-1">Reset</button>}
            </div>
            <div className="flex items-center gap-3">
              {images.length > 1 && <span className="text-white/70 text-sm">{fullImageIndex + 1} / {images.length}</span>}
              <button onClick={() => { setShowFullImage(false); setImageZoom(1); setImagePan({ x: 0, y: 0 }); }} className="p-2 text-white hover:bg-white/20 rounded-full transition"><X className="w-6 h-6" /></button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden relative"
            style={{ cursor: imageZoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'zoom-in' }}
            onClick={(e) => { e.stopPropagation(); if (imageZoom === 1) setImageZoom(2.5); }}
            onWheel={(e) => { e.stopPropagation(); setImageZoom(z => { const nz = Math.max(1, Math.min(5, z + (e.deltaY > 0 ? -0.3 : 0.3))); if (nz === 1) setImagePan({ x: 0, y: 0 }); return nz; }); }}
            onMouseDown={(e) => { if (imageZoom > 1) { e.preventDefault(); setIsPanning(true); panStartRef.current = { x: e.clientX - imagePan.x, y: e.clientY - imagePan.y }; } }}
            onMouseMove={(e) => { if (isPanning && imageZoom > 1) setImagePan({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y }); }}
            onMouseUp={() => setIsPanning(false)} onMouseLeave={() => setIsPanning(false)}
            onTouchStart={(e) => { if (imageZoom > 1 && e.touches.length === 1) { setIsPanning(true); panStartRef.current = { x: e.touches[0].clientX - imagePan.x, y: e.touches[0].clientY - imagePan.y }; } }}
            onTouchMove={(e) => { if (isPanning && imageZoom > 1 && e.touches.length === 1) setImagePan({ x: e.touches[0].clientX - panStartRef.current.x, y: e.touches[0].clientY - panStartRef.current.y }); }}
            onTouchEnd={() => setIsPanning(false)}>
            {images.length > 1 && imageZoom === 1 && <>
              <button onClick={(e) => { e.stopPropagation(); setFullImageIndex(i => (i - 1 + images.length) % images.length); setImageZoom(1); setImagePan({ x: 0, y: 0 }); }} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition"><ArrowLeft className="w-5 h-5" /></button>
              <button onClick={(e) => { e.stopPropagation(); setFullImageIndex(i => (i + 1) % images.length); setImageZoom(1); setImagePan({ x: 0, y: 0 }); }} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition" style={{transform:'translateY(-50%) scaleX(-1)'}}><ArrowLeft className="w-5 h-5" /></button>
            </>}
            <img src={images[Math.min(fullImageIndex, images.length - 1)]?.src} alt={`Photo ${fullImageIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg select-none" draggable={false}
              style={{ transform: `scale(${imageZoom}) translate(${imagePan.x / imageZoom}px, ${imagePan.y / imageZoom}px)`, transition: isPanning ? 'none' : 'transform 0.2s ease' }} />
          </div>
          <div className="p-4">
            {images.length > 1 && <div className="flex gap-2 justify-center mb-3">
              {images.map((img, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setFullImageIndex(i); setImageZoom(1); setImagePan({ x: 0, y: 0 }); }}
                  className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${i === fullImageIndex ? 'border-orange-500 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img.src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>}
            {imageZoom === 1 && <p className="text-white/60 text-xs text-center">{images.length > 1 ? 'Tap thumbnails or arrows to switch · ' : ''}Scroll to zoom · Tap to zoom in · Drag to pan</p>}
          </div>
        </div>
      )}

      {/* ==================== FIX #8: MEAL PICKER MODAL ==================== */}
      {showMealPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowMealPicker(null)}>
          <div className={`${cardClass} rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${textClass}`}>Add to {showMealPicker}</h3>
              <button onClick={() => setShowMealPicker(null)} className={`p-2 ${hoverClass} rounded-full`}><X aria-hidden="true" className={`w-5 h-5 ${textMutedClass}`} /></button>
            </div>
            {savedRecipes.length === 0 && recipeHistory.length === 0 ? (
              <div className="text-center" style={{padding:'40px 20px'}}>
                <div style={{width:72,height:72,borderRadius:18,background: darkMode ? 'rgba(92,164,255,0.08)' : 'rgba(37,99,235,0.06)',...fc,margin:'0 auto 16px'}}>
                  <Calendar style={{width:32,height:32,color: darkMode ? '#5CA4FF' : '#2563eb',opacity:0.6}} />
                </div>
                <p className="font-bold" style={{fontSize:15,...t.text}}>No recipes to plan with</p>
                <p style={{fontSize:13,marginTop:6,maxWidth:240,margin:'6px auto 0',...t.textMuted}}>Search for recipes and save your favorites first, then come back to plan your meals</p>
                <button onClick={() => { setShowMealPicker(null); setStep('search'); }} style={{marginTop:16,padding:'10px 24px',borderRadius:12,fontSize:13,fontWeight:700,background: darkMode ? 'rgba(190,255,70,0.08)' : 'rgba(239,68,68,0.06)',color: t.accent,border:'none',cursor:'pointer'}}>Find Recipes →</button>
              </div>
            ) : (
              <div className="space-y-2">
                {savedRecipes.length > 0 && (
                  <>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${textMutedClass} mb-2`}>Saved Recipes</p>
                    {savedRecipes.map((recipe, i) => (
                      <button key={`saved-${i}`} onClick={() => { addToMealPlan(selectedDate, showMealPicker, recipe); setShowMealPicker(null); }}
                        className={`w-full text-left p-3 rounded-lg border ${cardClass} ${hoverClass} transition`}>
                        <h4 className={`font-semibold ${textClass}`}>{recipe.name}</h4>
                        <p className={`text-xs ${textMutedClass}`}>{recipe.cookTime} · {recipe.difficulty}</p>
                      </button>
                    ))}
                  </>
                )}
                {recipeHistory.length > 0 && (
                  <>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${textMutedClass} mt-4 mb-2`}>Recently Cooked</p>
                    {recipeHistory.slice(0, 5).map((recipe, i) => (
                      <button key={`hist-${i}`} onClick={() => { addToMealPlan(selectedDate, showMealPicker, recipe); setShowMealPicker(null); }}
                        className={`w-full text-left p-3 rounded-lg border ${cardClass} ${hoverClass} transition`}>
                        <h4 className={`font-semibold ${textClass}`}>{recipe.name}</h4>
                        <p className={`text-xs ${textMutedClass}`}>{recipe.cookTime} · {new Date(recipe.cookedDate).toLocaleDateString()}</p>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== BOTTOM TAB BAR ==================== */}
      {onboardingDone && !cookMode && !showFullImage && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 border-t`}
          style={{background: darkMode ? 'rgba(12,15,20,0.95)' : 'rgba(255,255,255,0.97)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', borderColor: darkMode ? 'rgba(255,255,255,0.05)' : '#E5E7EB',
            boxShadow: darkMode ? '0 -4px 20px rgba(0,0,0,0.3)' : '0 -2px 16px rgba(0,0,0,0.04)'}}>
          <div role="navigation" aria-label="Main navigation" className="max-w-2xl mx-auto flex items-center justify-around" style={{padding:'6px 0 max(6px, env(safe-area-inset-bottom))'}}>
            {[
              { action: () => { reset(); }, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, label: 'Home', active: step === 'home' && !showSaved && !showShoppingList && !showSettings && !showTracker && !showStats && !showScanHistory },
              { action: () => { closeAllOverlays(); nav('capture'); }, icon: <Camera className="w-5 h-5" />, label: 'Scan', active: step === 'capture' || step === 'analyzing' || step === 'review' },
              { action: () => { closeAllOverlays(); nav('search'); }, icon: <Search className="w-5 h-5" />, label: 'Search', active: step === 'search' || step === 'results' },
              { action: () => { closeAllOverlays(); nav('home'); setShowSaved(true); }, icon: <Heart className="w-5 h-5" />, label: 'Saved', active: showSaved },
              { action: () => { closeAllOverlays(); nav('home'); setShowTracker(true); }, icon: <Star className="w-5 h-5" />, label: 'Track', active: showTracker },
            ].map((tab, i) => {
              const accentColor = t.accent;
              return (
                <button key={i} onClick={tab.action} aria-label={tab.label} aria-current={tab.active ? 'page' : undefined} className="flex flex-col items-center transition" style={{padding:'6px 14px',minWidth:56,gap:3,borderRadius:12,
                  background: tab.active ? (darkMode ? 'rgba(190,255,70,0.06)' : 'rgba(239,68,68,0.04)') : 'transparent'}}>
                  <div style={{color: tab.active ? accentColor : inactiveCol, transition:'color 0.2s, transform 0.2s', transform: tab.active ? 'scale(1.1)' : 'scale(1)'}}>{tab.icon}</div>
                  <span style={{fontSize:11,fontWeight:tab.active ? 700 : 500,color: tab.active ? accentColor : inactiveCol,letterSpacing:'0.2px'}}>{tab.label}</span>
                  <div style={{width: tab.active ? 4 : 0, height: tab.active ? 4 : 0, borderRadius:2, background: accentColor, transition:'all 0.3s ease-out'}} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
