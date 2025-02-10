import React from "react";
import PlaidLinkButton from '../Components/PlaidLinkButton';

const TrendsPage: React.FC = () => {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Spending Trends</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add trend charts and analytics here */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Monthly Trends</h2>
          {/* Add chart content */}
        </div>
      </div>
    </main>
  );
};

export default TrendsPage;