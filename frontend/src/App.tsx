import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import LandingPage from './Pages/LandingPage';
import LoginPage from './Pages/LoginPage';
import DashboardPage from './Pages/DashboardPage';
import BudgetPage from './Pages/BudgetPage';
import TransactionsPage from './Pages/TransactionsPage';
import AccountsPage from './Pages/Accounts';
import SignUpPage from './Pages/SignUpPage';
import { RootState } from './store/store';


const App: React.FC = () => {
  const loggedInUser = useSelector((state: RootState) => state.auth.loggedInUser);
  const isLoggedIn = !!loggedInUser;

  return (
    <Router>
      <div className="flex min-h-screen h-full w-full bg-gray-100">
        {isLoggedIn && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-auto">
          {isLoggedIn && <Navbar />}
          <div className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage />} />
              <Route path="/dashboard" element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />} />
              <Route path="/budget" element={isLoggedIn ? <BudgetPage /> : <Navigate to="/login" />} />
              <Route path="/transactions" element={isLoggedIn ? <TransactionsPage /> : <Navigate to="/login" />} />
              <Route path="/accounts" element={isLoggedIn ? <AccountsPage /> : <Navigate to="/login" />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
