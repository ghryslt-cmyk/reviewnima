import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, BookOpen, User, LogOut, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout, checkAdmin, isAuthenticated } = useAuth();
  const isAdminUser = checkAdmin();

  return (
    <nav className="bg-black dark:bg-white text-white dark:text-black shadow-lg border-b border-gray-800 dark:border-gray-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/" className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-black dark:to-gray-800 animate-pulse">
              ReviewNima
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="flex items-center space-x-2 hover:text-gray-400 dark:hover:text-gray-600 transition-colors">
                <Home size={20} />
                <span>Beranda</span>
              </Link>
              <Link to="/reviews" className="flex items-center space-x-2 hover:text-gray-400 dark:hover:text-gray-600 transition-colors">
                <BookOpen size={20} />
                <span>Reviews</span>
              </Link>
              {isAdminUser && (
                <Link to="/admin" className="flex items-center space-x-2 hover:text-gray-400 dark:hover:text-gray-600 transition-colors">
                  <Shield size={20} />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center space-x-2 hover:text-gray-400 dark:hover:text-gray-600 transition-colors">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border-2 border-gray-600 dark:border-gray-400"
                    />
                  ) : (
                    <User size={20} />
                  )}
                  <span className="hidden md:inline">{user?.displayName}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 hover:text-gray-400 dark:hover:text-gray-600 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-white dark:bg-black text-black dark:text-white border border-gray-600 dark:border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 font-medium hover:scale-105"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
