import { Link } from 'react-router-dom';
import { Star, Calendar } from 'lucide-react';
import { memo } from 'react';

const ReviewCard = memo(({ review }) => {
  const animeTitle = review.animeData?.title?.english || review.animeData?.title?.romaji || 'Unknown';
  // Use highest quality image available: extraLarge > large > medium
  const coverImage = review.animeData?.coverImage?.extraLarge || review.animeData?.coverImage?.large || review.animeData?.coverImage?.medium;
  const rating = review.rating || 0;
  const createdAt = review.createdAt?.toDate?.() || review.createdAt;

  return (
    <Link to={`/review/${review.id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          {coverImage && (
            <img
              src={coverImage}
              alt={animeTitle}
              className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover"
            />
          )}
          <div className="absolute top-2 right-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-2 py-1 rounded-full flex items-center space-x-1 text-xs border border-gray-700 dark:border-gray-300">
            <Star size={12} fill="currentColor" />
            <span className="font-bold">{rating}/10</span>
          </div>
        </div>
        <div className="p-3 sm:p-4 flex flex-col h-32 sm:h-36 md:h-40">
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {animeTitle}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-xs md:text-sm line-clamp-1 mb-3 flex-grow">
            {review.reviewText || 'No review text available'}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar size={10} />
              <span className="text-[10px] sm:text-xs">{new Date(createdAt).toLocaleDateString()}</span>
            </div>
            <span className="text-gray-900 dark:text-white font-medium text-xs">Read Review →</span>
          </div>
        </div>
      </div>
    </Link>
  );
});

ReviewCard.displayName = 'ReviewCard';

export default ReviewCard;
