import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, BookOpen, User, LogOut, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, checkAdmin, isAuthenticated } = useAuth();
  const isAdminUser = checkAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-black text-black dark:text-white shadow-xl border-b-2 border-black dark:border-white transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-black dark:text-white hover:scale-105 transition-transform duration-300">
              ReviewNima
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-all duration-300">
                <Home size={20} />
                <span>Beranda</span>
              </Link>
              <Link to="/reviews" className="flex items-center space-x-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-all duration-300">
                <BookOpen size={20} />
                <span>Reviews</span>
              </Link>
              {isAdminUser && (
                <Link to="/admin" className="flex items-center space-x-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-all duration-300">
                  <Shield size={20} />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center space-x-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-all duration-300">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border-2 border-black dark:border-white"
                    />
                  ) : (
                    <User size={20} />
                  )}
                  <span className="hidden md:inline">{user?.displayName}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-all duration-300"
                >
                  <LogOut size={20} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-black dark:bg-white text-white dark:text-white hover:bg-gray-800 dark:hover:bg-gray-200 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 font-medium hover:scale-105 border-2 border-black dark:border-white"
              >
                Login
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t-2 border-black dark:border-white">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-all duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home size={20} />
              <span>Beranda</span>
            </Link>
            <Link 
              to="/reviews" 
              className="flex items-center space-x-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-all duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen size={20} />
              <span>Reviews</span>
            </Link>
            {isAdminUser && (
              <Link 
                to="/admin" 
                className="flex items-center space-x-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield size={20} />
                <span>Admin Panel</span>
              </Link>
            )}
            {isAuthenticated && (
              <Link 
                to="/profile" 
                className="flex items-center space-x-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={20} />
                <span>Profile</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
