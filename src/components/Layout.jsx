import { memo } from 'react';
import TopGutter from './TopGutter';

const Layout = memo(({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300 relative">
      {/* Fixed Side Gutters - Solid Color Background */}
      <div className="fixed left-0 top-0 bottom-0 w-40 lg:w-48 xl:w-56 z-10 hidden lg:block bg-gray-200 dark:bg-gray-800">
        <div className="w-full h-full bg-black/20"></div>
      </div>

      <div className="fixed right-0 top-0 bottom-0 w-48 lg:w-64 z-10 hidden lg:block bg-gray-200 dark:bg-gray-800">
        <div className="w-full h-full bg-black/20"></div>
      </div>

      {/* Main Content Area with Top Gutter and Full-img Background */}
      <div className="flex max-w-[1600px] mx-auto relative z-20">
        {/* Spacer for left gutter */}
        <div className="hidden lg:block w-40 lg:w-48 xl:w-56 flex-shrink-0"></div>
        
        {/* Main content with full-img background */}
        <div className="flex-1 min-w-0 relative">
          {/* Full-img background behind main content */}
          <div 
            className="absolute inset-0 bg-cover bg-center -z-10"
            style={{ backgroundImage: "url('/full-img.png')" }}
          >
            <div className="w-full h-full bg-white/90 dark:bg-black/90"></div>
          </div>
          
          <TopGutter />
          {children}
        </div>
        
        {/* Spacer for right gutter */}
        <div className="hidden lg:block w-48 lg:w-64 flex-shrink-0"></div>
      </div>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
