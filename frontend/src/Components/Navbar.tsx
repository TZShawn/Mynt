import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-mynt-gray-500">Finance Tracker</h1>
        <button
          onClick={handleLogout}
          className="bg-mynt-green hover:bg-mynt-gray-400 text-white px-4 py-2 rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
