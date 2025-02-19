import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Typography, Box, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddBudgetModal from "../Components/AddBudgetModal";
import { RootState } from "../store/store";
import { getCategory } from "../utils/getCategory";
import { subcategories } from "../utils/listCategories";

const BudgetPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const budgets = useSelector((state: RootState) => state.budgets.budgets);

  // Group transactions by category and sum amounts
  const spentByCategory = transactions.reduce((acc: Record<string, number>, trans) => {
    const category = trans.transCategory;
    acc[category] = (acc[category] || 0) + trans.transAmount;
    return acc;
  }, {});

  // Group budgets by general category
  const groupedBudgets = budgets.reduce((acc: Record<string, typeof budgets>, budget) => {
    const generalCategory = getCategory(budget.category);
    if (!acc[generalCategory]) {
      acc[generalCategory] = [];
    }
    acc[generalCategory].push(budget);
    return acc;
  }, {});

  const handleSaveBudget = async (budget: any) => {
    try {
      const response = await fetch('/api/createBudget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budget),
      });
      if (!response.ok) throw new Error('Failed to create budget');
      // Update Redux store here
    } catch (error) {
      console.error('Error creating budget:', error);
    }
  };

  const handleUpdateBudget = async (budgetId: string, newAmount: number) => {
    try {
      const response = await fetch('/api/updateBudget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ budgetId, budgetedAmount: newAmount }),
      });
      if (!response.ok) throw new Error('Failed to update budget');
      // Update Redux store here
      setEditingBudget(null);
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  return (
    <div className="max-h-screen bg-mynt-gray-200">
      <div className="w-full bg-mynt-gray-500 py-3 px-8 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semi-bold text-white">Budget</h1>
          <div className="flex-1" />
          <div 
            className="text-white hover:text-mynt-gray-200 transition-colors cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            Add new budget
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {Object.entries(groupedBudgets).map(([group, budgets]) => (
          <Box key={group} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{group}</Typography>
            {budgets.map((budget) => {
              const spent = spentByCategory[budget.category] || 0;
              const remaining = budget.budgetedAmount - spent;
              const isOverBudget = remaining < 0;

              return (
                <Box 
                  key={budget.budgetId}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    p: 2,
                    backgroundColor: 'white',
                    borderRadius: 1
                  }}
                >
                  <Typography sx={{ flex: 1 }}>{budget.displayName}</Typography>
                  
                  {editingBudget === budget.budgetId ? (
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateBudget(budget.budgetId, parseFloat(editAmount));
                        }
                      }}
                      className="w-24 px-2 py-1 border rounded"
                      autoFocus
                    />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>${budget.budgetedAmount}</Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setEditingBudget(budget.budgetId);
                          setEditAmount(budget.budgetedAmount.toString());
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                  
                  <Typography sx={{ mx: 4 }}>${spent}</Typography>
                  <Typography 
                    sx={{ 
                      color: isOverBudget ? 'error.main' : 'success.main',
                      width: 100,
                      textAlign: 'right'
                    }}
                  >
                    ${Math.abs(remaining)} {isOverBudget ? 'over' : 'left'}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ))}
      </main>

      <AddBudgetModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBudget}
      />
    </div>
  );
};

export default BudgetPage;
