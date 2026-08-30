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
      {/* Main Content Area with Top Gutter */}
      <div className="flex max-w-[1600px] mx-auto relative z-10">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <TopGutter />
          {children}
        </div>
      </div>

      {/* Fixed Side Gutters - ANN Style - Overlay on top of main skin */}
      <div className="fixed left-0 top-0 bottom-0 min-w-[180px] z-20 hidden lg:block">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/left-gutter.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top'
          }}
        ></div>
      </div>

      <div className="fixed right-0 top-0 bottom-0 min-w-[180px] z-20 hidden lg:block">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/right-gutter.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top'
          }}
        ></div>
      </div>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
