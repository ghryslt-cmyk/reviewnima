import { Mail, MessageSquare } from 'lucide-react';
import Layout from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/translations';

const Contact = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('contact.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="text-blue-500" size={24} />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('contact.email')}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              morvissenter@gmail.com
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <MessageSquare className="text-green-500" size={24} />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('contact.socialMedia')}</h3>
            </div>
            <a
              href="https://www.youtube.com/@Morviss09"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            >
              Morviss
            </a>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Contact;
