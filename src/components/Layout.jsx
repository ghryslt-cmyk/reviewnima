import { memo } from 'react';
import TopGutter from './TopGutter';

const Layout = memo(({ children }) => {
  return (
    <div 
      className="min-h-screen transition-all duration-300 relative"
      style={{
        backgroundColor: '#fff',
        backgroundImage: "url('/main-skin.png')",
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover'
      }}
    >
      {/* Fixed Side Gutters - ANN Style */}
      <div className="fixed left-0 top-0 bottom-0 min-w-[180px] z-20 hidden lg:block pointer-events-none">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/left-gutter.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top'
          }}
        ></div>
      </div>

      <div className="fixed right-0 top-0 bottom-0 min-w-[180px] z-20 hidden lg:block pointer-events-none">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/right-gutter.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top'
          }}
        ></div>
      </div>

      {/* Canvas - ANN Style - Fixed width container */}
      <div className="mx-auto relative z-10" style={{ width: '768px', maxWidth: '721px' }}>
        {/* Top Gutter */}
        <TopGutter />
        
        {/* Middle Area - Main Content */}
        <div className="bg-white dark:bg-gray-900">
          {children}
        </div>
      </div>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
