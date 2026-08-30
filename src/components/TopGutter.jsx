import { memo } from 'react';

const TopGutter = memo(() => {
  return (
    <div className="w-full h-16 md:h-20 lg:h-24 relative overflow-hidden top-gutter-transparent">
      <img 
        src="/top-gutter.png" 
        alt="Top Gutter" 
        className="w-full h-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50 dark:to-gray-900"></div>
    </div>
  );
});

TopGutter.displayName = 'TopGutter';

export default TopGutter;
