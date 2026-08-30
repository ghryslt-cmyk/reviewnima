import { memo } from 'react';

const TopGutter = memo(() => {
  return (
    <div className="w-full h-20 md:h-24 lg:h-28 relative overflow-hidden">
      <img 
        src="/top-gutter.png" 
        alt="Top Gutter" 
        className="w-full h-full object-cover opacity-40"
        style={{ objectPosition: 'bottom' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50 dark:to-gray-900"></div>
    </div>
  );
});

TopGutter.displayName = 'TopGutter';

export default TopGutter;
