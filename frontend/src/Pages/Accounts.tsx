import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PlaidLinkButton from '../Components/PlaidLinkButton';
import { fetchAuthSession } from 'aws-amplify/auth';
import { RootState } from '../store/store';
import { setAccessTokens, setLoading, setError, setNetworthHistory, setDateRange, setCustomDateRange, updateCurrentDayNetworth } from '../store/accountsSlice';
import { FaSync } from 'react-icons/fa';
import NetworthModule from '../Components/NetworthModule';
import AccountsSummary from '../Components/AccountsSummary';

const AccountsPage: React.FC = () => {
  const dispatch = useDispatch();
  const [token, setToken] = useState<string | null>(null);
  const { accessTokens, isLoading, networthHistory, dateRange, customStartDate, customEndDate } = useSelector((state: RootState) => state.accounts);

  const fetchAccounts = async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/getUserInfo`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        dispatch(setAccessTokens(data.user.accessTokens));
      } else {
        dispatch(setError('Failed to fetch accounts'));
      }
    } catch (error) {
      dispatch(setError('Error fetching accounts'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateNetworthData = async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/updateUserNetworth`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.success) {
        dispatch(updateCurrentDayNetworth(data.networth));
        // After updating networth, refresh the history
        await fetchAccountsInfo();
      } else {
        dispatch(setError(data.error || 'Failed to update networth'));
      }
    } catch (error) {
      console.error('Error updating networth:', error);
      dispatch(setError('Error updating networth'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handlePlaidSuccess = async () => {
    await fetchAccounts();
    await updateNetworthData();
  };

  const fetchAccountsInfo = async () => {
    try {
      dispatch(setLoading(true));
      let startDate, endDate;
      
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
      } else {
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(dateRange));
      }

      // Format dates with hyphens (YYYY-MM-DD)
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/getAccountsInfo?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        dispatch(setNetworthHistory(data.networthHistory));
      } else {
        dispatch(setError('Failed to fetch account info'));
      }
    } catch (error) {
      dispatch(setError('Error fetching account info'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    const getToken = async () => {
      const session = await fetchAuthSession();
      const tk = session.tokens?.idToken?.toString();
      setToken(tk || null);
    };
    getToken();
  }, []);

  useEffect(() => {
    if (token) {
      if (accessTokens.length === 0) {
        fetchAccounts();
      }
      if (networthHistory.length === 0) {
        fetchAccountsInfo();
      }
    }
  }, [token]);

  useEffect(() => {
    if (token && accessTokens.length > 0) {
      fetchAccountsInfo();
    }
  }, [dateRange, customStartDate, customEndDate]);

  const handleDateRangeChange = (range: typeof dateRange) => {
    dispatch(setDateRange(range));
  };

  const handleCustomDateChange = (startDate: Date | null, endDate: Date | null) => {
    if (startDate && endDate) {
      dispatch(setCustomDateRange({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }));
    }
  };

  return (
    <div className="max-h-screen bg-mynt-gray-200">
      {/* Header Banner */}
      <div className="w-full bg-mynt-gray-500 py-2 px-8 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semi-bold text-white">Accounts</h1>
          <div className="text-sm text-red-500">Warning: While in demo env please do not reconnect an existing bank account</div>
          <div className="flex items-center gap-4">
            <button
              onClick={updateNetworthData}
              className="p-1 text-white hover:text-mynt-gray-200 transition-colors"
              title="Refresh Data"
            >
              <FaSync className={isLoading ? "animate-spin" : ""} size={16} />
            </button>
            <PlaidLinkButton />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-mynt-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mynt-green mx-auto"></div>
            <p className="mt-4 text-mynt-gray-400">Fetching your accounts...</p>
          </div>
        </div>
      )}

      {/* Date Range Selector */}
      <div className="container mx-auto px-4 mb-6">
        <div className="flex gap-4 items-center">
          <button
            onClick={() => handleDateRangeChange('30')}
            className={`px-4 py-2 rounded ${dateRange === '30' ? 'bg-mynt-green text-white' : 'bg-white'}`}
          >
            30 Days
          </button>
          <button
            onClick={() => handleDateRangeChange('60')}
            className={`px-4 py-2 rounded ${dateRange === '60' ? 'bg-mynt-green text-white' : 'bg-white'}`}
          >
            60 Days
          </button>
          <button
            onClick={() => handleDateRangeChange('90')}
            className={`px-4 py-2 rounded ${dateRange === '90' ? 'bg-mynt-green text-white' : 'bg-white'}`}
          >
            90 Days
          </button>
          <button
            onClick={() => handleDateRangeChange('custom')}
            className={`px-4 py-2 rounded ${dateRange === 'custom' ? 'bg-mynt-green text-white' : 'bg-white'}`}
          >
            Custom
          </button>
          {dateRange === 'custom' && (
            <div className="flex gap-2 items-center">
              <div>
                <label className="block text-sm text-mynt-gray-400 mb-1">From</label>
                <input
                  type="date"
                  value={customStartDate?.split('T')[0] || ''}
                  onChange={(e) => handleCustomDateChange(new Date(e.target.value), customEndDate ? new Date(customEndDate) : null)}
                  max={customEndDate?.split('T')[0] || undefined}
                  className="p-2 rounded border focus:outline-none focus:ring-1 focus:ring-mynt-green"
                />
              </div>
              <div>
                <label className="block text-sm text-mynt-gray-400 mb-1">To</label>
                <input
                  type="date"
                  value={customEndDate?.split('T')[0] || ''}
                  onChange={(e) => handleCustomDateChange(customStartDate ? new Date(customStartDate) : null, new Date(e.target.value))}
                  min={customStartDate?.split('T')[0] || undefined}
                  max={new Date().toISOString().split('T')[0]}
                  className="p-2 rounded border focus:outline-none focus:ring-1 focus:ring-mynt-green"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 space-y-6">
        {/* Networth Chart */}
        <NetworthModule networthHistory={networthHistory} />
        
        {/* Accounts and Summary */}
        <AccountsSummary networthHistory={networthHistory} />
      </div>

      <div className="container mx-auto px-4 pt-6">
        <div className="text-lg font-semibold">Things to note when connecting a bank account in sandbox</div>
        <div className="text-lg font-semibold">Username: user_good and Password: pass_good</div>
        <div className="text-lg font-semibold">You can skip anything that requires a phone number</div>
        </div>
    </div>
  );
};

export default AccountsPage;
