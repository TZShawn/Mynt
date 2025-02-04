import React from 'react';
import BudgetCategory from '../Components/BudgetCategory';
import PlaidLinkButton from '../Components/PlaidLinkButton';

const BudgetPage: React.FC = () => {
  const budgetData = [
    { category: 'Housing', allocated: 1000, spent: 700 },
    { category: 'Food', allocated: 500, spent: 300 },
    { category: 'Entertainment', allocated: 200, spent: 150 },
    { category: 'Transportation', allocated: 300, spent: 250 },
  ];

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Budget Overview</h1>
        <div className="mt-4 sm:mt-0">
          <PlaidLinkButton />
        </div>
      </div>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetData.map((item) => (
          <BudgetCategory
            key={item.category}
            category={item.category}
            allocated={item.allocated}
            spent={item.spent}
          />
        ))}
      </section>
    </main>
  );
};

export default BudgetPage;
