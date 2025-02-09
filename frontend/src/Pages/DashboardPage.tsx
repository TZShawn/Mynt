import React, { useEffect, useState } from 'react';
import PlaidLinkButton from '../Components/PlaidLinkButton';
import { fetchAuthSession } from 'aws-amplify/auth';

const DashboardPage: React.FC = () => {
  
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      const session = await fetchAuthSession();
      const tk = session.tokens?.idToken?.toString();
      setToken(tk || null);
    }
    getToken();

  }, []);


  const getTransactions = async () => {
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log(data)
  }


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
        
        <button onClick={() => {
          getTransactions()
        }}>
          Get Transactions
        </button>

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
