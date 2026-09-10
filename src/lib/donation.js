// ---------------------------------------------------------------------------
// Donation / rank configuration & helpers.
//
// Flow: user copies their Firebase UID from the profile page, pastes it on the
// /donate page, picks a rank tier, then donates through Trakteer. Trakteer
// fires a webhook to our Cloudflare Worker which verifies the payment and
// writes the rank (`donatur` / `donatur++`) back into Firestore.
//
// IMPORTANT: the tiers below must stay in sync with the thresholds configured
// on the Cloudflare Worker (see `worker/index.js`). Both sides default to the
// same values but can be overridden through environment variables.
// ---------------------------------------------------------------------------

// Parse a positive integer from an env value with a safe fallback.
const readAmount = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Minimum donation (in IDR) required to unlock each rank.
// NOTE: these values must match the Trakteer unit prices:
//   unit "DONATUR"   = Rp5.000  -> donatur
//   unit "DONATUR++" = Rp10.000 -> donatur++
export const DONATUR_MIN = readAmount(import.meta.env.VITE_DONATUR_MIN, 5000);
export const DONATUR_PLUS_MIN = readAmount(import.meta.env.VITE_DONATUR_PLUS_MIN, 10000);

// Trakteer tip page (e.g. https://trakteer.id/reviewnima/tip).
export const TRAKTEER_URL = import.meta.env.VITE_TRAKTEER_URL || 'https://trakteer.id';

// Cloudflare Worker base URL (webhook + status API). Empty means "not wired yet".
export const DONATION_WORKER_URL = (import.meta.env.VITE_DONATION_WORKER_URL || '').replace(/\/+$/, '');

// Rank tiers shown on the donate page. No perks are listed on purpose: this is
// a pure "thank you" badge for people who donate sincerely.
export const DONATION_TIERS = [
  {
    id: 'donatur',
    rank: 'donatur',
    label: 'DONATUR',
    min: DONATUR_MIN,
    accent: 'sky',
    tagline: 'Rank biru untuk pendukung setia',
  },
  {
    id: 'donatur++',
    rank: 'donatur++',
    label: 'DONATUR++',
    min: DONATUR_PLUS_MIN,
    accent: 'emerald',
    tagline: 'Rank hijau untuk pendukung luar biasa',
    popular: true,
  },
];

// Rank precedence used only for display/ordering on the client.
export const RANK_LEVELS = {
  donatur: 1,
  'donatur++': 2,
  moderator: 3,
  vip: 4,
  premium: 5,
  admin: 6,
};

export const getTierById = (id) => DONATION_TIERS.find((tier) => tier.id === id) || null;

// Returns the tier unlocked by a given donation amount (or null when below the
// lowest threshold). Mirrors the worker logic so the UI can preview the result.
export const getTierByAmount = (amount) => {
  const value = Number(amount) || 0;
  for (let i = DONATION_TIERS.length - 1; i >= 0; i -= 1) {
    if (value >= DONATION_TIERS[i].min) return DONATION_TIERS[i];
  }
  return null;
};

// Firebase UIDs are ~28 alphanumeric characters. Keep the check permissive
// enough for future formats but strict enough to reject typos.
export const normalizeUid = (value) => String(value || '').trim();

export const isValidUid = (value) => /^[A-Za-z0-9_-]{16,64}$/.test(normalizeUid(value));

// Marker embedded in the Trakteer support message so the worker can find the
// UID even when the supporter adds their own text around it.
export const UID_MARKER = 'NMRUID';

export const buildDonationMessage = (uid) => `${UID_MARKER}:${normalizeUid(uid)}`;

// Build the Trakteer tip URL. Unknown query params are ignored by Trakteer, so
// we safely prefill `message`/`qty` when supported while still asking the user
// to paste the message manually as a fallback.
export const buildTrakteerUrl = (baseUrl, { message, quantity } = {}) => {
  const base = baseUrl || TRAKTEER_URL;
  try {
    const url = new URL(base);
    if (message) url.searchParams.set('message', message);
    const qty = Number(quantity);
    if (Number.isFinite(qty) && qty > 0) url.searchParams.set('qty', String(Math.floor(qty)));
    return url.toString();
  } catch {
    return base;
  }
};

export const formatRupiah = (amount) =>
  `Rp${(Number(amount) || 0).toLocaleString('id-ID')}`;

// Ask the Cloudflare Worker for the current rank/total of a UID. Returns null
// when the worker URL is not configured or the request fails, so callers can
// gracefully fall back to reading Firestore directly.
export const fetchDonationStatus = async (uid) => {
  if (!DONATION_WORKER_URL) return null;
  if (!isValidUid(uid)) return null;
  try {
    const res = await fetch(`${DONATION_WORKER_URL}/status?uid=${encodeURIComponent(normalizeUid(uid))}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      rank: data?.rank || null,
      total: Number(data?.total) || 0,
      lastDonationAt: data?.lastDonationAt || null,
    };
  } catch {
    return null;
  }
};

// Public list of recent supporters (name + amount only, no UIDs). Used for the
// "thanks wall" on the donate page. Returns [] when unavailable.
export const fetchRecentDonations = async (limit = 8) => {
  if (!DONATION_WORKER_URL) return [];
  try {
    const res = await fetch(`${DONATION_WORKER_URL}/recent?limit=${encodeURIComponent(limit)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.donations) ? data.donations : [];
  } catch {
    return [];
  }
};

// Resolve ranks for several emails at once through the Cloudflare Worker.
//
// Why not read Firestore directly? `firestore.rules` only lets the owner (or the
// admin) read the `users` collection, so a visitor's query for another user's
// document is rejected - which is why comment badges never appeared. The worker
// uses a service account, so it can look them up for everyone.
//
// Returns an object keyed by LOWERCASE email: { "user@gmail.com": "donatur" }.
export const fetchRanksByEmail = async (emails) => {
  const unique = [
    ...new Set(
      (emails || [])
        .map((email) => String(email || '').trim().toLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, 30);

  if (!DONATION_WORKER_URL || unique.length === 0) return {};

  try {
    const res = await fetch(
      `${DONATION_WORKER_URL}/ranks?emails=${encodeURIComponent(unique.join(','))}`,
    );
    if (!res.ok) return {};
    const data = await res.json();
    return data?.ranks && typeof data.ranks === 'object' ? data.ranks : {};
  } catch {
    return {};
  }
};
