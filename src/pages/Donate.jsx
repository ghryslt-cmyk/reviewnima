import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/translations';
import { getUserRank } from '../lib/firebase';
import {
  DONATION_TIERS,
  DONATUR_MIN,
  TRAKTEER_URL,
  UID_MARKER,
  buildDonationMessage,
  buildTrakteerUrl,
  fetchDonationStatus,
  fetchRecentDonations,
  formatRupiah,
  getTierByAmount,
  getTierById,
  isValidUid,
  normalizeUid,
} from '../lib/donation';
import { RankLabel } from '../components/AdminBadge';
import {
  AlertCircle,
  BadgeCheck,
  Check,
  Copy,
  Crown,
  ExternalLink,
  Fingerprint,
  Gem,
  HandHeart,
  Heart,
  Info,
  Loader2,
  LogIn,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';

// Fully literal class strings per accent so Tailwind can detect them at build.
const ACCENTS = {
  sky: {
    ring: 'ring-2 ring-sky-400 ring-offset-2 ring-offset-white dark:ring-offset-black',
    cardBorder: 'border-sky-200 hover:border-sky-400 dark:border-sky-900/60 dark:hover:border-sky-500/70',
    chip: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
    icon: 'bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-500',
    glow: 'shadow-[0_18px_45px_-18px_rgba(56,189,248,0.75)]',
    button: 'bg-gradient-to-r from-sky-500 to-blue-600',
  },
  emerald: {
    ring: 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-black',
    cardBorder: 'border-emerald-200 hover:border-emerald-400 dark:border-emerald-900/60 dark:hover:border-emerald-500/70',
    chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    icon: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500',
    glow: 'shadow-[0_18px_45px_-18px_rgba(52,211,153,0.75)]',
    button: 'bg-gradient-to-r from-emerald-500 to-teal-600',
  },
  brand: {
    ring: 'ring-2 ring-brand-400 ring-offset-2 ring-offset-white dark:ring-offset-black',
    cardBorder: 'border-brand-200 hover:border-brand-400 dark:border-brand-900/60 dark:hover:border-brand-500/70',
    chip: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
    icon: 'bg-gradient-to-br from-brand-500 via-blue-500 to-cyan-500',
    glow: 'shadow-[0_18px_45px_-18px_rgba(49,130,255,0.75)]',
    button: 'bg-gradient-to-r from-brand-600 to-cyan-500',
  },
};

const POLITE_POLL_MS = 6000;
const MAX_POLLS = 100; // ~10 minutes of polling after a donation

const Donate = () => {
  const { user, isAuthenticated, login } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  const [uid, setUid] = useState('');
  const [selectedTierId, setSelectedTierId] = useState(DONATION_TIERS[0]?.id || 'donatur');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [rankInfo, setRankInfo] = useState({ uid: '', rank: null });
  const [flowStatus, setFlowStatus] = useState('idle'); // idle | waiting | active
  const [checking, setChecking] = useState(false);
  const [recent, setRecent] = useState([]);
  const [loginBusy, setLoginBusy] = useState(false);
  const pollRef = useRef({ timer: null, count: 0 });

  // The UID falls back to the signed-in account so it fills itself in, while
  // still letting the visitor type a different one by hand.
  const ownedUid = user?.uid ? normalizeUid(user.uid) : '';
  const normalizedUid = normalizeUid(uid || ownedUid);
  const isOwnUid = Boolean(ownedUid) && ownedUid === normalizedUid;

  const selectedTier = getTierById(selectedTierId);
  const customValue = Number(customAmount) || 0;
  const effectiveAmount = useCustomAmount ? customValue : (selectedTier?.min || 0);
  const grantedTier = getTierByAmount(effectiveAmount);
  const isAmountEnough = effectiveAmount >= DONATUR_MIN;
  const uidValid = isValidUid(normalizedUid);
  const canDonate = uidValid && isAmountEnough;
  const donationMessage = uidValid ? buildDonationMessage(normalizedUid) : '';
  const trakteerUrl = buildTrakteerUrl(TRAKTEER_URL, { message: donationMessage });
  const currentRank = uidValid && rankInfo.uid === normalizedUid ? rankInfo.rank : null;

  // Load the "thanks wall" once.
  useEffect(() => {
    let alive = true;
    fetchRecentDonations(8).then((list) => {
      if (alive) setRecent(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Reflect an already-owned rank whenever the active UID changes.
  useEffect(() => {
    if (!uidValid) return undefined;
    let alive = true;
    (async () => {
      let rank = null;
      const status = await fetchDonationStatus(normalizedUid);
      if (status?.rank) rank = status.rank;
      if (!rank && isOwnUid) {
        try {
          rank = await getUserRank(user.uid);
        } catch {
          rank = null;
        }
      }
      if (alive && rank) {
        setRankInfo({ uid: normalizedUid, rank });
        setFlowStatus('active');
      }
    })();
    return () => {
      alive = false;
    };
  }, [uidValid, normalizedUid, isOwnUid, user]);

  // Stop the background poller when the page unmounts.
  useEffect(
    () => () => {
      if (pollRef.current.timer) clearInterval(pollRef.current.timer);
    },
    [],
  );

  // Beri tahu Navbar (dan komponen lain) supaya badge rank langsung di-refresh
  // begitu rank aktif, tanpa perlu reload halaman.
  useEffect(() => {
    if (flowStatus === 'active' && currentRank) {
      window.dispatchEvent(new Event('nima-rank-updated'));
    }
  }, [flowStatus, currentRank]);

  const copyText = async (text, field) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField((prev) => (prev === field ? '' : prev)), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const stopPolling = () => {
    if (pollRef.current.timer) {
      clearInterval(pollRef.current.timer);
      pollRef.current.timer = null;
    }
    pollRef.current.count = 0;
  };

  // Resolve the rank for the current UID. Prefers the Cloudflare Worker (works
  // for guests too) and falls back to a direct Firestore read for the owner.
  const resolveRank = async () => {
    let rank = null;
    const status = await fetchDonationStatus(normalizedUid);
    if (status?.rank) rank = status.rank;
    if (!rank && isOwnUid) {
      try {
        rank = await getUserRank(user.uid);
      } catch {
        rank = null;
      }
    }
    if (rank) setRankInfo({ uid: normalizedUid, rank });
    return rank;
  };

  const startPolling = () => {
    stopPolling();
    pollRef.current.count = 0;
    pollRef.current.timer = setInterval(async () => {
      pollRef.current.count += 1;
      const rank = await resolveRank();
      if (rank) {
        setFlowStatus('active');
        stopPolling();
        return;
      }
      if (pollRef.current.count >= MAX_POLLS) stopPolling();
    }, POLITE_POLL_MS);
  };


  const handleLogin = async () => {
    setLoginBusy(true);
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoginBusy(false);
    }
  };

  const handleDonate = () => {
    if (!canDonate) return;
    if (typeof window !== 'undefined') window.open(trakteerUrl, '_blank', 'noopener,noreferrer');
    setFlowStatus('waiting');
    startPolling();
  };

  const handleCheckNow = async () => {
    setChecking(true);
    const rank = await resolveRank();
    setChecking(false);
    if (rank) {
      setFlowStatus('active');
      stopPolling();
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 transition-all duration-300 dark:bg-black sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------------------- Hero */}
        <div className="relative mb-6 overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-glow sm:mb-8 sm:p-10">
          <div className="pointer-events-none absolute -right-10 -top-10 opacity-20">
            <Heart size={180} />
          </div>
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur">
              <Sparkles size={13} /> {t('donate.eyebrow')}
            </span>
            <h1 className="mt-3 font-display text-2xl font-extrabold sm:text-4xl">
              {t('donate.title')}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">
              {t('donate.subtitle')}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2 text-xs font-semibold sm:text-sm">
              <Info size={15} />
              {t('donate.noBenefitsBadge')}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------- Current rank */}
        {currentRank && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-500/10 sm:mb-8">
            <BadgeCheck className="shrink-0 text-emerald-600 dark:text-emerald-400" size={22} />
            <p className="min-w-0 flex-1 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              {t('donate.alreadyRanked')}
            </p>
            <span className="shrink-0">
              <RankLabel rank={currentRank} />
            </span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ------------------------------------------------- Left: the steps */}
          <div className="space-y-6 lg:col-span-2">
            {/* STEP 1 - UID */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card dark:border-gray-800 dark:bg-gray-900 sm:p-6">
              <div className="mb-4 flex items-start gap-3">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white ${ACCENTS.brand.icon}`}>1</span>
                <div>
                  <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                    {t('donate.step1Title')}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('donate.step1Desc')}</p>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="mb-4 flex flex-col gap-3 rounded-xl border border-brand-200 bg-brand-50 p-3 dark:border-brand-900/60 dark:bg-brand-500/10 sm:flex-row sm:items-center">
                  <p className="flex-1 text-sm text-brand-800 dark:text-brand-200">{t('donate.loginPrompt')}</p>
                  <button
                    onClick={handleLogin}
                    disabled={loginBusy}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                  >
                    {loginBusy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                    {t('donate.loginCta')}
                  </button>
                </div>
              )}


              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t('donate.uidLabel')}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Fingerprint className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-500 dark:text-brand-400" size={18} />
                  <input
                    type="text"
                    value={uid || ownedUid}
                    onChange={(e) => setUid(e.target.value)}
                    placeholder={t('donate.uidPlaceholder')}
                    spellCheck={false}
                    autoComplete="off"
                    className="w-full rounded-lg border-2 border-gray-300 bg-white py-2.5 pl-10 pr-3 font-mono text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-black dark:text-white"
                  />
                </div>
                <button
                  onClick={() => copyText(normalizedUid, 'uid')}
                  disabled={!uidValid}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {copiedField === 'uid' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  {copiedField === 'uid' ? t('donate.copied') : t('donate.copyUid')}
                </button>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                {uid && (
                  <span className={`inline-flex items-center gap-1 font-medium ${uidValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {uidValid ? <Check size={13} /> : <AlertCircle size={13} />}
                    {uidValid ? t('donate.uidValid') : t('donate.uidInvalid')}
                  </span>
                )}
                {uid && isOwnUid && (
                  <span className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400">
                    <User size={13} /> {t('donate.autofilled')}
                  </span>
                )}
                <Link to="/profile" className="ml-auto inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline dark:text-brand-400">
                  {t('donate.openProfile')} <ExternalLink size={12} />
                </Link>
              </div>
            </section>

            {/* STEP 2 - Rank tier */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card dark:border-gray-800 dark:bg-gray-900 sm:p-6">
              <div className="mb-4 flex items-start gap-3">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white ${ACCENTS.brand.icon}`}>2</span>
                <div>
                  <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                    {t('donate.step2Title')}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('donate.step2Desc')}</p>
                </div>
              </div>


              <div className="grid gap-3 sm:grid-cols-2">
                {DONATION_TIERS.map((tier) => {
                  const accent = ACCENTS[tier.accent] || ACCENTS.brand;
                  const isSelected = !useCustomAmount && selectedTierId === tier.id;
                  const Icon = tier.accent === 'emerald' ? Gem : Heart;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => {
                        setUseCustomAmount(false);
                        setSelectedTierId(tier.id);
                      }}
                      className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300 ${accent.cardBorder} ${
                        isSelected ? `${accent.ring} ${accent.glow}` : 'shadow-sm hover:-translate-y-0.5'
                      }`}
                    >
                      {tier.popular && (
                        <span className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${accent.chip}`}>
                          <Sparkles size={10} /> {t('donate.popular')}
                        </span>
                      )}
                      <div className="flex items-center gap-3">
                        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-md ${accent.icon}`}>
                          <Icon size={20} strokeWidth={2.5} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-display text-base font-extrabold text-gray-900 dark:text-white">{tier.label}</p>
                          <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">{tier.tagline}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t('donate.minDonation')}</span>
                        <span className="text-lg font-extrabold text-gray-900 dark:text-white">{formatRupiah(tier.min)}</span>
                      </div>
                      <div className="mt-3">
                        <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${isSelected ? accent.chip : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                          {isSelected ? <Check size={12} /> : null}
                          {isSelected ? t('donate.selected') : t('donate.select')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-3 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setUseCustomAmount((prev) => !prev)}
                  className="flex w-full items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200"
                >
                  <span className={`grid h-5 w-5 place-items-center rounded border-2 ${useCustomAmount ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-400 dark:border-gray-600'}`}>
                    {useCustomAmount && <Check size={12} />}
                  </span>
                  {t('donate.customTitle')}
                </button>
                {useCustomAmount && (
                  <div className="mt-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500 dark:text-gray-400">Rp</span>
                      <input
                        type="number"
                        min={DONATUR_MIN}
                        step="1000"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder={t('donate.customPlaceholder')}
                        className="w-full rounded-lg border-2 border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-black dark:text-white"
                      />
                    </div>
                    <p className={`mt-2 text-xs font-medium ${isAmountEnough ? 'text-gray-500 dark:text-gray-400' : 'text-red-500'}`}>
                      {isAmountEnough
                        ? `${t('donate.customWillGet')}: ${grantedTier ? grantedTier.label : '—'}`
                        : `${t('donate.customBelow')} ${formatRupiah(DONATUR_MIN)}.`}
                    </p>
                  </div>
                )}
              </div>
            </section>


            {/* STEP 3 - Confirm & donate */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card dark:border-gray-800 dark:bg-gray-900 sm:p-6">
              <div className="mb-4 flex items-start gap-3">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white ${ACCENTS.brand.icon}`}>3</span>
                <div>
                  <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                    {t('donate.step3Title')}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('donate.step3Desc')}</p>
                </div>
              </div>

              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t('donate.messageLabel')}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <code className={`flex-1 overflow-x-auto rounded-lg border-2 px-3 py-2.5 font-mono text-sm ${
                  donationMessage
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-200'
                    : 'border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                }`}>
                  {donationMessage || `${UID_MARKER}:<UID kamu>`}
                </code>
                <button
                  onClick={() => copyText(donationMessage, 'message')}
                  disabled={!donationMessage}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {copiedField === 'message' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  {copiedField === 'message' ? t('donate.copied') : t('donate.copyMessage')}
                </button>
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Info size={13} className="mt-0.5 shrink-0" /> {t('donate.messageHelp')}
              </p>

              <button
                onClick={handleDonate}
                disabled={!canDonate}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-display text-base font-extrabold text-white transition-transform disabled:cursor-not-allowed disabled:opacity-50 ${ACCENTS.brand.button} ${
                  canDonate ? 'shadow-glow hover:scale-[1.02]' : ''
                }`}
              >
                <HandHeart size={20} />
                {t('donate.donateNow')}
                {grantedTier ? <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs">{grantedTier.label}</span> : null}
                <ExternalLink size={16} />
              </button>
              <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">{t('donate.payNote')}</p>

              {/* Status feedback */}
              {flowStatus === 'waiting' && (
                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/60 dark:bg-amber-500/10 sm:flex-row sm:items-center">
                  <Loader2 className="shrink-0 animate-spin text-amber-600 dark:text-amber-400" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-200">{t('donate.waitingTitle')}</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">{t('donate.waitingDesc')}</p>
                  </div>
                  <button
                    onClick={handleCheckNow}
                    disabled={checking}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-400 px-3 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60 dark:text-amber-200 dark:hover:bg-amber-500/20"
                  >
                    {checking ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                    {t('donate.checkNow')}
                  </button>
                </div>
              )}

              {flowStatus === 'active' && (
                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/60 dark:bg-emerald-500/10 sm:flex-row sm:items-center">
                  <BadgeCheck className="shrink-0 text-emerald-600 dark:text-emerald-400" size={22} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">{t('donate.activeTitle')}</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">{t('donate.activeDesc')}</p>
                  </div>
                  {currentRank && <span className="shrink-0"><RankLabel rank={currentRank} /></span>}
                </div>
              )}
            </section>
          </div>


          {/* --------------------------------------------- Right: summary + notes */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-gray-900 dark:text-white">
                <Crown size={18} className="text-brand-500" /> {t('donate.summaryTitle')}
              </h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('donate.summaryUid')}</dt>
                  <dd className="mt-0.5 truncate font-mono text-gray-900 dark:text-white">
                    {normalizedUid || <span className="text-gray-400">{t('donate.notSelected')}</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('donate.summaryRank')}</dt>
                  <dd className="mt-0.5">
                    {grantedTier ? <RankLabel rank={grantedTier.rank} /> : <span className="text-gray-400">{t('donate.notSelected')}</span>}
                  </dd>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-3 dark:border-gray-800">
                  <dt className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('donate.summaryAmount')}</dt>
                  <dd className="mt-0.5 font-display text-2xl font-extrabold text-gray-900 dark:text-white">
                    {formatRupiah(effectiveAmount)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/60">
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-gray-900 dark:text-white">
                <Info size={16} className="text-brand-500" /> {t('donate.notesTitle')}
              </h3>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex gap-2"><span className="text-brand-500">•</span> {t('donate.noteNoPerks')}</li>
                <li className="flex gap-2"><span className="text-brand-500">•</span> {t('donate.noteSincere')}</li>
                <li className="flex gap-2"><span className="text-brand-500">•</span> {t('donate.noteLate')}</li>
                <li className="flex gap-2"><span className="text-brand-500">•</span> {t('donate.noteAdmin')}</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-gray-900 dark:text-white">
                <Heart size={16} className="text-rose-500" /> {t('donate.recentTitle')}
              </h3>
              {recent.length > 0 ? (
                <ul className="space-y-2">
                  {recent.map((entry, index) => (
                    <li key={`${entry.name}-${index}`} className="flex items-center gap-2 text-xs">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 text-[11px] font-bold text-white">
                        {(entry.name || 'A').charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-gray-800 dark:text-gray-200">{entry.name || t('donate.recentAnonymous')}</span>
                      <span className="shrink-0 font-semibold text-gray-500 dark:text-gray-400">{formatRupiah(entry.amount)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('donate.recentEmpty')}</p>
              )}
            </div>
          </aside>
        </div>

        {/* ------------------------------------------------------------- Footer CTA */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center dark:border-gray-800 dark:bg-gray-900/60">
          <Gem className="mx-auto mb-2 text-brand-500" size={22} />
          <p className="mx-auto max-w-xl text-sm text-gray-600 dark:text-gray-400">{t('donate.footerNote')}</p>
        </div>
      </div>
    </div>
  );
};

export default Donate;

