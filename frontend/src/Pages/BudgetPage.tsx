import React from 'react';
import BudgetCategory from '../Components/BudgetCategory';

const BudgetPage: React.FC = () => {
  const budgetData = [
    { category: 'Housing', allocated: 1000, spent: 700 },
    { category: 'Food', allocated: 500, spent: 300 },
    { category: 'Entertainment', allocated: 200, spent: 150 },
    { category: 'Transportation', allocated: 300, spent: 250 },
  ];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Budget Overview</h1>
      <section className="space-y-4">
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
