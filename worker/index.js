// ---------------------------------------------------------------------------
// NimaRank Cloudflare Worker
//
// Bridges Trakteer donations to Firebase: Trakteer fires a webhook here, we
// verify it, parse the donor's Firebase UID out of the support message, work
// out which rank the amount unlocks, then write it into Firestore.
//
// Endpoints
//   POST /trakteer-webhook   Trakteer webhook receiver (configure in Trakteer)
//   GET  /status?uid=...     current rank + lifetime total for a UID
//   GET  /recent?limit=8     public list of recent supporters (name + amount)
//   GET  /health             simple health check
//
// Required secrets (wrangler secret put <NAME>):
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY,
//   TRAKTEER_WEBHOOK_TOKEN
// Optional vars (wrangler.toml [vars]):
//   DONATUR_MIN (default 5000), DONATUR_PLUS_MIN (default 10000)
// ---------------------------------------------------------------------------

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore';

const RANK_LEVELS = {
  donatur: 1,
  'donatur++': 2,
  moderator: 3,
  vip: 4,
  premium: 5,
  admin: 6,
};

// Ranks that were granted manually and must never be overwritten by a donation.
const PROTECTED_RANKS = ['moderator', 'vip', 'premium', 'admin'];

// Access tokens are cached per isolate until ~1 minute before expiry.
let cachedToken = { value: null, expiresAt: 0 };

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const corsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Webhook-Token, X-Trakteer-Token, Authorization',
});

const json = (body, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(), ...extraHeaders },
  });

// Tagged logger so every line is easy to find in the Cloudflare "Real-time
// logs" / `wrangler tail` output.
const log = (...args) => console.log('[nimarank]', ...args);
const logError = (...args) => console.error('[nimarank]', ...args);

