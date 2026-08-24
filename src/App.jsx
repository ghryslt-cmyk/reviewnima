import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Reviews from './pages/Reviews';
import ReviewDetail from './pages/ReviewDetail';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import TopFavorites from './pages/TopFavorites';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import SeasonalSidebars from './components/SeasonalSidebars';

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SeasonalSidebars />
      <div className="relative z-10 shadow-[8px_0_32px_rgba(0,0,0,0.8),-8px_0_32px_rgba(0,0,0,0.8)] dark:shadow-[8px_0_32px_rgba(0,0,0,0.9),-8px_0_32px_rgba(0,0,0,0.9)]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/review/:id" element={<ReviewDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/top-favorites" element={<TopFavorites />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
