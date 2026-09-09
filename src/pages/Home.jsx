import { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { getReviews, getAllAnime, getAnnouncements } from '../lib/firebase';
import ReviewCard from '../components/ReviewCard';
import Layout from '../components/Layout';
import { fetchAnimeNews } from '../lib/animeNews';
import {
  Sparkles, Star, Newspaper, Play, ArrowRight, Megaphone, Clock, Film,
  CalendarDays, Info, Mail, Shield, FileText, BookOpen, Heart, ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/translations';
import heroVideo from '../assets/cake-by-the-ocean-amv-mix-anime-mix-1080-ytshorts.savetube.me.mp4';

const stripHtml = (html = '') =>
  String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const SectionHeading = ({ icon: Icon, title }) => (
  <div className="mb-6 flex items-center gap-3">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
      <Icon size={20} />
    </span>
    <h2 className="font-display text-xl font-bold sm:text-2xl md:text-3xl text-gradient-static">{title}</h2>
  </div>
);

const Home = memo(() => {
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const [reviews, setReviews] = useState([]);
  const [news, setNews] = useState([]);
  const [latestAnime, setLatestAnime] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [reviewsData, animeList, announcementsData] = await Promise.all([
        getReviews(),
        getAllAnime(),
        getAnnouncements(),
      ]);

      const sortedReviews = [...reviewsData].sort((a, b) => {
        const ta = a.createdAt?.toDate?.() || a.createdAt || 0;
        const tb = b.createdAt?.toDate?.() || b.createdAt || 0;
        return new Date(tb) - new Date(ta);
      });
      setReviews(sortedReviews);

      const sortedAnime = [...animeList].sort((a, b) => {
        const ta = a.createdAt?.toDate?.() || a.createdAt || 0;
        const tb = b.createdAt?.toDate?.() || b.createdAt || 0;
        return new Date(tb) - new Date(ta);
      });
      setLatestAnime(sortedAnime[0] || null);

      const now = Date.now();
      const active = announcementsData.filter((a) => {
        if (!a.expiresAt) return true;
        const exp = a.expiresAt?.toDate?.() ? a.expiresAt.toDate().getTime() : new Date(a.expiresAt).getTime();
        return !Number.isNaN(exp) && exp > now;
      });
      setAnnouncements(active);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await fetchAnimeNews();
        setNews(newsData.slice(0, 12));
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
    loadNews();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6fb]">
        <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-brand-500"></div>
      </div>
    );
  }

  const animeTitle = latestAnime?.animeData?.title?.english || latestAnime?.animeData?.title?.romaji || '';
  const animeCover = latestAnime?.animeData?.coverImage?.extraLarge || latestAnime?.animeData?.coverImage?.large;
  const animeBanner = latestAnime?.animeData?.bannerImage || animeCover;
  const animeDesc = stripHtml(latestAnime?.animeData?.description);
  const animeGenres = latestAnime?.animeData?.genres || [];
  const animeScore = latestAnime?.animeData?.averageScore;
  const animeEpisodes = latestAnime?.animeData?.episodes;
  const latestFive = reviews.slice(0, 5);

  return (
    <Layout>
      {/* HERO */}
      <section className="relative flex min-h-[420px] items-center justify-center overflow-hidden sm:min-h-[480px] lg:min-h-[600px]">
        <div className="absolute inset-0">
          <video autoPlay loop muted playsInline className="h-full w-full object-cover" preload="metadata" src={heroVideo} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md sm:text-sm">
              <Sparkles size={14} className="text-cyan-300" />
              {t('home.heroBadge') || 'Anime Review Platform'}
            </span>
          </div>
          <h1 className="font-display mt-5 text-5xl font-bold leading-none text-white drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Review<span className="text-gradient">Nima</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-light text-white/85 drop-shadow-md sm:text-xl md:text-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {t('home.heroSubtitle')}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/reviews" className="group inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105 sm:text-base">
              <BookOpen size={18} />
              {t('home.exploreReviews') || 'Explore Reviews'}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/anime" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:text-base">
              <Play size={18} />
              {t('home.watchAnime') || 'Watch Anime'}
            </Link>
          </div>
        </div>
      </section>

      {/* NEWS TICKER */}
      <section className="relative z-10 border-y border-black/5 bg-white/80 backdrop-blur-md dark:bg-white/5">
        <div className="mx-auto flex max-w-[1500px] items-center">
          <div className="flex shrink-0 items-center gap-2 border-r border-black/10 bg-brand-gradient px-4 py-3 text-sm font-bold uppercase tracking-wide text-white sm:px-6">
            <Newspaper size={16} />
            <span className="hidden sm:inline">{t('news.title') || 'News'}</span>
          </div>
          <div className="relative flex-1 overflow-hidden">
            {news.length > 0 ? (
              <div className="flex animate-ticker whitespace-nowrap py-3" style={{ width: 'max-content' }}>
                {[0, 1].map((dup) => (
                  <div key={dup} className="flex items-center">
                    {news.map((item) => (
                      <Link
                        key={`${dup}-${item.id}`}
                        to={`/news/${item.id}`}
                        className="mx-4 inline-flex items-center gap-2 text-sm text-gray-700 transition-colors hover:text-brand-600 dark:text-gray-200"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                        {item.title}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 px-4 text-sm text-gray-500">{t('home.noNews') || 'Loading news…'}</div>
            )}
          </div>
        </div>
      </section>


      {/* ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <section className="px-4 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1500px] space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm dark:border-amber-500/20 dark:from-amber-500/10 dark:to-orange-500/10"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400 text-amber-950 shadow">
                  <Megaphone size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                      {a.title || 'Announcement'}
                    </span>
                    {a.expiresAt && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600/80 dark:text-amber-300/70">
                        <Clock size={12} />
                        {new Date(a.expiresAt?.toDate?.() || a.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-100/80">{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LATEST ANIME (featured) */}
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <SectionHeading icon={Film} title={t('home.latestAnime') || 'Anime Terbaru'} />
          {latestAnime ? (
            <Link to={`/anime/${latestAnime.anilistId}`} className="group block">
              <div className="card-hover relative overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-800 shadow-soft">
                <div className="relative h-64 sm:h-80 md:h-96">
                  {animeBanner ? (
                    <img src={animeBanner} alt={animeTitle} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-400" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-glow">
                    <Sparkles size={13} />
                    {t('home.newlyAdded') || 'Baru Ditambahkan'}
                  </span>

                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                    <div className="flex flex-wrap gap-2">
                      {animeGenres.slice(0, 4).map((g) => (
                        <span key={g} className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-md">
                          {g}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-display mt-3 text-2xl font-bold text-white drop-shadow-lg sm:text-3xl md:text-4xl">
                      {animeTitle}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                      {animeScore && (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
                          <Star size={15} fill="currentColor" /> {(animeScore / 10).toFixed(1)}
                        </span>
                      )}
                      {animeEpisodes && (
                        <span className="inline-flex items-center gap-1">
                          <Film size={14} /> {animeEpisodes} {t('home.episodes') || 'eps'}
                        </span>
                      )}
                      {latestAnime.animeData?.seasonYear && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={14} /> {latestAnime.animeData.seasonYear}
                        </span>
                      )}
                    </div>
                    {animeDesc && (
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 line-clamp-2 sm:text-base">
                        {animeDesc}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-gray-700">
              {t('home.noAnime') || 'Belum ada anime. Tambahkan lewat Admin Panel.'}
            </div>
          )}
        </div>
      </section>


      {/* LATEST REVIEWS (5 cards) */}
      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <SectionHeading icon={BookOpen} title={t('home.latestReviews')} />
            <Link to="/reviews" className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition-colors hover:bg-brand-50 dark:border-brand-500/30 dark:bg-transparent dark:text-brand-300">
              {t('home.viewAllReviews') || 'Semua Review'}
              <ChevronRight size={16} />
            </Link>
          </div>

          {latestFive.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-5">
              {latestFive.map((review) => (
                <ReviewCard key={review.id} review={review} compact />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">{t('home.noReviews')}</p>
          )}
        </div>
      </section>

      {/* ABOUT & FOOTER */}
      <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
                  <Sparkles size={20} />
                </span>
                <span className="font-display text-xl font-bold">
                  Review<span className="text-gradient-static">Nima</span>
                </span>
              </div>
              <h3 className="font-display mt-4 text-lg font-bold text-gray-900 dark:text-white">{t('home.aboutTitle')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{t('home.aboutDescription')}</p>
            </div>

            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">{t('home.pages')}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {[
                  { to: '/', icon: Info, label: t('home.homePage') },
                  { to: '/reviews', icon: BookOpen, label: t('home.reviewsPage') },
                  { to: '/top-favorites', icon: Heart, label: t('home.topFavoritesPage') },
                  { to: '/anime', icon: Film, label: t('nav.anime') },
                  { to: '/news', icon: Newspaper, label: t('nav.news') },
                ].map(({ to, icon: Icon, label }) => (
                  <li key={to}>
                    <Link to={to} className="group inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-300">
                      <Icon size={15} className="text-gray-400 transition-colors group-hover:text-brand-500" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">{t('home.contactPolicies')}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {[
                  { to: '/contact', icon: Mail, label: t('home.contactUs') },
                  { to: '/privacy', icon: Shield, label: t('home.privacyPolicy') },
                  { to: '/terms', icon: FileText, label: t('home.termsOfService') },
                ].map(({ to, icon: Icon, label }) => (
                  <li key={to}>
                    <Link to={to} className="group inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-300">
                      <Icon size={15} className="text-gray-400 transition-colors group-hover:text-brand-500" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-6 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-500 sm:flex-row">
            <p>© {new Date().getFullYear()} ReviewNima. {t('home.rights') || 'All rights reserved.'}</p>
            <p className="flex items-center gap-1.5">
              {t('home.madeWith') || 'Dibuat dengan'} <Heart size={13} className="text-fuchsia-500" fill="currentColor" /> {t('home.forAnimeFans') || 'untuk pecinta anime'}
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
});

Home.displayName = 'Home';

export default Home;

