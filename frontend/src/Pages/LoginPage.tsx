import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true'); // Mock login
    navigate('/dashboard');
  };

  return (
    <main className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h2 className="text-3xl font-semibold mb-6">Login to Your Account</h2>
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Login
        </button>
      </div>
    </main>
  );
};

export default LoginPage;
