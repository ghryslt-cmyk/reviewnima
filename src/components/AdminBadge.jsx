import { Crown, Heart, Gem } from 'lucide-react';

// ---------------------------------------------------------------------------
// Shared "rank" visual primitives.
// Used across Navbar, Profile, ReviewDetail and AnimeWatch so every rank
// (admin, donatur, donatur++, moderator, vip, premium) looks consistent on
// every page that renders an account.
// ---------------------------------------------------------------------------

// Rank display configuration. Each rank has a distinct, high-contrast identity.
export const rankConfig = {
  admin: {
    label: 'ADMIN',
    nameClass:
      'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(120,53,15,0.55)]',
    avatarBgClass: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500',
    pillClass: 'from-yellow-400 via-amber-400 to-orange-400 text-amber-950',
    glowClass:
      'ring-2 ring-yellow-400 ring-offset-2 shadow-[0_0_0_2px_rgba(250,204,21,0.5),0_0_16px_rgba(250,204,21,0.45)]',
    Icon: Crown,
  },
  donatur: {
    label: 'DONATUR',
    nameClass:
      'bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(12,74,110,0.55)]',
    avatarBgClass: 'bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-500',
    pillClass: 'from-sky-400 via-blue-400 to-cyan-400 text-blue-950',
    glowClass:
      'ring-2 ring-sky-400 ring-offset-2 shadow-[0_0_0_2px_rgba(56,189,248,0.5),0_0_16px_rgba(56,189,248,0.45)]',
    Icon: Heart,
  },
  'donatur++': {
    label: 'DONATUR++',
    nameClass:
      'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-300 bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(6,78,59,0.55)]',
    avatarBgClass: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-400',
    pillClass: 'from-emerald-400 via-green-400 to-teal-400 text-emerald-950',
    glowClass:
      'ring-2 ring-emerald-400 ring-offset-2 shadow-[0_0_0_2px_rgba(52,211,153,0.5),0_0_16px_rgba(52,211,153,0.45)]',
    Icon: Gem,
  },
  moderator: {
    label: 'MODERATOR',
    nameClass:
      'bg-gradient-to-r from-indigo-500 via-blue-400 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(30,64,175,0.55)]',
    avatarBgClass: 'bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-500',
    pillClass: 'from-indigo-500 via-blue-400 to-sky-400 text-indigo-950',
    glowClass:
      'ring-2 ring-blue-400 ring-offset-2 shadow-[0_0_0_2px_rgba(96,165,250,0.5),0_0_16px_rgba(96,165,250,0.45)]',
    Icon: Crown,
  },
  vip: {
    label: 'VIP',
    nameClass:
      'bg-gradient-to-r from-cyan-500 via-teal-400 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(8,51,68,0.55)]',
    avatarBgClass: 'bg-gradient-to-br from-cyan-500 via-teal-500 to-sky-500',
    pillClass: 'from-cyan-500 via-teal-400 to-sky-400 text-cyan-950',
    glowClass:
      'ring-2 ring-cyan-400 ring-offset-2 shadow-[0_0_0_2px_rgba(34,211,238,0.5),0_0_16px_rgba(34,211,238,0.45)]',
    Icon: Gem,
  },
  premium: {
    label: 'PREMIUM',
    nameClass:
      'bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(124,45,18,0.55)]',
    avatarBgClass: 'bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-400',
    pillClass: 'from-orange-400 via-amber-400 to-yellow-300 text-orange-950',
    glowClass:
      'ring-2 ring-orange-400 ring-offset-2 shadow-[0_0_0_2px_rgba(251,146,60,0.5),0_0_16px_rgba(251,146,60,0.45)]',
    Icon: Crown,
  },
};

const fallbackRank = {
  label: 'MEMBER',
  nameClass: '',
  avatarBgClass: 'bg-gradient-to-br from-gray-400 to-gray-500',
  pillClass: 'from-gray-400 to-gray-500 text-gray-950',
  glowClass: '',
  Icon: Heart,
};

export const getRankConfig = (rank) =>
  rank && rankConfig[rank] ? rankConfig[rank] : fallbackRank;

// Golden gradient text used for admin display names (kept for backwards compat).
export const adminNameClass = rankConfig.admin.nameClass;

// Golden gradient background used for admin "initials" / icon avatars.
export const adminAvatarBgClass = rankConfig.admin.avatarBgClass;

// Deep golden glow used around admin avatar photos.
export const adminGlowClass = rankConfig.admin.glowClass;

// Rank-specific glow class (falls back to an empty string for regular members).
export const rankGlowClass = (rank) => getRankConfig(rank).glowClass;

// Rank-specific name color class.
export const rankNameClass = (rank) => getRankConfig(rank).nameClass;

// Rank-specific avatar background.
export const rankAvatarBgClass = (rank) => getRankConfig(rank).avatarBgClass;

// Compact colored pill badge for any rank. Defaults to a subtle member badge.
export const RankLabel = ({ rank, className = '' }) => {
  const config = getRankConfig(rank);
  const Icon = config.Icon;
  if (!config.nameClass) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-extrabold uppercase tracking-wide shadow-sm ${className}`}
      >
        <Icon size={11} strokeWidth={2.5} />
        {config.label}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r ${config.pillClass} text-[10px] font-extrabold uppercase tracking-wide shadow-sm ${className}`}
    >
      <Icon size={11} strokeWidth={2.5} />
      {config.label}
    </span>
  );
};

// Golden "ADMIN" pill badge (kept for backwards compat).
export const AdminLabel = ({ className = '' }) => <RankLabel rank="admin" className={className} />;

// Golden crown medallion overlaid on the top-right corner of an avatar.
// `badgeClass` takes literal Tailwind sizing classes (e.g. "w-4 h-4").
// `className` may add extras such as `animate-pulse`.
export const CrownMedallion = ({
  badgeClass = 'w-4 h-4',
  iconSize = 8,
  stroke = 3,
  animate = '',
  className = '',
}) => (
  <div
    className={`absolute -top-1.5 -right-1.5 grid place-items-center ${badgeClass} ${adminAvatarBgClass} text-black rounded-full border border-white shadow-[0_0_8px_rgba(250,204,21,0.8)] ${animate} ${className}`}
  >
    <Crown size={iconSize} strokeWidth={stroke} />
  </div>
);

// Generic rank medallion overlaid on the top-right corner of an avatar.
export const RankMedallion = ({
  rank,
  badgeClass = 'w-4 h-4',
  iconSize = 8,
  stroke = 3,
  animate = '',
  className = '',
}) => {
  const config = getRankConfig(rank);
  const Icon = config.Icon;
  return (
    <div
      className={`absolute -top-1.5 -right-1.5 grid place-items-center ${badgeClass} ${config.avatarBgClass} text-black rounded-full border border-white shadow-md ${animate} ${className}`}
    >
      <Icon size={iconSize} strokeWidth={stroke} />
    </div>
  );
};