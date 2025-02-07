import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from 'aws-amplify/auth';
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
import { setLoggedInUser } from './store/authSlice';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state: RootState) => state.auth.loggedInUser);
  const isLoggedIn = !!loggedInUser;

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          dispatch(setLoggedInUser({
            id: user.userId,
            email: user.username,
            name: user.username
          }));
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };

    if (!loggedInUser) {
      checkUser();
    }
  }, [dispatch, loggedInUser]);

  return (
    <Router>
      <div className="flex min-h-screen h-full w-full bg-gray-100">
        {isLoggedIn && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-auto">
          {isLoggedIn && <Navbar />}
          <div className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LandingPage />} />
              <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage />} />
              <Route path="/dashboard" element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />} />
              <Route path="/budget" element={isLoggedIn ? <BudgetPage /> : <Navigate to="/login" />} />
              <Route path="/transactions" element={isLoggedIn ? <TransactionsPage /> : <Navigate to="/login" />} />
              <Route path="/accounts" element={isLoggedIn ? <AccountsPage /> : <Navigate to="/login" />} />
              <Route path="/signup" element={isLoggedIn ? <Navigate to="/dashboard" /> : <SignUpPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
