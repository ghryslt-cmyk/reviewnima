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
      <div className="fixed left-0 top-0 bottom-0 min-w-[180px] z-10 hidden lg:block">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/left-gutter.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top'
          }}
        ></div>
      </div>

      <div className="fixed right-0 top-0 bottom-0 min-w-[180px] z-10 hidden lg:block">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/right-gutter.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top'
          }}
        ></div>
      </div>

      {/* Main Content Area with Top Gutter */}
      <div className="flex max-w-[1600px] mx-auto relative z-20">
        {/* Spacer for left gutter */}
        <div className="hidden lg:block min-w-[180px] flex-shrink-0"></div>
        
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <TopGutter />
          {children}
        </div>
        
        {/* Spacer for right gutter */}
        <div className="hidden lg:block min-w-[180px] flex-shrink-0"></div>
      </div>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
