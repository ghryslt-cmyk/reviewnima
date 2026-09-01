import { FileText, AlertCircle, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/translations';
import Layout from '../components/Layout';

const Terms = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t('terms.lastUpdated')}
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="text-blue-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('terms.acceptanceOfTerms')}</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>{t('terms.acceptanceOfTermsDesc')}</p>
              <p>{t('terms.disagreeTerms')}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="text-green-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('terms.userResponsibilities')}</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>{t('terms.userResponsibilitiesDesc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('terms.provideAccurateInfo')}</li>
                <li>{t('terms.postRespectful')}</li>
                <li>{t('terms.noSpam')}</li>
                <li>{t('terms.respectIP')}</li>
                <li>{t('terms.noCompromiseSecurity')}</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="text-yellow-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('terms.contentGuidelines')}</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>{t('terms.contentGuidelinesDesc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('terms.personalOpinions')}</li>
                <li>{t('terms.actualViewing')}</li>
                <li>{t('terms.spoilerWarnings')}</li>
                <li>{t('terms.respectfulComments')}</li>
                <li>{t('terms.noHarassment')}</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <XCircle className="text-red-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('terms.prohibitedActivities')}</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>{t('terms.prohibitedActivitiesDesc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('terms.noPostReviews')}</li>
                <li>{t('terms.noAutomatedTools')}</li>
                <li>{t('terms.noInappropriateContent')}</li>
                <li>{t('terms.noImpersonation')}</li>
                <li>{t('terms.noUnauthorizedAccess')}</li>
                <li>{t('terms.noInterference')}</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('terms.intellectualProperty')}</h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>{t('terms.intellectualPropertyDesc')}</p>
              <p>{t('terms.animeInfo')}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="text-purple-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('terms.assetCredits')}</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>{t('terms.assetCreditsDesc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Homepage Video:</strong> <span dangerouslySetInnerHTML={{ __html: t('terms.homepageVideo') }} /></li>
                <li><strong>Anime Information:</strong> <span dangerouslySetInnerHTML={{ __html: t('terms.animeInformation') }} /></li>
                <li><strong>Seasonal Anime Banners:</strong> {t('terms.seasonalBanners')}</li>
                <li><strong>Trending Anime:</strong> {t('terms.trendingAnime')}</li>
                <li><strong>Anime Schedule:</strong> <span dangerouslySetInnerHTML={{ __html: t('terms.animeSchedule') }} /></li>
                <li><strong>Icons:</strong> <span dangerouslySetInnerHTML={{ __html: t('terms.icons') }} /></li>
                <li><strong>Firebase:</strong> <span dangerouslySetInnerHTML={{ __html: t('terms.firebase') }} /></li>
                <li><strong>Axios:</strong> <span dangerouslySetInnerHTML={{ __html: t('terms.axios') }} /></li>
              </ul>
              <p className="text-sm italic">{t('terms.assetDisclaimer')}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('terms.accountTermination')}</h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>{t('terms.accountTerminationDesc')}</p>
              <p>{t('terms.deleteAccount')}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('terms.limitationOfLiability')}</h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>{t('terms.limitationOfLiabilityDesc')}</p>
              <p>{t('terms.noGuarantee')}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('terms.changesToTerms')}</h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>{t('terms.changesToTermsDesc')}</p>
              <p>{t('terms.notifyUsers')}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('terms.contactUs')}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('terms.contactUsDesc')}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
