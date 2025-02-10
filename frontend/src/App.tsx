import React, { useEffect, useState } from 'react';
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
import { setLoggedInUser, logout } from './store/authSlice';
import TrendsPage from './Pages/TrendsPage';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state: RootState) => state.auth.loggedInUser);
  const [isLoading, setIsLoading] = useState(true);

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
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        dispatch(logout());
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-mynt-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mynt-green"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-mynt-gray-200">
        {loggedInUser && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route 
                path="/" 
                element={loggedInUser ? <Navigate to="/dashboard" /> : <LandingPage />} 
              />
              <Route 
                path="/login" 
                element={loggedInUser ? <Navigate to="/dashboard" /> : <LoginPage />} 
              />
              <Route 
                path="/signup" 
                element={loggedInUser ? <Navigate to="/dashboard" /> : <SignUpPage />} 
              />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={loggedInUser ? <DashboardPage /> : <Navigate to="/login" state={{ from: '/dashboard' }} />} 
              />
              <Route 
                path="/budget" 
                element={loggedInUser ? <BudgetPage /> : <Navigate to="/login" state={{ from: '/budget' }} />} 
              />
              <Route 
                path="/transactions" 
                element={loggedInUser ? <TransactionsPage /> : <Navigate to="/login" state={{ from: '/transactions' }} />} 
              />
              <Route 
                path="/trends" 
                element={loggedInUser ? <TrendsPage /> : <Navigate to="/login" state={{ from: '/trends' }} />} 
              />
              <Route 
                path="/accounts" 
                element={loggedInUser ? <AccountsPage /> : <Navigate to="/login" state={{ from: '/accounts' }} />} 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
