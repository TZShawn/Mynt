import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true'); // Mock login
    navigate('/dashboard');
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">Login to Your Account</h2>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
