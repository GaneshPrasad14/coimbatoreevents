import React from 'react';

export function Footer() {
  return (
    <footer className="bg-black text-white relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in">

          {/* Logo */}
          <div className="flex items-center gap-2 transform hover:scale-105 transition-transform duration-300">
            <span className="text-3xl font-bold font-berkshire text-white drop-shadow-lg">coimbatore</span>
            <span className="text-3xl font-bold font-berkshire text-yellow-400 drop-shadow-[0_0_10px_rgba(247,198,0,0.5)]">.events</span>
          </div>

          {/* Divider with Neon Glow */}
          <div className="w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent shadow-[0_0_15px_rgba(247,198,0,0.4)] my-8" />

          {/* Copyright */}
          <p className="text-gray-400 text-sm font-light tracking-wide">
            &copy; {new Date().getFullYear()}{' '}
            <span className="font-berkshire text-yellow-400">coimbatore.events</span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
