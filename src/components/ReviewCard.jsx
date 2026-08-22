import { Link } from 'react-router-dom';
import { Star, Calendar } from 'lucide-react';

const ReviewCard = ({ review }) => {
  const animeTitle = review.animeData?.title?.english || review.animeData?.title?.romaji || 'Unknown';
  const coverImage = review.animeData?.coverImage?.large || review.animeData?.coverImage?.medium;
  const rating = review.rating || 0;

  return (
    <Link to={`/review/${review.id}`} className="block">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-800">
        <div className="relative">
          {coverImage && (
            <img
              src={coverImage}
              alt={animeTitle}
              className="w-full h-48 sm:h-64 object-cover"
            />
          )}
          <div className="absolute top-2 right-2 bg-black dark:bg-white text-white dark:text-black px-2 sm:px-3 py-1 rounded-full flex items-center space-x-1 text-xs sm:text-sm">
            <Star size={14} sm:size={16} fill="currentColor" />
            <span className="font-bold">{rating}/10</span>
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {animeTitle}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm line-clamp-3 mb-3">
            {review.reviewText || 'No review text available'}
          </p>
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar size={12} sm:size={14} />
              <span>{new Date(review.createdAt?.toDate?.() || review.createdAt).toLocaleDateString()}</span>
            </div>
            <span className="text-gray-900 dark:text-white font-medium">Read Review →</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ReviewCard;
