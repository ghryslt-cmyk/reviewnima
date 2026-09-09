import { Crown } from 'lucide-react';

// ---------------------------------------------------------------------------
// Shared "admin" visual primitives.
// Used across Navbar, Profile, ReviewDetail and AnimeWatch so the admin rank
// looks consistent (golden crown medallion, golden name, ADMIN pill) on every
// page that renders an account.
// ---------------------------------------------------------------------------

// Deep golden glow + a crisp golden ring used around admin avatar photos.
export const adminGlowClass =
  'ring-2 ring-yellow-400 ring-offset-2 ' +
  'shadow-[0_0_0_2px_rgba(250,204,21,0.5),0_0_16px_rgba(250,204,21,0.45)]';

// Golden gradient text used for admin display names.
export const adminNameClass =
  'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 ' +
  'bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(120,53,15,0.55)]';

// Golden gradient background used for admin "initials" / icon avatars.
export const adminAvatarBgClass =
  'bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500';

// Compact golden "ADMIN" pill badge.
export const AdminLabel = ({ className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-black text-[10px] font-extrabold uppercase tracking-wide shadow-sm ${className}`}
  >
    <Crown size={11} strokeWidth={2.5} />
    ADMIN
  </span>
);

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