// Length-safe constant-time-ish string comparison for the webhook token.
function safeEqual(a, b) {
  if (!a || !b) return false;
  const x = String(a);
  const y = String(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i += 1) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

function bytesToBase64Url(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (let i = 0; i < arr.length; i += 1) binary += String.fromCharCode(arr[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const strToBase64Url = (str) => bytesToBase64Url(new TextEncoder().encode(str));

// ---------------------------------------------------------------------------
// Google service-account auth (JWT -> OAuth2 access token)
// ---------------------------------------------------------------------------

async function importPrivateKey(pem) {
  const normalized = String(pem || '').replace(/\\n/g, '\n').trim();
  const body = normalized
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const raw = atob(body);
  const buffer = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) buffer[i] = raw.charCodeAt(i);
  return crypto.subtle.importKey(
    'pkcs8',
    buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function getAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken.value && cachedToken.expiresAt > now + 60) return cachedToken.value;

  const key = await importPrivateKey(env.FIREBASE_PRIVATE_KEY);
  const header = { alg: 'RSASSA-PKCS1-v1_5', typ: 'JWT' };
  const claims = {
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope: FIRESTORE_SCOPE,
    aud: TOKEN_ENDPOINT,
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${strToBase64Url(JSON.stringify(header))}.${strToBase64Url(JSON.stringify(claims))}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned),
  );
  const jwt = `${unsigned}.${bytesToBase64Url(new Uint8Array(signature))}`;

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Google auth failed: ${data.error_description || data.error || res.status}`);
  }
  cachedToken = { value: data.access_token, expiresAt: now + (Number(data.expires_in) || 3600) };
  return cachedToken.value;
}

// ---------------------------------------------------------------------------
// Firestore REST helpers (service account bypasses security rules)
// ---------------------------------------------------------------------------

const firestoreBase = (env) =>
  `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;

async function fsFetch(env, path, init = {}) {
  const token = await getAccessToken(env);
  return fetch(`${firestoreBase(env)}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === 'object') return { mapValue: { fields: toFirestoreFields(value) } };
  return { stringValue: String(value) };
}

function toFirestoreFields(obj) {
  const fields = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) fields[key] = toFirestoreValue(value);
  });
  return fields;
}

function fromFirestoreValue(value) {
  if (!value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('mapValue' in value) return fromFirestoreFields(value.mapValue?.fields || {});
  if ('arrayValue' in value) return (value.arrayValue?.values || []).map(fromFirestoreValue);
  return null;
}

function fromFirestoreFields(fields = {}) {
  const out = {};
  Object.entries(fields).forEach(([key, value]) => {
    out[key] = fromFirestoreValue(value);
  });
  return out;
}

async function fsGetDocument(env, collection, docId) {
  const res = await fsFetch(env, `/${collection}/${encodeURIComponent(docId)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore read failed (${res.status})`);
  const data = await res.json();
  return { id: docId, ...fromFirestoreFields(data.fields || {}) };
}

// PATCH with an update mask performs an upsert: creates the document when it is
// missing, otherwise only touches the listed fields.
async function fsPatchDocument(env, collection, docId, fields) {
  const mask = Object.keys(fields)
    .map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`)
    .join('&');
  const res = await fsFetch(env, `/${collection}/${encodeURIComponent(docId)}?${mask}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields: toFirestoreFields(fields) }),
  });
  if (!res.ok) throw new Error(`Firestore write failed (${res.status}): ${await res.text()}`);
  return res.json();
}

async function fsCreateDocument(env, collection, fields) {
  const res = await fsFetch(env, `/${collection}`, {
    method: 'POST',
    body: JSON.stringify({ fields: toFirestoreFields(fields) }),
  });
  if (!res.ok) throw new Error(`Firestore create failed (${res.status}): ${await res.text()}`);
  return res.json();
}

async function fsListDocuments(env, collection, pageSize = 50) {
  const res = await fsFetch(env, `/${collection}?pageSize=${encodeURIComponent(pageSize)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.documents || []).map((doc) => fromFirestoreFields(doc.fields || {}));
}

// ---------------------------------------------------------------------------
// Trakteer payload parsing
// ---------------------------------------------------------------------------

// Trakteer has sent slightly different payload shapes over time, so we look up
// a set of candidate keys and use whichever the payload actually contains.
const MESSAGE_KEYS = ['support_message', 'supportMessage', 'supporter_message', 'supporterMessage', 'message', 'note', 'pesan'];
const NAME_KEYS = ['supporter_name', 'supporterName', 'name', 'nama', 'from', 'donator_name', 'donatorName'];
const UNIT_KEYS = ['unit_name', 'unitName', 'item_name', 'itemName', 'unit', 'item'];
const QUANTITY_KEYS = ['quantity', 'qty', 'jumlah', 'count', 'banyak'];
const UNIT_PRICE_KEYS = ['unit_price', 'unitPrice', 'price', 'harga', 'harga_satuan'];
const TOTAL_KEYS = ['total', 'total_price', 'totalPrice', 'gross_amount', 'grossAmount', 'subtotal', 'amount', 'nominal'];
const ID_KEYS = ['support_id', 'supportId', 'transaction_id', 'transactionId', 'trx_id', 'trxId', 'id'];

function pick(payload, keys) {
  if (!payload || typeof payload !== 'object') return undefined;
  for (const key of keys) {
    const value = payload[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

// Coerce a value that may be a plain string or an object (e.g. Trakteer sends
// `unit` as { name, price }) into readable text.
function asText(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') {
    return String(
      value.name
        || value.unit_name
        || value.title
        || value.label
        || value.message
        || value.text
        || value.value
        || '',
    );
  }
  return String(value);
}

function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d]/g, '');
    return cleaned ? Number(cleaned) : 0;
  }
  return 0;
}

// Trakteer sometimes nests the meaningful fields (e.g. under `data`) and can
// send `unit` as an object such as { name: 'DONATUR++', price: 10000 }. Flatten
// all of that into one object of candidate fields before parsing.
function normalizePayload(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const flat = { ...raw };

  for (const key of ['data', 'donation', 'support', 'payload', 'transaction']) {
    const nested = raw[key];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      Object.assign(flat, nested);
    }
  }

  if (flat.unit && typeof flat.unit === 'object') {
    const unitObj = flat.unit;
    const unitName = unitObj.name || unitObj.unit_name || unitObj.title || '';
    if (unitName && !flat.unit_name) flat.unit_name = unitName;
    if (unitObj.price !== undefined && flat.price === undefined) flat.price = unitObj.price;
    // Simpan sebagai teks supaya pick() tidak menghasilkan "[object Object]".
    flat.unit = unitName;
  }

  if (flat.support && typeof flat.support === 'object' && flat.support.message && !flat.support_message) {
    flat.support_message = flat.support.message;
  }

  return flat;
}

// Fallback rank detection based on the Trakteer unit/role name. Needed when the
// webhook does not expose a usable amount (only the chosen role name).
function rankFromUnitName(name) {
  const text = String(name || '').toLowerCase();
  if (!text) return null;
  if (text.includes('++')) return 'donatur++';
  if (text.includes('donatur')) return 'donatur';
  return null;
}

// Pick the higher of two rank candidates (either may be null).
function higherRank(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  return (RANK_LEVELS[a] || 0) >= (RANK_LEVELS[b] || 0) ? a : b;
}

// Read the Trakteer unit price regardless of whether it is a plain field or a
// nested object. Returns 0 when unknown.
function resolveUnitPrice(payload) {
  return toNumber(pick(payload, UNIT_PRICE_KEYS));
}

// Extract the Firebase UID from the free-text support message. The donate page
// always embeds it as `NMRUID:<uid>`; we also accept a plain `UID:<uid>` in
// case a supporter writes it by hand.
const UID_PATTERNS = [
  /NMRUID\s*[:-]?\s*([A-Za-z0-9_-]{16,64})/i,
  /UID\s*[:-]?\s*([A-Za-z0-9_-]{16,64})/i,
  /\b([A-Za-z0-9]{28})\b/,
];

function extractUid(message) {
  const text = String(message || '');
  for (const pattern of UID_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

function resolveAmount(payload) {
  const total = toNumber(pick(payload, TOTAL_KEYS));
  if (total > 0) return total;
  const unitPrice = toNumber(pick(payload, UNIT_PRICE_KEYS));
  const quantity = Math.max(1, toNumber(pick(payload, QUANTITY_KEYS)) || 1);
  return unitPrice * quantity;
}

// Default threshold = harga unit Trakteer (DONATUR 5.000 / DONATUR++ 10.000).
function thresholds(env) {
  const donatur = Number(env.DONATUR_MIN);
  const donaturPlus = Number(env.DONATUR_PLUS_MIN);
  return {
    donatur: donatur > 0 ? donatur : 5000,
    'donatur++': donaturPlus > 0 ? donaturPlus : 10000,
  };
}

// Returns 'donatur++' | 'donatur' | null for a given IDR amount.
function tierForAmount(env, amount) {
  const limits = thresholds(env);
  if (amount >= limits['donatur++']) return 'donatur++';
  if (amount >= limits.donatur) return 'donatur';
  return null;
}

// Registers a Trakteer donation: always logs it, and upgrades the rank when the
// UID is present and the amount unlocks a tier.
async function applyDonation(env, rawPayload) {
  const payload = normalizePayload(rawPayload);
  const message = asText(pick(payload, MESSAGE_KEYS));
  const supporterName = asText(pick(payload, NAME_KEYS)) || 'Anonim';
  const unit = asText(pick(payload, UNIT_KEYS));
  const quantity = Math.max(1, toNumber(pick(payload, QUANTITY_KEYS)) || 1);
  const amount = resolveAmount(payload);
  const uid = extractUid(message);

  // Dua sinyal dipakai lalu diambil rank TERTINGGI supaya selalu adil:
  // 1. nama unit/role yang dipilih donor (paling eksplisit, mis. "DONATUR++")
  // 2. nominal yang dibayar (total, atau harga unit x qty)
  const rankByName = rankFromUnitName(unit);
  const rankByAmount = tierForAmount(env, amount);
  const grantedRank = higherRank(rankByName, rankByAmount);

  const nowIso = new Date().toISOString();
  const externalId = String(pick(payload, ID_KEYS) || `${Date.now()}`);
  const limits = thresholds(env);
  const status = !uid ? 'unmatched' : (grantedRank ? 'processed' : 'below_threshold');

  log('donation parsed', {
    supporterName,
    unit,
    unitPrice: resolveUnitPrice(payload),
    quantity,
    amount,
    uid,
    rankByName,
    rankByAmount,
    grantedRank,
    status,
    donaturMin: limits.donatur,
    donaturPlusMin: limits['donatur++'],
  });

  // The donation record always gets written (even if it cannot be matched) so
  // you can inspect every webhook that arrives. `rawPayload` is kept for
  // troubleshooting and can be deleted later.
  try {
    await fsCreateDocument(env, 'donations', {
      uid: uid || null,
      supporterName,
      message,
      unit,
      quantity,
      amount,
      rank: grantedRank || null,
      status,
      source: 'trakteer',
      externalId,
      createdAt: nowIso,
      rawPayload: rawPayload && typeof rawPayload === 'object' ? rawPayload : { value: rawPayload },
    });
  } catch (error) {
    logError('failed to write donation record', String(error?.message || error));
  }

  if (!uid) {
    return {
      ok: true,
      processed: false,
      reason: 'uid_not_found',
      amount,
      unit,
      message,
      hint: 'Pesan donasi harus memuat NMRUID:<uid>. Kalau donor membeli unit dari Trakteer, pastikan kolom pesan tetap diisi.',
    };
  }

  if (!grantedRank) {
    return {
      ok: true,
      processed: false,
      reason: 'below_threshold',
      amount,
      uid,
      hint: `Nominal ${amount} masih di bawah minimal ${limits.donatur} untuk rank donatur.`,
    };
  }


  const existing = await fsGetDocument(env, 'users', uid);
  const prevTotal = Number(existing?.donationTotal) || 0;
  const prevRank = existing?.rank || null;

  // Never downgrade: keep manually assigned / higher ranks (admin, moderator...).
  const keepExistingRank =
    PROTECTED_RANKS.includes(prevRank) ||
    (RANK_LEVELS[prevRank] || 0) > (RANK_LEVELS[grantedRank] || 0);

  const fields = {
    donationTotal: prevTotal + amount,
    donationCount: (Number(existing?.donationCount) || 0) + 1,
    lastDonationAt: nowIso,
    lastDonationRank: grantedRank,
    updatedAt: nowIso,
  };

  if (!keepExistingRank) {
    fields.rank = grantedRank;
    fields.rankSource = 'donation';
    fields.rankUpdatedAt = nowIso;
  }

  await fsPatchDocument(env, 'users', uid, fields);

  return {
    ok: true,
    processed: true,
    uid,
    amount,
    grantedRank,
    rank: keepExistingRank ? prevRank : grantedRank,
    rankChanged: !keepExistingRank,
    total: fields.donationTotal,
  };
}

// ---------------------------------------------------------------------------
// Request handlers
// ---------------------------------------------------------------------------

function verifyWebhookToken(request, env) {
  if (!env.TRAKTEER_WEBHOOK_TOKEN) return true; // no token configured -> open
  const url = new URL(request.url);
  const provided = String(
    url.searchParams.get('token') ||
      request.headers.get('x-webhook-token') ||
      request.headers.get('x-trakteer-token') ||
      (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '') ||
      '',
  ).trim();
  // Trim juga sisi secret: `wrangler secret put` kadang menyimpan newline/spasi.
  return safeEqual(provided, String(env.TRAKTEER_WEBHOOK_TOKEN).trim());
}

async function handleWebhook(request, env) {
  if (request.method !== 'POST') {
    // Dibuka lewat browser (GET) -> ini NORMAL, artinya worker sudah jalan.
    // Endpoint ini memang hanya menerima POST dari Trakteer.
    return json(
      {
        ok: false,
        error: 'Method not allowed',
        message:
          'Endpoint ini hanya menerima POST dari Trakteer. Kalau kamu membukanya lewat browser, hasil ini artinya worker sudah jalan dengan benar.',
        tokenTerkirim: Boolean(new URL(request.url).searchParams.get('token')),
      },
      405,
    );
  }

  if (!verifyWebhookToken(request, env)) {
    logError('webhook rejected: token tidak cocok');
    return json(
      {
        error: 'Unauthorized',
        hint: 'Token di URL/header tidak sama dengan secret TRAKTEER_WEBHOOK_TOKEN.',
      },
      401,
    );
  }

  const text = await request.text().catch(() => '');
  log('webhook body diterima:', text.slice(0, 2000));

  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = Object.fromEntries(new URLSearchParams(text).entries());
    }
  }

  try {
    const result = await applyDonation(env, payload || {});
    log('hasil:', result);
    return json(result, 200);
  } catch (error) {
    logError('processing failed:', String(error?.message || error), error?.stack);
    return json({ error: 'processing_failed', message: String(error?.message || error) }, 500);
  }
}

async function handleStatus(request, env) {
  const url = new URL(request.url);
  const uid = (url.searchParams.get('uid') || '').trim();
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(uid)) return json({ error: 'invalid_uid' }, 400);
  try {
    const user = await fsGetDocument(env, 'users', uid);
    return json({
      uid,
      rank: user?.rank || null,
      total: Number(user?.donationTotal) || 0,
      lastDonationAt: user?.lastDonationAt || null,
    });
  } catch (error) {
    return json({ error: 'status_failed', message: String(error?.message || error) }, 500);
  }
}

async function handleRecent(request, env) {
  const url = new URL(request.url);
  const raw = Number(url.searchParams.get('limit'));
  const limit = Math.min(Math.max(Number.isFinite(raw) ? raw : 8, 1), 30);
  try {
    const donations = await fsListDocuments(env, 'donations', 100);
    const list = donations
      .filter((d) => d.rank)
      .map((d) => ({
        name: d.supporterName || 'Anonim',
        amount: Number(d.amount) || 0,
        rank: d.rank || null,
        createdAt: d.createdAt || null,
      }))
      .slice(0, limit);
    return json({ donations: list });
  } catch (error) {
    return json({ donations: [], error: String(error?.message || error) }, 200);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    log(`${request.method} ${url.pathname}${url.search ? '?…' : ''}`);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    try {
      if (url.pathname === '/trakteer-webhook' || url.pathname === '/webhook') {
        return await handleWebhook(request, env);
      }
      if (url.pathname === '/status') {
        return await handleStatus(request, env);
      }
      if (url.pathname === '/recent') {
        return await handleRecent(request, env);
      }
      if (url.pathname === '/health' || url.pathname === '/') {
        return json({
          ok: true,
          service: 'nimarank-worker',
          endpoints: {
            webhook: 'POST /trakteer-webhook?token=...',
            status: 'GET /status?uid=...',
            recent: 'GET /recent?limit=8',
          },
          time: new Date().toISOString(),
        });
      }
      return json({ error: 'Not found' }, 404);
    } catch (error) {
      logError('internal error:', String(error?.message || error));
      return json({ error: 'internal_error', message: String(error?.message || error) }, 500);
    }
  },
};
