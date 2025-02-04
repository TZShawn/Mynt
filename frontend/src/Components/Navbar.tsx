import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Mint Dashboard</h1>
      <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">
        Logout
      </button>
    </header>
  );
};

export default Navbar;
