import { Shield, Lock, Eye, Database, CreditCard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/translations';
import Layout from '../components/Layout';

const Privacy = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t('privacy.lastUpdated')}
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="text-blue-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('privacy.informationWeCollect')}</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>{t('privacy.informationWeCollectDesc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('privacy.accountInfo')}</li>
                <li>{t('privacy.reviewContent')}</li>
                <li>{t('privacy.commentsInteractions')}</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="text-green-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('privacy.howWeUseInfo')}</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>{t('privacy.howWeUseInfoDesc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('privacy.provideServices')}</li>
                <li>{t('privacy.processDisplay')}</li>
                <li>{t('privacy.communicate')}</li>
                <li>{t('privacy.ensureSecurity')}</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="text-purple-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('privacy.informationSharing')}</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>{t('privacy.informationSharingDesc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('privacy.serviceProviders')}</li>
                <li>{t('privacy.legalObligations')}</li>
                <li>{t('privacy.protectRights')}</li>
                <li>{t('privacy.withConsent')}</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="text-orange-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('privacy.dataSecurity')}</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>{t('privacy.dataSecurityDesc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('privacy.encryption')}</li>
                <li>{t('privacy.secureAuth')}</li>
                <li>{t('privacy.securityAudits')}</li>
                <li>{t('privacy.accessControls')}</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('privacy.yourRights')}</h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>{t('privacy.yourRightsDesc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('privacy.accessInfo')}</li>
                <li>{t('privacy.correctInfo')}</li>
                <li>{t('privacy.requestDeletion')}</li>
                <li>{t('privacy.optOut')}</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="text-purple-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('privacy.assetCredits')}</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>{t('privacy.assetCreditsDesc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Homepage Video:</strong> <span dangerouslySetInnerHTML={{ __html: t('privacy.homepageVideo') }} /></li>
                <li><strong>Seasonal Anime Banners:</strong> {t('privacy.seasonalBanners')}</li>
                <li><strong>Anime Information:</strong> {t('privacy.animeInformation')}</li>
                <li><strong>Icons:</strong> {t('privacy.icons')}</li>
              </ul>
              <p className="text-sm italic">{t('privacy.assetDisclaimer')}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('privacy.contactUs')}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('privacy.contactUsDesc')}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
