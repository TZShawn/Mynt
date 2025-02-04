import React, { useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = React.useState<Account[]>([]);

  const onSuccess = useCallback((publicToken: string, metadata: any) => {
    // For now, just add a mock account
    setAccounts(prev => [...prev, {
      id: Math.random().toString(),
      name: 'Test Account',
      type: 'Checking',
      balance: 1000.00
    }]);
  }, []);

  const config = {
    token: null,
    onSuccess,
    env: 'sandbox',
    product: ['auth', 'transactions'],
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Connected Accounts
        </h1>
        <button
          onClick={() => open()}
          disabled={!ready}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300"
        >
          + Link Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <p className="text-center text-gray-600 my-8">
          No accounts connected yet. Click "Link Account" to get started.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900">{account.name}</h3>
              <p className="text-gray-600 mt-1">{account.type}</p>
              <p className="text-2xl font-bold text-gray-900 mt-4">
                ${account.balance.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
