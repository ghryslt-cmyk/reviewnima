import { memo } from 'react';

const TopGutter = memo(() => {
  return (
    <a href="https://www.netflix.com" target="_blank" rel="noopener noreferrer" className="block w-full h-[200px] relative overflow-hidden">
      <img 
        src="/pc-top-gutter.png" 
        alt="Top Gutter" 
        className="w-full h-full object-cover"
        style={{ 
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top'
        }}
      />
    </a>
  );
});

TopGutter.displayName = 'TopGutter';

export default TopGutter;
