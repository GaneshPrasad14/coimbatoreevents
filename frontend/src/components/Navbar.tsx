import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RegistrationModal } from './RegistrationModal';

interface NavbarProps {
  onNavigate: (section: string) => void;
}

export function Navbar({ onNavigate }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    // { label: 'Home', value: 'home' },
    { label: 'Events', value: 'events' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-black/95 backdrop-blur-md py-2 border-b border-yellow-400/20 shadow-lg shadow-yellow-400/5'
        : 'bg-black/80 backdrop-blur-sm py-4 border-b border-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onNavigate('home')}>
              <div className="flex items-center text-xl font-bold font-berkshire transition-transform duration-300 group-hover:scale-105">
                <span className="text-white">coimbatore</span>
                <span className="text-yellow-400">.events</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {menuItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => onNavigate(item.value)}
                  className="relative text-gray-300 hover:text-yellow-400 font-medium transition-colors group py-1"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
              {user && isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="relative px-4 py-2 text-yellow-400 font-semibold hover:text-yellow-300 transition-colors group"
                >
                  Admin Panel
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
                </button>
              )}

              <button
                onClick={() => setShowRegistration(true)}
                className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 hover:shadow-[0_0_15px_rgba(247,198,0,0.4)] hover:scale-105 transition-all duration-300"
              >
                Register
              </button>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-300 hover:text-yellow-400 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800 animate-fade-in">
            <div className="px-4 py-4 space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    onNavigate(item.value);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:text-yellow-400 hover:bg-white/5 rounded-lg transition-all duration-300"
                >
                  {item.label}
                </button>
              ))}
              {user && isAdmin && (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-yellow-400 hover:bg-white/5 rounded-lg transition-all duration-300 font-semibold"
                >
                  Admin Panel
                </button>
              )}

              <button
                onClick={() => {
                  setShowRegistration(true);
                  setIsOpen(false);
                }}
                className="block w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg text-center hover:bg-yellow-300 hover:shadow-[0_0_10px_rgba(247,198,0,0.3)] transition-all duration-300"
              >
                Register
              </button>
            </div>
          </div>
        )}
      </nav>

      {showRegistration && (
        <RegistrationModal onClose={() => setShowRegistration(false)} />
      )}
    </>
  );
}
