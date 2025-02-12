import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePlaidLink } from 'react-plaid-link';
import PlaidLinkButton from '../Components/PlaidLinkButton';
import { fetchAuthSession } from 'aws-amplify/auth';
import { RootState } from '../store/store';
import { setAccessTokens, setLoading, setError } from '../store/accountsSlice';
import { FaSync } from 'react-icons/fa';

const AccountsPage: React.FC = () => {
  const dispatch = useDispatch();
  const [token, setToken] = useState<string | null>(null);
  const { accessTokens, isLoading } = useSelector((state: RootState) => state.accounts);

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
    if (token && accessTokens.length === 0) {
      fetchAccounts();
    }
  }, [token, accessTokens.length]);

  return (
    <div className="max-h-screen bg-mynt-gray-200">
      {/* Header Banner */}
      <div className="w-full bg-mynt-gray-500 py-2 px-8 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semi-bold text-white">Accounts</h1>
          <div className="text-sm text-red-500">Warning: While in demo env please do not reconnect an existing bank account</div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchAccounts}
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

      {accessTokens.length === 0 ? (
        <p className="text-center text-gray-600 my-8">
          No accounts connected yet. Click "Link Account" to get started.
        </p>
      ) : (
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accessTokens.map((accessToken) => (
              <div
                key={accessToken.access_token}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{accessToken.bank_name}</h3>
                  <span className="text-sm text-mynt-gray-400">
                    Last synced: {new Date(accessToken.last_synced).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2">
                  {accessToken.accounts.map((account) => (
                    <div
                      key={account.account_id}
                      className="p-3 bg-mynt-gray-200 rounded-md"
                    >
                      <p className="font-medium text-mynt-gray-500">{account.account_name}</p>
                      <p className="text-sm text-mynt-gray-400 capitalize">{account.account_subtype}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="text-lg pt-4 font-semibold">Things to note when connecting a bank account in sandbox</div>
      <div className="text-lg pt-4 font-semibold">Username: user_good and Password: pass_good</div>
      <div className="text-lg pt-4 font-semibold">You can skip anything that requires a phone number</div>
    </div>
  );
};

export default AccountsPage;
