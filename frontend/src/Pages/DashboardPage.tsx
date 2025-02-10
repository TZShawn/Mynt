import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setTransactions, setLoading, setError } from '../store/transactionsSlice';
import PlaidLinkButton from '../Components/PlaidLinkButton';
import { fetchAuthSession } from 'aws-amplify/auth';
import { FaSync } from 'react-icons/fa';

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const { transactions, isLoading } = useSelector((state: RootState) => state.transactions);
  const [token, setToken] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/transactions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        dispatch(setTransactions(data.response));
      } else {
        dispatch(setError('Failed to fetch transactions'));
      }
    } catch (error) {
      dispatch(setError('Error fetching transactions'));
    }
  };

  useEffect(() => {
    const getToken = async () => {
      const session = await fetchAuthSession();
      const tk = session.tokens?.idToken?.toString();
      setToken(tk || null);
    }
    getToken();
  }, []);

  useEffect(() => {
    if (token && transactions.length === 0) {
      fetchTransactions();
    }
  }, [token, transactions.length]);

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-700">Fetching your transactions...</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome to your Dashboard!</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchTransactions}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              title="Refresh Transactions"
            >
              <FaSync className={isLoading ? 'animate-spin' : ''} />
            </button>
            <PlaidLinkButton />
          </div>
        </div>

        <div className="col-span-full">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {transactions.length === 0 ? (
              <p className="p-4 text-center text-gray-600">No transactions found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction.transactionId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.transDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.transCategory.join(' > ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${transaction.transAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
