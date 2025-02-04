import React from 'react';
import PlaidLinkButton from '../Components/PlaidLinkButton';

const TransactionsPage: React.FC = () => {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Transactions</h1>
        <div className="mt-4 sm:mt-0">
          <PlaidLinkButton />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <p className="text-gray-600">Here you can view your recent transactions.</p>
        </div>
        {/* Add transaction list here */}
      </div>
    </main>
  );
};

export default TransactionsPage;
