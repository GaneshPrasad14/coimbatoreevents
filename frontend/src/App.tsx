import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { EventsSection } from './components/EventsSection';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPage } from './components/LoginPage';
import { EventDetailsModal } from './components/EventDetailsModal';
import { MusicPlayer } from './components/MusicPlayer';
import { Event } from './lib/api';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'login'>('home');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    // Check if URL path is /admin
    if (window.location.pathname === '/admin') {
      setCurrentView('login');
    }
  }, []);

  const handleNavigation = (section: string) => {
    if (section === 'admin') {
      setCurrentView('admin');
    } else if (section === 'login') {
      setCurrentView('login');
    } else {
      setCurrentView('home');
      if (section === 'events') {
        document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-black">
        {currentView === 'admin' ? (
          <>
            <Navbar onNavigate={handleNavigation} />
            <AdminDashboard />
          </>
        ) : currentView === 'login' ? (
          <LoginPage
            onBack={() => setCurrentView('home')}
            onLoginSuccess={() => setCurrentView('admin')}
          />
        ) : (
          <>
            <Navbar onNavigate={handleNavigation} />
            <HeroSection onEventSelect={handleEventSelect} />
            <div id="events-section">
              <EventsSection onEventSelect={handleEventSelect} />
            </div>
            <Footer />
          </>
        )}

        {selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}

        <MusicPlayer />
      </div>
    </AuthProvider>
  );
}

export default App;
