import { memo } from 'react';
import TopGutter from './TopGutter';

const Layout = memo(({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      {/* ANN-style Layout with Side Gutters */}
      <div className="flex max-w-[1600px] mx-auto">
        {/* Left Sidebar Gutter - Image Background */}
        <div className="hidden lg:block w-48 xl:w-56 flex-shrink-0 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/full-img.png')" }}
          >
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        </div>

        {/* Main Content Area with Top Gutter */}
        <div className="flex-1 min-w-0">
          <TopGutter />
          {children}
        </div>

        {/* Right Sidebar Gutter - Image Background */}
        <div className="hidden lg:block w-48 xl:w-56 flex-shrink-0 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/full-img.png')" }}
          >
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        </div>
      </div>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
