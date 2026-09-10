import { memo } from 'react';

const TopGutter = memo(() => {
  return (
    <a
      href="https://www.netflix.com"
      target="_blank"
      rel="noopener noreferrer"
      className="relative block w-full overflow-hidden"
    >
      {/* Mobile / tablet banner */}
      <img
        src="/android-top-gutter.png"
        alt=""
        loading="eager"
        className="block h-auto w-full object-cover md:hidden"
      />
      {/* Desktop banner */}
      <img
        src="/pc-top-gutter.png"
        alt=""
        loading="eager"
        className="hidden h-[200px] w-full object-cover object-top md:block xl:h-[230px] 2xl:h-[260px]"
      />
    </a>
  );
});

TopGutter.displayName = 'TopGutter';

export default TopGutter;
