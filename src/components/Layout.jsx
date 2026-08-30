import { memo } from 'react';
import TopGutter from './TopGutter';

const Layout = memo(({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300 relative">
      {/* Fixed Side Gutters - Full Screen Height */}
      <div className="fixed left-0 top-0 bottom-0 w-40 lg:w-48 xl:w-56 z-10 hidden lg:block">
        <div 
          className="w-full h-screen bg-cover bg-center"
          style={{ backgroundImage: "url('/full-img.png')" }}
        >
          <div className="w-full h-full bg-black/30"></div>
        </div>
      </div>

      <div className="fixed right-0 top-0 bottom-0 w-48 lg:w-64 z-10 hidden lg:block">
        <div 
          className="w-full h-screen bg-cover bg-center"
          style={{ backgroundImage: "url('/full-img.png')" }}
        >
          <div className="w-full h-full bg-black/30"></div>
        </div>
      </div>

      {/* Main Content Area with Top Gutter */}
      <div className="flex max-w-[1600px] mx-auto relative z-20">
        {/* Spacer for left gutter */}
        <div className="hidden lg:block w-40 lg:w-48 xl:w-56 flex-shrink-0"></div>
        
        {/* Main content */}
        <div className="flex-1 min-w-0">
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
