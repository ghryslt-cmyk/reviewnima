import { memo } from 'react';
import TopGutter from './TopGutter';

const Layout = memo(({ children }) => {
  return (
    <div 
      className="min-h-screen transition-all duration-300 relative"
      style={{
        background: 'linear-gradient(180deg, #f4f2ff 0%, #f6f6fb 35%, #eef3ff 100%)'
      }}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 z-0 hidden lg:block" style={{
        background: 'radial-gradient(ellipse at 18% 20%, rgba(124,58,237,0.08), transparent 55%), radial-gradient(ellipse at 82% 30%, rgba(34,211,238,0.08), transparent 55%)'
      }} />

      {/* Left Gutter */}
      <a href="https://www.netflix.com" target="_blank" rel="noopener noreferrer" className="fixed left-0 bottom-0 w-[150px] h-[640px] z-0 hidden lg:block opacity-90 transition-opacity hover:opacity-100">
        <div 
          className="w-full h-full bg-cover bg-center drop-shadow-[0_0_30px_rgba(124,58,237,0.18)]"
          style={{ 
            backgroundImage: "url('/left-gutter.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center bottom',
            backgroundSize: 'contain'
          }}
        ></div>
      </a>

      {/* Right Gutter */}
      <a href="https://www.netflix.com" target="_blank" rel="noopener noreferrer" className="fixed right-0 bottom-0 w-[150px] h-[640px] z-0 hidden lg:block opacity-90 transition-opacity hover:opacity-100">
        <div 
          className="w-full h-full bg-cover bg-center drop-shadow-[0_0_30px_rgba(34,211,238,0.18)]"
          style={{ 
            backgroundImage: "url('/right-gutter.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center bottom',
            backgroundSize: 'contain'
          }}
        ></div>
      </a>

      {/* Canvas */}
      <div id="canvas" className="mx-auto max-w-[1500px] relative z-10">
        {/* Top Gutter */}
        <TopGutter />
        
        {/* Middle Area - Main Content */}
        <div className="bg-white shadow-soft dark:bg-gray-900">
          {children}
        </div>
      </div>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
