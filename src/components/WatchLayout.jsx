import { memo, useEffect } from 'react';

const WatchLayout = memo(({ children }) => {
  useEffect(() => {
    // Force dark mode when entering watch page
    document.documentElement.style.colorScheme = 'dark';
    document.body.style.backgroundColor = '#000';
    
    return () => {
      // Cleanup when leaving the page
      document.documentElement.style.colorScheme = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
});

WatchLayout.displayName = 'WatchLayout';

export default WatchLayout;
