import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/translations';
import { Home, BookOpen, User, LogOut, Shield, Menu, X, Heart, Newspaper, Globe, Languages } from 'lucide-react';
import { useState, useCallback, useEffect, memo } from 'react';

const Navbar = () => {
  const { user, logout, checkAdmin, isAuthenticated } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation(language);
  const isAdminUser = checkAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownOpen && !event.target.closest('.language-dropdown')) {
        setLanguageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [languageDropdownOpen]);

  const handleLanguageChange = useCallback((lang) => {
    changeLanguage(lang);
    setLanguageDropdownOpen(false);
  }, []);

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

  return (
    <nav className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white hover:scale-105 transition-transform duration-300">
              ReviewNima
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300">
                <Home size={20} />
                <span>{t('nav.home')}</span>
              </Link>
              <Link to="/news" className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300">
                <Newspaper size={20} />
                <span>{t('nav.news')}</span>
              </Link>
              <Link to="/reviews" className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300">
                <BookOpen size={20} />
                <span>{t('nav.reviews')}</span>
              </Link>
              <Link to="/top-favorites" className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300">
                <Heart size={20} />
                <span>{t('nav.favorites')}</span>
              </Link>
              {isAdminUser && (
                <Link to="/admin" className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300">
                  <Shield size={20} />
                  <span>{t('nav.adminPanel')}</span>
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="language-dropdown flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
              >
                <Globe size={20} />
                <span className="hidden md:inline">{languages.find(lang => lang.code === language)?.flag}</span>
                <Languages size={16} className="hidden md:inline" />
              </button>
              
              {languageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
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
                <Link to="/profile" className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <User size={20} />
                  )}
                  <span className="hidden md:inline">{user?.displayName}</span>
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
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
            {/* Language Selector for Mobile */}
            <div className="px-3 py-2">
              <div className="flex items-center space-x-2 text-gray-900 dark:text-white mb-2">
                <Globe size={20} />
                <span className="font-medium">Language</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      language === lang.code
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-sm">{lang.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
              onClick={handleMobileMenuToggle}
            >
              <Home size={20} />
              <span>{t('nav.home')}</span>
            </Link>
            <Link 
              to="/news" 
              className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
              onClick={handleMobileMenuToggle}
            >
              <Newspaper size={20} />
              <span>{t('nav.news')}</span>
            </Link>
            <Link 
              to="/reviews" 
              className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
              onClick={handleMobileMenuToggle}
            >
              <BookOpen size={20} />
              <span>{t('nav.reviews')}</span>
            </Link>
            <Link 
              to="/top-favorites" 
              className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
              onClick={handleMobileMenuToggle}
            >
              <Heart size={20} />
              <span>{t('nav.favorites')}</span>
            </Link>
            {isAdminUser && (
              <Link 
                to="/admin" 
                className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
                onClick={handleMobileMenuToggle}
              >
                <Shield size={20} />
                <span>{t('nav.adminPanel')}</span>
              </Link>
            )}
            {isAuthenticated && (
              <Link 
                to="/profile" 
                className="flex items-center space-x-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
                onClick={handleMobileMenuToggle}
              >
                <User size={20} />
                <span>{t('nav.profile')}</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
