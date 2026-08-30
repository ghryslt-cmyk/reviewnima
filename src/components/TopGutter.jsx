import { memo } from 'react';

const TopGutter = memo(() => {
  return (
    <div className="w-full h-[200px] relative overflow-hidden">
      <img 
        src="/pc-top-gutter.png" 
        alt="Top Gutter" 
        className="w-full h-full object-cover"
        style={{ 
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top'
        }}
      />
    </div>
  );
});

TopGutter.displayName = 'TopGutter';

export default TopGutter;
