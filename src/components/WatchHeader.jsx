import { memo } from 'react';
import { Menu, Search, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/translations';

const WatchHeader = memo(() => {
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  return (
    <header className="w-full bg-gray-900 border-b border-gray-800">
      <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-4">
        {/* Left: Hamburger menu + Logo */}
        <div className="flex items-center gap-3">
          <button className="text-white hover:text-gray-300 transition-colors">
            <Menu size={24} />
          </button>
          <div className="text-white font-bold text-lg sm:text-xl">{t('watchHeader.brand')}</div>
        </div>

        {/* Center: Hover bar (search) */}
        <div className="hidden flex-1 max-w-2xl mx-4 xs:block">
          <div className="relative">
            <input
              type="text"
              placeholder={t('watchHeader.searchPlaceholder')}
              className="w-full px-4 py-2 pl-10 bg-gray-800 text-white rounded-full border border-gray-700 focus:outline-none focus:border-gray-600"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        {/* Right: Sign in/Account button */}
        <div className="flex items-center">
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors sm:px-4">
            <User size={18} />
            <span className="hidden sm:inline">{t('watchHeader.signIn')}</span>
          </button>
        </div>
      </div>
    </header>
  );
});

WatchHeader.displayName = 'WatchHeader';

export default WatchHeader;
