import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <main className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Mint Clone</h1>
        <p className="text-lg mb-8">Manage your finances effortlessly.</p>
        <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded">
          Get Started
        </Link>
      </div>
    </main>
  );
};

export default LandingPage;
