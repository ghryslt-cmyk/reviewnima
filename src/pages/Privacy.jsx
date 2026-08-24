import { Shield, Lock, Eye, Database, CreditCard } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Last updated: August 2026
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="text-blue-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Information We Collect</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (name, email, profile picture from Google)</li>
                <li>Review content and ratings you submit</li>
                <li>Comments and interactions on the platform</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="text-green-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">How We Use Your Information</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process and display your reviews and comments</li>
                <li>Communicate with you about your account</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="text-purple-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Information Sharing</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>We do not sell your personal information. We may share information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With service providers who perform services on our behalf</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With your consent</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="text-orange-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Data Security</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>We implement appropriate security measures to protect your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication through Google OAuth</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication requirements</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Your Rights</h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of certain data collection</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="text-purple-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Asset Credits</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>We respect and credit all third-party assets used on this website:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Homepage Video:</strong> The background video on the homepage is sourced from YouTube user <a href="https://www.youtube.com/@monomogu" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline">monomogu</a>. Used with appreciation for their creative content.</li>
                <li><strong>Anime Banners:</strong> Seasonal anime banners displayed on the homepage are sourced from AniList API. All anime images and banners remain the property of their respective copyright holders and are used for informational purposes.</li>
                <li><strong>Anime Information:</strong> Anime data including titles, descriptions, and metadata are sourced from AniList API. All anime content remains the property of their respective creators and studios.</li>
                <li><strong>Icons:</strong> UI icons are provided by Lucide React under the MIT License.</li>
              </ul>
              <p className="text-sm italic">If you are the owner of any asset used on this website and have concerns about its use, please contact us immediately.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400">
              If you have questions about this Privacy Policy, please contact us at morvissenter@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
