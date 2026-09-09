import { Link } from 'react-router-dom';
import { Star, Calendar, ArrowUpRight } from 'lucide-react';
import { memo } from 'react';
import { useLanguage } from '../context/LanguageContext';

const ReviewCard = memo(({ review, compact = false }) => {
  const { language } = useLanguage();
  const animeTitle = review.animeData?.title?.english || review.animeData?.title?.romaji || 'Unknown';
  const coverImage = review.animeData?.coverImage?.extraLarge || review.animeData?.coverImage?.large || review.animeData?.coverImage?.medium;
  const rating = review.rating || 0;
  const createdAt = review.createdAt?.toDate?.() || review.createdAt;

  const getReviewText = () => {
    if (language === 'id' && review.reviewTextId) return review.reviewTextId;
    if (language === 'en' && review.reviewTextEn) return review.reviewTextEn;
    if (language === 'jp' && review.reviewTextJp) return review.reviewTextJp;
    return review.reviewTextId || review.reviewText || '';
  };

  return (
    <Link to={`/review/${review.id}`} className="group block h-full">
      <div className="card-hover h-full flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 overflow-hidden">
        <div className="relative overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage}
              alt={animeTitle}
              loading="lazy"
              className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${compact ? 'h-36 sm:h-40' : 'h-44 sm:h-52 md:h-56'}`}
            />
          ) : (
            <div className={`w-full bg-gradient-to-br from-blue-600 to-cyan-400 ${compact ? 'h-36 sm:h-40' : 'h-44 sm:h-52 md:h-56'}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur px-2 py-0.5 text-[11px] font-bold text-amber-300">
            <Star size={11} fill="currentColor" />
            {rating}/10
          </div>
        </div>
        <div className={`flex flex-col flex-1 ${compact ? 'p-3' : 'p-4'}`}>
          <h3 className={`font-display font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug ${compact ? 'text-sm' : 'text-base md:text-lg'}`}>
            {animeTitle}
          </h3>
          {!compact && (
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">
              {getReviewText() || '—'}
            </p>
          )}
          <div className={`mt-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 ${compact ? '' : 'mt-auto pt-2'}`}>
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} />
              {new Date(createdAt).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-0.5 font-semibold text-brand-600 dark:text-brand-400 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              {compact ? '' : 'Read'} <ArrowUpRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});

ReviewCard.displayName = 'ReviewCard';

export default ReviewCard;
