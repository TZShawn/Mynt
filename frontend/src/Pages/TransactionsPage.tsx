import React from 'react';
import PlaidLinkButton from '../Components/PlaidLinkButton';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const TransactionsPage: React.FC = () => {

  const { transactions, isLoading } = useSelector((state: RootState) => state.transactions);

  return (
    <main className="container mx-auto sm:px-4 lg:px-2 w-full py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Transactions</h1>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {isLoading ? <p>Loading...</p> : (
            <div className="min-w-full">
              {/* Header */}
              <div className="bg-gray-50 grid grid-cols-3 gap-4 px-6 py-3 border-b border-gray-200">
                <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</div>
                <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</div>
                <div className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</div>
              </div>
              
              {/* Transaction Rows */}
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.transactionId} 
                    className="grid grid-cols-3 gap-4 px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(transaction.transDate).toLocaleDateString()}
                    </div>
          
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {transaction.transCategory.join('/')}
                    </div>
                    <div className={`text-sm text-gray-500 whitespace-nowrap text-right ${transaction.transAmount < 0 && 'text-green-500'}`}>
                      {transaction.transAmount < 0 ? `+$${Math.abs(Number(transaction.transAmount.toFixed(2)))}` : `$${transaction.transAmount.toFixed(2)}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default TransactionsPage;
