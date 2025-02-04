import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import LandingPage from './Pages/LandingPage';
import LoginPage from './Pages/LoginPage';
import DashboardPage from './Pages/DashboardPage';
import BudgetPage from './Pages/BudgetPage';
import TransactionsPage from './Pages/TransactionsPage';

const App: React.FC = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {isLoggedIn && <Sidebar />}
        <div className="flex-1 flex flex-col">
          {isLoggedIn && <Navbar />}
          <div className="p-6 flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage />} />
              <Route path="/dashboard" element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />} />
              <Route path="/budget" element={isLoggedIn ? <BudgetPage /> : <Navigate to="/login" />} />
              <Route path="/transactions" element={isLoggedIn ? <TransactionsPage /> : <Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
