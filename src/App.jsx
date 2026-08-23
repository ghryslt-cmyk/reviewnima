import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Reviews from './pages/Reviews';
import ReviewDetail from './pages/ReviewDetail';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import TopFavorites from './pages/TopFavorites';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/review/:id" element={<ReviewDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/top-favorites" element={<TopFavorites />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
