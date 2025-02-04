import React from 'react';
import PlaidLinkButton from '../Components/PlaidLinkButton';

const DashboardPage: React.FC = () => {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full">
          <h1 className="text-2xl sm:text-3xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to your Dashboard!</p>
          <div className="mt-4">
            <PlaidLinkButton />
          </div>
        </div>
        
        {/* Add more dashboard widgets here */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Quick Stats</h2>
          {/* Add stats content */}
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
