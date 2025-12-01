import React from 'react';


export function Footer() {
  return (
    <footer className="bg-black text-white relative">
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        <div className="mt-8 pt-6 border-t border-gray-700 text-center space-y-4">
          <div className="flex items-center justify-center">
            <span className="text-2xl font-bold font-berkshire text-white">coimbatore</span>
            <span className="text-2xl font-bold font-berkshire text-yellow-400">.events</span>
          </div>
          <p className="text-gray-300 text-sm font-medium">
            &copy; {new Date().getFullYear()}{' '}
            <span className="font-berkshire text-yellow-400">coimbatore.events</span>
            {' '}All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
