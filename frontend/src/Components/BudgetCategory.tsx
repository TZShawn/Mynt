import React from 'react';
import ProgressBar from './ProgressBar';

interface BudgetCategoryProps {
  category: string;
  allocated: number;
  spent: number;
}

const BudgetCategory: React.FC<BudgetCategoryProps> = ({ category, allocated, spent }) => {
  const percentageSpent = Math.min((spent / allocated) * 100, 100);

  return (
    <div className="bg-white p-4 shadow rounded">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{category}</h2>
        <div className="text-right">
          <p className="text-sm">Spent: ${spent.toFixed(2)}</p>
          <p className="text-sm">Allocated: ${allocated.toFixed(2)}</p>
        </div>
      </div>
      <ProgressBar percentage={percentageSpent} />
    </div>
  );
};

export default BudgetCategory;
