import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, BookOpen, User, LogOut, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout, checkAdmin, isAuthenticated } = useAuth();
  const isAdminUser = checkAdmin();

  return (
    <nav className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
              Review Form Morviss
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
                <Home size={20} />
                <span>Beranda</span>
              </Link>
              <Link to="/reviews" className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
                <BookOpen size={20} />
                <span>Reviews</span>
              </Link>
              {isAdminUser && (
                <Link to="/admin" className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
                  <Shield size={20} />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border-2 border-purple-400"
                    />
                  ) : (
                    <User size={20} />
                  )}
                  <span className="hidden md:inline">{user?.displayName}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 hover:text-purple-300 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors font-medium"
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
