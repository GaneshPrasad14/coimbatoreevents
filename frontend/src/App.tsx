import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { EventsSection } from './components/EventsSection';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPage } from './components/LoginPage';
import { EventDetailsPage } from './components/EventDetailsPage';
import { MusicPlayer } from './components/MusicPlayer';
import { Event } from './lib/api';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (section: string) => {
    if (section === 'admin') {
      navigate('/admin');
    } else if (section === 'login') {
      navigate('/login');
    } else {
      if (location.pathname !== '/') {
        navigate('/');
        // Scroll after navigation
        setTimeout(() => {
          if (section === 'events') {
            document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo(0, 0);
          }
        }, 100);
      } else {
        if (section === 'events') {
          document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo(0, 0);
        }
      }
    }
  };

  const handleEventSelect = (event: Event) => {
    navigate(`/event/${event.id || event._id}`);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-black">
        <Routes>
          <Route path="/" element={
            <>
              <Navbar onNavigate={handleNavigation} />
              <HeroSection onEventSelect={handleEventSelect} />
              <div id="events-section">
                <EventsSection onEventSelect={handleEventSelect} />
              </div>
              <Footer />
            </>
          } />

          <Route path="/admin" element={
            <>
              <Navbar onNavigate={handleNavigation} />
              <AdminDashboard />
            </>
          } />

          <Route path="/login" element={
            <LoginPage
              onBack={() => navigate('/')}
              onLoginSuccess={() => navigate('/admin')}
            />
          } />

          <Route path="/event/:id" element={<EventDetailsPage />} />
        </Routes>

        <MusicPlayer />
      </div>
    </AuthProvider>
  );
}

export default App;
