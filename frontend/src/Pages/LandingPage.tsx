import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Welcome to Mint Clone</h1>
          <p className="text-lg sm:text-xl mb-8 text-gray-600">Manage your finances effortlessly.</p>
          <Link 
            to="/login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
};

export default LandingPage;
