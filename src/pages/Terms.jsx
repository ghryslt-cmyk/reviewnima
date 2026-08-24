import { FileText, AlertCircle, CheckCircle, XCircle, CreditCard } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Last updated: August 2026
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="text-blue-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Acceptance of Terms</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>By accessing and using ReviewNima, you accept and agree to be bound by the terms and provisions of this agreement.</p>
              <p>If you do not agree to abide by these terms, please do not use this service.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="text-green-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">User Responsibilities</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>As a user of ReviewNima, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and truthful information when creating your account</li>
                <li>Post comments that are respectful and constructive</li>
                <li>Not post spam, hate speech, or inappropriate content</li>
                <li>Respect the intellectual property rights of others</li>
                <li>Not attempt to compromise the security of the platform</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="text-yellow-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Content Guidelines</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>ReviewNima is a personal anime review website where all reviews are written by the author. The content guidelines are:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All anime reviews are personal opinions and experiences of the author</li>
                <li>Reviews are based on actual viewing of the anime content</li>
                <li>Spoilers are marked with appropriate warnings when present</li>
                <li>Comments from users should be respectful and constructive</li>
                <li>No harassment, bullying, or discriminatory language in comments</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <XCircle className="text-red-500" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Prohibited Activities</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>Since ReviewNima is a personal review website, users cannot post reviews. The following activities are strictly prohibited:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Attempting to post or submit anime reviews (only the author can post reviews)</li>
                <li>Using automated tools to scrape or spam the platform</li>
                <li>Posting spam, hate speech, or inappropriate content in comments</li>
                <li>Impersonating the author or other users</li>
                <li>Attempting to gain unauthorized access to accounts or the platform</li>
                <li>Interfering with the proper functioning of the service</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Intellectual Property</h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>All content on ReviewNima, including text, graphics, logos, and software, is owned by ReviewNima or its licensors and is protected by copyright laws.</p>
              <p>Anime information and images are sourced from third-party APIs and remain the property of their respective owners.</p>
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
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Account Termination</h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>We reserve the right to suspend or terminate your account if you violate these terms of service or engage in prohibited activities.</p>
              <p>You may also delete your account at any time through your profile settings.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Limitation of Liability</h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>ReviewNima is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.</p>
              <p>We do not guarantee the accuracy, completeness, or reliability of any content on the platform.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Changes to Terms</h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>We may update these terms of service from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
              <p>We will notify users of significant changes through the platform or email.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400">
              If you have questions about these Terms of Service, please contact us at morvissenter@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
