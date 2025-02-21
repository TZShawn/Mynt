import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Typography, Box, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddBudgetModal from "../Components/AddBudgetModal";
import { RootState } from "../store/store";
import { getCategory } from "../utils/getCategory";
import { subcategories } from "../utils/listCategories";
import { setBudgets } from "../store/budgetSlice";
import { setTransactions } from "../store/transactionsSlice";
import { fetchAuthSession } from "aws-amplify/auth";
import { mapCategoryToDisplay } from "../utils/mapCategoryToDisplay";

const BudgetPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const dispatch = useDispatch();

  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const budgets = useSelector((state: RootState) => state.budgets.budgets);

  useEffect(() => {
    const getToken = async () => {
      const session = await fetchAuthSession();
      const tk = session.tokens?.idToken?.toString();
      setToken(tk || null);
    };
    getToken();
  }, []);

  const fetchBudgets = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/budgets/getBudget`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error('Failed to fetch budgets');
      const data = await response.json();
      dispatch(setBudgets(data));
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/transactions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      if (data.success) {
        dispatch(setTransactions(data.response));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBudgets();
      if (transactions.length === 0) {
        fetchTransactions();
      }
    }
  }, [token]); // Only re-run when token changes

  // Log budgets whenever they change
  useEffect(() => {
  }, [budgets]);

  // Group transactions by category and sum amounts
  const spentByCategory = useMemo(() => {
    return transactions.reduce((acc: Record<string, number>, trans) => {
      const category = trans.transCategory;
      if (trans.transAmount > 0) {
        acc[category] = Math.floor(((acc[category] || 0) + trans.transAmount) * 100) / 100;
      }
      return acc;
    }, {});
  }, [transactions]);


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
    if (!token) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/budgets/addBudget`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budget),
      });
      if (!response.ok) throw new Error('Failed to create budget');
      const data = await response.json();
      if (response.ok) {
        // Refetch all budgets to ensure we have the latest state
        await fetchBudgets();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating budget:', error);
    }
  };

  const handleUpdateBudget = async (budgetId: string, newAmount: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/budget/updatebudget`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ budgetId, budgetedAmount: newAmount }),
      });
      if (!response.ok) throw new Error('Failed to update budget');
      const data = await response.json();
      if (data.success) {
        // Refetch all budgets to ensure we have the latest state
        await fetchBudgets();
        setEditingBudget(null);
      }
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
      {budgets.length === 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-xl font-semibold mb-4">No budgets found</h2>
        </div>
      )}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {Object.entries(groupedBudgets).map(([group, budgets]) => (
          <div key={group} className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{group}</h2>
            <div className="space-y-4">
              {budgets.map((budget) => {
                const spent = spentByCategory[budget.category] || 0;
                const remaining = budget.budgetedAmount - spent;
                const isOverBudget = remaining < 0;
                const progress = Math.min((spent / budget.budgetedAmount), 1);
                return (
                  <div 
                    key={budget.budgetId}
                    className="bg-white rounded-lg p-4 shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-medium">{mapCategoryToDisplay[budget.category as keyof typeof mapCategoryToDisplay] ?? budget.category}</span>
                      <div className="flex items-center space-x-2">
                        {editingBudget === budget.budgetId ? (
                          <>
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-24 px-2 py-1 border rounded"
                              autoFocus
                          />
                          <div className="flex items-center space-x-2">
                            <button onClick={() => handleUpdateBudget(budget.budgetId, parseFloat(editAmount))}>Save</button>
                            <button onClick={() => setEditingBudget(null)}>Cancel</button>
                          </div>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-600">${budget.budgetedAmount}</span>
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                setEditingBudget(budget.budgetId);
                                setEditAmount(budget.budgetedAmount.toString());
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </div>
                    </div>
                      <progress 
                        className={`w-full bg-gray-100 rounded-full h-2.5 ${isOverBudget ? 'bg-red-500' : 'bg-mynt-green-500'}`}
                        value={progress}
                      />
                    <div className="flex justify-between mt-2 text-sm">
                      <span>Spent: ${spent}</span>
                      <span className={isOverBudget ? 'text-red-500' : 'text-mynt-green-500'}>
                        ${Math.abs(remaining)} {isOverBudget ? 'over' : 'left'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
