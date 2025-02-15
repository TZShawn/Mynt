import React from 'react';
import { Account } from '../store/accountsSlice';

interface NetworthData {
  date: string;
  networth: number;
  accounts: Account[];
}

interface AccountsSummaryProps {
  networthHistory: NetworthData[];
}

const AccountsSummary: React.FC<AccountsSummaryProps> = ({ networthHistory }) => {
  const getCurrentNetworth = () => {
    if (!networthHistory.length) return null;
    const today = new Date().toISOString().split('T')[0];
    return networthHistory.find(data => data.date.split('T')[0] === today) || networthHistory[networthHistory.length - 1];
  };

  const groupAccountsByBank = () => {
    const currentData = getCurrentNetworth();
    if (!currentData) return {};

    return currentData.accounts.reduce((acc: { [key: string]: { credit: Account[]; cash: Account[] } }, account) => {
      if (!acc[account.account_name.split(' ')[0]]) {
        acc[account.account_name.split(' ')[0]] = { credit: [], cash: [] };
      }
      
      if (account.account_type === 'credit') {
        acc[account.account_name.split(' ')[0]].credit.push(account);
      } else {
        acc[account.account_name.split(' ')[0]].cash.push(account);
      }
      
      return acc;
    }, {});
  };

  const calculateTotals = () => {
    const currentData = getCurrentNetworth();
    if (!currentData) return { totalCash: 0, totalLiabilities: 0, networth: 0 };

    const totals = currentData.accounts.reduce(
      (acc, account) => {
        if (account.account_type === 'credit') {
          acc.totalLiabilities += account.balance;
        } else {
          acc.totalCash += account.balance;
        }
        return acc;
      },
      { totalCash: 0, totalLiabilities: 0 }
    );

    return {
      ...totals,
      networth: totals.totalCash - Math.abs(totals.totalLiabilities)
    };
  };

  const currentNetworth = getCurrentNetworth();
  const bankAccounts = groupAccountsByBank();
  const { totalCash, totalLiabilities, networth } = calculateTotals();

  if (!currentNetworth) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center text-mynt-gray-400">No account data available</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center text-mynt-gray-400">No summary data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Accounts List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-mynt-gray-500 mb-4">Accounts</h2>
        <div className="space-y-6">
          {Object.entries(bankAccounts).map(([bank, accounts]) => (
            <div key={bank} className="border-b border-mynt-gray-200 last:border-0 pb-4 last:pb-0">
              <h3 className="text-lg font-semibold mb-3">{bank}</h3>
              
              {accounts.cash.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-mynt-gray-400 mb-2">Cash Accounts</h4>
                  <div className="space-y-2">
                    {accounts.cash.map(account => (
                      <div key={account.account_id} className="bg-mynt-gray-100 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{account.account_name}</p>
                            <p className="text-sm text-mynt-gray-400">****{account.mask}</p>
                          </div>
                          <p className="text-lg font-semibold">${account.balance.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {accounts.credit.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-mynt-gray-400 mb-2">Credit Accounts</h4>
                  <div className="space-y-2">
                    {accounts.credit.map(account => (
                      <div key={account.account_id} className="bg-mynt-gray-100 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{account.account_name}</p>
                            <p className="text-sm text-mynt-gray-400">****{account.mask}</p>
                          </div>
                          <p className="text-lg font-semibold text-red-500">${Math.abs(account.balance).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Panel */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-mynt-gray-500 mb-4">Summary</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-mynt-gray-500 mb-2">Assets & Liabilities</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm text-mynt-gray-400">Assets</h4>
                <p className="text-xl font-semibold">${totalCash.toFixed(2)}</p>
                <div className="w-full bg-mynt-gray-200 h-2 rounded-full mt-1">
                  <div 
                    className="bg-mynt-green h-full rounded-full" 
                    style={{ width: `${(totalCash / (totalCash + Math.abs(totalLiabilities))) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <h4 className="text-sm text-mynt-gray-400">Liabilities</h4>
                <p className="text-xl font-semibold">${Math.abs(totalLiabilities).toFixed(2)}</p>
                <div className="w-full bg-mynt-gray-200 h-2 rounded-full mt-1">
                  <div 
                    className="bg-red-500 h-full rounded-full" 
                    style={{ width: `${(Math.abs(totalLiabilities) / (totalCash + Math.abs(totalLiabilities))) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-mynt-gray-500 mb-2">Net Worth</h3>
            <p className="text-3xl font-bold text-mynt-green">${networth.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsSummary; 