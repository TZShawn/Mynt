import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import logl from "../logl.png";
import { signOut } from 'aws-amplify/auth';
import {
  FaChevronLeft,
  FaChevronRight,
  FaTachometerAlt,
  FaWallet,
  FaExchangeAlt,
  FaChartLine,
  FaPiggyBank,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      // Sign out from Amplify
      await signOut({ global: true });
      // Clear Redux state
      dispatch(logout());
      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`bg-mynt-green flex flex-col h-screen ${
        isCollapsed ? "w-18" : "w-64"
      } transition-all duration-300`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center cursor-pointer">
          <img
            onClick={() => {
              if (!isCollapsed) {
                navigate("/dashboard");
              } else {
                toggleSidebar();
              }
            }}
            src={logl}
            alt="logo"
            className="w-10 h-10"
          />
          {!isCollapsed && (
            <h1
              onClick={() => {
                if (!isCollapsed) {
                  navigate("/dashboard");
                } else {
                  toggleSidebar();
                }
              }}
              className="text-white text-xl font-bold ml-3"
            >
              Mynt
            </h1>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-mynt-gray-200 transition-colors"
          >
            <FaChevronLeft size={16} />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/dashboard"
              className={`text-white hover:bg-mynt-green-200 p-2 rounded transition-colors flex items-center ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <FaTachometerAlt size={18} />
              {!isCollapsed && <span className="ml-3">Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/accounts"
              className={`text-white hover:bg-mynt-green-200 p-2 rounded transition-colors flex items-center ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <FaWallet size={18} />
              {!isCollapsed && <span className="ml-3">Accounts</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/transactions"
              className={`text-white hover:bg-mynt-green-200 p-2 rounded transition-colors flex items-center ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <FaExchangeAlt size={18} />
              {!isCollapsed && <span className="ml-3">Transactions</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/trends"
              className={`text-white hover:bg-mynt-green-200 p-2 rounded transition-colors flex items-center ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <FaChartLine size={18} />
              {!isCollapsed && <span className="ml-3">Trends</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/budget"
              className={`text-white hover:bg-mynt-green-200 p-2 rounded transition-colors flex items-center ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <FaPiggyBank size={18} />
              {!isCollapsed && <span className="ml-3">Budget</span>}
            </Link>
          </li>
        </ul>
      </nav>
      <button
        onClick={handleLogout}
        className={`text-white hover:bg-mynt-green-200 p-2 rounded transition-colors flex items-center ${
          isCollapsed ? "justify-center" : ""
        } mx-4 mb-4`}
      >
        <FaSignOutAlt size={20} />
        {!isCollapsed && <span className="ml-3 font-semibold">Logout</span>}
      </button>
    </aside>
  );
};

export default Sidebar;
