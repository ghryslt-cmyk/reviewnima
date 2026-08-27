import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Check, Globe, Lock, User, Info } from 'lucide-react';

const WelcomeAlert = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('id');
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);

  const translations = {
    id: {
      title: 'Selamat Datang di ReviewNima!',
      subtitle: 'Website ini adalah ciptaan Morviss',
      description: 'Website ini menyediakan tambahan informasi dari konten yang Morviss lakukan dan tambahan informasi mengenai dunia anime.',
      credits: 'Kredit dan Informasi',
      creditsText: 'Silakan baca halaman Kebijakan Privasi dan Syarat & Ketentuan untuk informasi lengkap mengenai kredit aset dan penggunaan website ini.',
      loginPrompt: 'Login untuk Pengalaman Lengkap',
      loginText: 'Silakan login dengan akun Google Anda untuk meninggalkan komentar dan berinteraksi dengan komunitas.',
      privacyRead: 'Saya telah membaca Kebijakan Privasi',
      termsRead: 'Saya telah membaca Syarat & Ketentuan',
      continueBtn: 'Lanjut ke Website',
      closeDisabled: 'Harap baca Kebijakan Privasi dan Syarat & Ketentuan terlebih dahulu',
      viewPrivacy: 'Lihat Kebijakan Privasi',
      viewTerms: 'Lihat Syarat & Ketentuan'
    },
    en: {
      title: 'Welcome to ReviewNima!',
      subtitle: 'This website is created by Morviss',
      description: 'This website provides additional information from the content Morviss creates and additional information about the anime world.',
      credits: 'Credits and Information',
      creditsText: 'Please read the Privacy Policy and Terms & Conditions pages for complete information about asset credits and website usage.',
      loginPrompt: 'Login for Full Experience',
      loginText: 'Please login with your Google account to leave comments and interact with the community.',
      privacyRead: 'I have read the Privacy Policy',
      termsRead: 'I have read the Terms & Conditions',
      continueBtn: 'Continue to Website',
      closeDisabled: 'Please read the Privacy Policy and Terms & Conditions first',
      viewPrivacy: 'View Privacy Policy',
      viewTerms: 'View Terms & Conditions'
    },
    jp: {
      title: 'ReviewNimaへようこそ！',
      subtitle: 'このウェブサイトはMorvissによって作成されました',
      description: 'このウェブサイトは、Morvissが作成するコンテンツからの追加情報とアニメの世界に関する追加情報を提供します。',
      credits: 'クレジットと情報',
      creditsText: 'アセットクレジットとウェブサイトの使用に関する完全な情報については、プライバシーポリシーと利用規約のページをお読みください。',
      loginPrompt: '完全なエクスペリエンスのためにログイン',
      loginText: 'コメントを残してコミュニティと対話するには、Googleアカウントでログインしてください。',
      privacyRead: 'プライバシーポリシーを読みました',
      termsRead: '利用規約を読みました',
      continueBtn: 'ウェブサイトに続く',
      closeDisabled: '最初にプライバシーポリシーと利用規約をお読みください',
      viewPrivacy: 'プライバシーポリシーを表示',
      viewTerms: '利用規約を表示'
    }
  };

  const t = translations[language];

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (hasReadPrivacy && hasReadTerms) {
      setIsOpen(false);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  };

  const handlePrivacyCheck = () => {
    setHasReadPrivacy(!hasReadPrivacy);
  };

  const handleTermsCheck = () => {
    setHasReadTerms(!hasReadTerms);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-black dark:border-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{t.title}</h2>
              <p className="text-purple-100 mt-1">{t.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('id')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  language === 'id' ? 'bg-white text-purple-600' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                ID
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  language === 'en' ? 'bg-white text-purple-600' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('jp')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  language === 'jp' ? 'bg-white text-purple-600' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                JP
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t.description}
            </p>
          </div>

          {/* Credits Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-gray-900 dark:text-white">{t.credits}</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
              {t.creditsText}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/privacy"
                target="_blank"
                className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
              >
                <Lock className="w-4 h-4 mr-2" />
                {t.viewPrivacy}
              </Link>
              <Link
                to="/terms"
                target="_blank"
                className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
              >
                <Lock className="w-4 h-4 mr-2" />
                {t.viewTerms}
              </Link>
            </div>
          </div>

          {/* Login Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-bold text-gray-900 dark:text-white">{t.loginPrompt}</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
              {t.loginText}
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <User className="w-4 h-4 mr-2" />
              Login
            </Link>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={hasReadPrivacy}
                  onChange={handlePrivacyCheck}
                  className="sr-only"
                />
                <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all ${
                  hasReadPrivacy 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-300 dark:border-gray-600 group-hover:border-green-500'
                }`}>
                  {hasReadPrivacy && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
              <span className="text-gray-700 dark:text-gray-300 text-sm">{t.privacyRead}</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={hasReadTerms}
                  onChange={handleTermsCheck}
                  className="sr-only"
                />
                <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all ${
                  hasReadTerms 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-300 dark:border-gray-600 group-hover:border-green-500'
                }`}>
                  {hasReadTerms && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
              <span className="text-gray-700 dark:text-gray-300 text-sm">{t.termsRead}</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={!hasReadPrivacy || !hasReadTerms}
            className={`w-full py-3 px-6 rounded-xl font-bold text-lg transition-all ${
              hasReadPrivacy && hasReadTerms
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {hasReadPrivacy && hasReadTerms ? t.continueBtn : t.closeDisabled}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAlert;
