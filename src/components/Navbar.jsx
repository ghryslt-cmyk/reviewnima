import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/translations';
import { Home, BookOpen, User, LogOut, Shield, Menu, X, Heart, Newspaper, Globe, Languages, Clapperboard, Mail } from 'lucide-react';
import { useState, useCallback, useEffect, memo } from 'react';
import { getUserRank, getUserRankByEmail } from '../lib/firebase';
import { RankMedallion, rankNameClass, rankGlowClass, rankAvatarBgClass } from './AdminBadge';

const Navbar = () => {
  const { user, logout, checkAdmin, isAuthenticated } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation(language);
  const isAdminUser = checkAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [animeDropdownOpen, setAnimeDropdownOpen] = useState(false);
  const [blogDropdownOpen, setBlogDropdownOpen] = useState(false);
  const [userRank, setUserRank] = useState(null);
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownOpen) {
        const container = document.querySelector('.language-selector-container');
        if (container && !container.contains(event.target)) {
          setLanguageDropdownOpen(false);
        }
      }
      if (animeDropdownOpen) {
        const container = document.querySelector('.anime-dropdown-container');
        if (container && !container.contains(event.target)) {
          setAnimeDropdownOpen(false);
        }
      }
      if (blogDropdownOpen) {
        const container = document.querySelector('.blog-dropdown-container');
        if (container && !container.contains(event.target)) {
          setBlogDropdownOpen(false);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [languageDropdownOpen, animeDropdownOpen, blogDropdownOpen]);

  const handleLanguageChange = useCallback((lang) => {
    changeLanguage(lang);
    setLanguageDropdownOpen(false);
  }, [changeLanguage]);

  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout]);

  const languages = [
    { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'jp', name: '日本語', flag: '🇯🇵' }
  ];

  // Kelas bersama untuk item menu mobile supaya rapi dan konsisten.
  const mobileLinkClass =
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800';

  // Fetch user rank. Dijalankan ulang setiap kali halaman berpindah, saat window
  // kembali fokus, dan saat event 'nima-rank-updated' dikirim (dikirim halaman
  // /donate begitu rank baru aktif) - supaya badge rank langsung muncul tanpa
  // perlu reload.
  useEffect(() => {
    let alive = true;

    const fetchUserRank = async () => {
      if (!isAuthenticated || !user?.uid) {
        if (alive) setUserRank(null);
        return;
      }
      try {
        let rank = await getUserRank(user.uid);

        // Fallback to email-based lookup if rank not found
        if (!rank && user?.email) {
          rank = await getUserRankByEmail(user.email);
        }

        if (alive) setUserRank(rank);
      } catch (error) {
        console.error('Error fetching user rank:', error);
      }
    };

    fetchUserRank();
    window.addEventListener('nima-rank-updated', fetchUserRank);
    window.addEventListener('focus', fetchUserRank);
    return () => {
      alive = false;
      window.removeEventListener('nima-rank-updated', fetchUserRank);
      window.removeEventListener('focus', fetchUserRank);
    };
  }, [isAuthenticated, user, location.pathname]);

  return (
    <nav className="glass relative z-50 border-b border-gray-200/70 text-gray-900 shadow-sm dark:border-gray-800/70 dark:text-white">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-6">
            <Link to="/" className="group flex items-center gap-2 text-xl font-bold sm:text-2xl">
              <img
                src="/logo.png"
                alt="ReviewNima"
                className="h-9 w-9 rounded-xl object-contain shadow-glow transition-transform group-hover:scale-105"
              />
              <span className="font-display">
                Review<span className="text-gradient-static">Nima</span>
              </span>
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300">
                <Home size={20} />
                <span>{t('nav.home')}</span>
              </Link>
              
              {/* Anime Dropdown */}
              <div className="relative anime-dropdown-container">
                <button
                  onClick={() => setAnimeDropdownOpen(!animeDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
                >
                  <Clapperboard size={20} />
                  <span>{t('nav.anime')}</span>
                </button>
                
                {animeDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <Link
                      to="/news"
                      className="flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                      onClick={() => setAnimeDropdownOpen(false)}
                    >
                      <Newspaper size={18} />
                      <span>{t('nav.news')}</span>
                    </Link>
                    <Link
                      to="/anime"
                      className="flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                      onClick={() => setAnimeDropdownOpen(false)}
                    >
                      <Clapperboard size={18} />
                      <span>{t('nav.anime')}</span>
                    </Link>
                    <Link
                      to="/reviews"
                      className="flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                      onClick={() => setAnimeDropdownOpen(false)}
                    >
                      <BookOpen size={18} />
                      <span>{t('nav.reviews')}</span>
                    </Link>
                    <Link
                      to="/top-favorites"
                      className="flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                      onClick={() => setAnimeDropdownOpen(false)}
                    >
                      <Heart size={18} />
                      <span>{t('nav.favorites')}</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* My Blog Dropdown */}
              <div className="relative blog-dropdown-container">
                <button
                  onClick={() => setBlogDropdownOpen(!blogDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
                >
                  <User size={20} />
                  <span>{t('nav.myBlog')}</span>
                </button>
                
                {blogDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <Link
                      to="/contact"
                      className="flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                      onClick={() => setBlogDropdownOpen(false)}
                    >
                      <User size={18} />
                      <span>{t('home.contactUs')}</span>
                    </Link>
                    <Link
                      to="/privacy"
                      className="flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                      onClick={() => setBlogDropdownOpen(false)}
                    >
                      <Shield size={18} />
                      <span>{t('home.privacyPolicy')}</span>
                    </Link>
                    <Link
                      to="/terms"
                      className="flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                      onClick={() => setBlogDropdownOpen(false)}
                    >
                      <BookOpen size={18} />
                      <span>{t('home.termsOfService')}</span>
                    </Link>
                  </div>
                )}
              </div>

              {isAdminUser && (
                <Link to="/admin" className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300">
                  <Shield size={20} />
                  <span>{t('nav.adminPanel')}</span>
                </Link>
              )}

              <Link
                to="/donate"
                className="flex items-center space-x-2 rounded-lg bg-brand-600 px-3 py-2 font-semibold text-white transition-all duration-300 hover:bg-brand-700"
              >
                <Heart size={20} />
                <span>{t('nav.donate')}</span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Language Selector */}
            <div className="relative language-selector-container">
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
              >
                <Globe size={20} />
                <span className="hidden md:inline">{languages.find(lang => lang.code === language)?.flag}</span>
                <Languages size={16} className="hidden md:inline" />
              </button>
              
              {languageDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLanguageChange(lang.code);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        language === lang.code ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="text-gray-900 dark:text-white">{lang.name}</span>
                      {language === lang.code && (
                        <span className="ml-auto text-green-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800">
                  <div className="relative">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className={`w-8 h-8 rounded-full border-2 ${userRank ? rankGlowClass(userRank) : 'border-gray-300 dark:border-gray-600'}`}
                      />
                    ) : (
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${userRank ? rankAvatarBgClass(userRank) : 'bg-gray-300 dark:bg-gray-600'} ${userRank ? rankGlowClass(userRank) : ''}`}>
                        <User size={16} className={userRank ? 'text-black' : 'text-gray-700 dark:text-gray-300'} />
                      </div>
                    )}
                    {userRank && <RankMedallion rank={userRank} badgeClass="w-3.5 h-3.5" iconSize={7} stroke={3} animate="animate-pulse" />}
                  </div>
                  <span className={`hidden md:inline font-bold ${userRank ? rankNameClass(userRank) : ''}`}>{user?.displayName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
                >
                  <LogOut size={20} />
                  <span className="hidden md:inline">{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 font-medium hover:scale-105 border border-gray-700 dark:border-gray-300"
              >
                {t('nav.login')}
              </Link>
            )}
            <button
              onClick={handleMobileMenuToggle}
              className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain border-t border-gray-200/80 pb-4 dark:border-gray-800">
            <nav className="space-y-0.5 px-2 pt-3">
              <Link to="/" onClick={handleMobileMenuToggle} className={mobileLinkClass}>
                <Home size={18} />
                <span>{t('nav.home')}</span>
              </Link>
              <Link to="/anime" onClick={handleMobileMenuToggle} className={mobileLinkClass}>
                <Clapperboard size={18} />
                <span>{t('nav.anime')}</span>
              </Link>
              <Link to="/news" onClick={handleMobileMenuToggle} className={mobileLinkClass}>
                <Newspaper size={18} />
                <span>{t('nav.news')}</span>
              </Link>
              <Link to="/reviews" onClick={handleMobileMenuToggle} className={mobileLinkClass}>
                <BookOpen size={18} />
                <span>{t('nav.reviews')}</span>
              </Link>
              <Link to="/top-favorites" onClick={handleMobileMenuToggle} className={mobileLinkClass}>
                <Heart size={18} />
                <span>{t('nav.favorites')}</span>
              </Link>
            </nav>

            <div className="my-2.5 border-t border-dashed border-gray-200 dark:border-gray-800" />
            
            <nav className="space-y-0.5 px-2">
              <Link to="/contact" onClick={handleMobileMenuToggle} className={mobileLinkClass}>
                <Mail size={18} />
                <span>{t('home.contactUs')}</span>
              </Link>
              <Link to="/privacy" onClick={handleMobileMenuToggle} className={mobileLinkClass}>
                <Shield size={18} />
                <span>{t('home.privacyPolicy')}</span>
              </Link>
              <Link to="/terms" onClick={handleMobileMenuToggle} className={mobileLinkClass}>
                <BookOpen size={18} />
                <span>{t('home.termsOfService')}</span>
              </Link>
              {isAdminUser && (
                <Link to="/admin" onClick={handleMobileMenuToggle} className={mobileLinkClass}>
                  <Shield size={18} />
                  <span>{t('nav.adminPanel')}</span>
                </Link>
              )}
              {isAuthenticated && (
                <Link to="/profile" onClick={handleMobileMenuToggle} className={mobileLinkClass}>
                  <User size={18} />
                  <span>{t('nav.profile')}</span>
                </Link>
              )}
            </nav>

            <div className="mt-3 px-3">
              <Link
                to="/donate"
                onClick={handleMobileMenuToggle}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-700"
              >
                <Heart size={18} />
                <span>{t('nav.donate')}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
