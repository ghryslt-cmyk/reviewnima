import { Link } from 'react-router-dom';
import { memo } from 'react';

const Layout = memo(({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      {/* ANN-style Layout with Side Gutters */}
      <div className="flex max-w-[1600px] mx-auto">
        {/* Left Sidebar Gutter */}
        <div className="hidden lg:block w-48 xl:w-56 flex-shrink-0 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 side-gutter">
          <div className="p-4 space-y-4">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Quick Links</h3>
              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <li><Link to="/news" className="hover:text-blue-500">News</Link></li>
                <li><Link to="/reviews" className="hover:text-blue-500">Reviews</Link></li>
                <li><Link to="/top-favorites" className="hover:text-blue-500">Top Favorites</Link></li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Categories</h3>
              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <li><Link to="#" className="hover:text-blue-500">Anime</Link></li>
                <li><Link to="#" className="hover:text-blue-500">Manga</Link></li>
                <li><Link to="#" className="hover:text-blue-500">Games</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {children}
        </div>

        {/* Right Sidebar Gutter */}
        <div className="hidden lg:block w-48 xl:w-56 flex-shrink-0 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 side-gutter">
          <div className="p-4 space-y-4">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Trending</h3>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <span className="text-yellow-500 font-bold">1</span>
                  <Link to="#" className="hover:text-blue-500 truncate">Popular Anime</Link>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-yellow-500 font-bold">2</span>
                  <Link to="#" className="hover:text-blue-500 truncate">New Releases</Link>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-yellow-500 font-bold">3</span>
                  <Link to="#" className="hover:text-blue-500 truncate">Top Reviews</Link>
                </li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Social</h3>
              <div className="flex space-x-2">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500">Twitter</a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500">Discord</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
