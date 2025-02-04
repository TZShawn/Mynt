import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className="bg-gray-800 text-white w-64 p-4 space-y-4">
      <h2 className="text-xl font-semibold">Navigation</h2>
      <ul className="space-y-2">
        <li><Link to="/dashboard" className="hover:bg-gray-700 p-2 block rounded">Dashboard</Link></li>
        <li><Link to="/accounts" className="hover:bg-gray-700 p-2 block rounded">Accounts</Link></li>
        <li><Link to="/budget" className="hover:bg-gray-700 p-2 block rounded">Budget</Link></li>
        <li><Link to="/transactions" className="hover:bg-gray-700 p-2 block rounded">Transactions</Link></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
