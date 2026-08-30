import { memo, useEffect, useState } from 'react';
import TopGutter from './TopGutter';

const Layout = memo(({ children }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const checkZoom = () => {
      const zoomLevel = window.outerWidth / window.innerWidth;
      setIsZoomed(zoomLevel > 1.1);
    };

    checkZoom();
    window.addEventListener('resize', checkZoom);
    return () => window.removeEventListener('resize', checkZoom);
  }, []);
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
      {/* Left Gutter */}
      <div className="fixed left-0 bottom-0 w-[310px] h-[900px] z-0 hidden lg:block pointer-events-none">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/left-gutter.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center bottom',
            mixBlendMode: 'multiply',
            backgroundSize: 'contain'
          }}
        ></div>
      </div>

      {/* Right Gutter */}
      <a href="https://www.netflix.com" target="_blank" rel="noopener noreferrer" className="fixed right-0 bottom-0 w-[310px] h-[900px] z-0 hidden lg:block">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/right-gutter.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center bottom',
            mixBlendMode: 'multiply',
            backgroundSize: 'contain'
          }}
        ></div>
      </a>

      {/* Canvas */}
      <div id="canvas" className="mx-auto max-w-[1300px] relative z-10">
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
