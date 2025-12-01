import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RegistrationModal } from './RegistrationModal';

interface NavbarProps {
  onNavigate: (section: string) => void;
}

export function Navbar({ onNavigate }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const { user, isAdmin } = useAuth();

  const menuItems = [
    // { label: 'Home', value: 'home' },
    { label: 'Events', value: 'events' },
  ];

  return (
    <>
      <nav className="bg-black shadow-md shadow-yellow-400/20 sticky top-0 z-50 border-b border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>

              <div className="flex items-center text-xl font-bold font-berkshire">
                <span className="text-white">coimbatore</span>
                <span className="text-yellow-400">.events</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {menuItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => onNavigate(item.value)}
                  className="text-gray-300 hover:text-yellow-400 font-medium transition-colors"
                >
                  {item.label}
                </button>
              ))}
              {user && isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="px-4 py-2 text-yellow-400 font-semibold hover:text-yellow-300 transition-colors"
                >
                  Admin Panel
                </button>
              )}

              <button
                onClick={() => setShowRegistration(true)}
                className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/50 transition-all duration-300"
              >
                Register
              </button>

              {/* <button
                onClick={() => onNavigate('login')}
                className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/50 transition-all duration-300"
              >
                {user ? 'Account' : 'Login'}
              </button> */}
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-300"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-black border-t border-gray-700">
            <div className="px-4 py-4 space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    onNavigate(item.value);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
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
                  className="block w-full text-left px-4 py-2 text-yellow-400 hover:bg-gray-800 rounded-lg transition-colors font-semibold"
                >
                  Admin Panel
                </button>
              )}

              <button
                onClick={() => {
                  setShowRegistration(true);
                  setIsOpen(false);
                }}
                className="block w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg text-center"
              >
                Register
              </button>

              {/* <button
                onClick={() => {
                  onNavigate('login');
                  setIsOpen(false);
                }}
                className="block w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg text-center"
              >
                {user ? 'Account' : 'Login'}
              </button> */}
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
