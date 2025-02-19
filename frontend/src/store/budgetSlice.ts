import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Budget } from '../types/budget';

interface BudgetState {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  loading: false,
  error: null,
};

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.budgets = action.payload;
    },
    addBudget: (state, action: PayloadAction<Budget>) => {
      state.budgets.push(action.payload);
    },
    updateBudget: (state, action: PayloadAction<{ budgetId: string; budgetedAmount: number }>) => {
      const budget = state.budgets.find(b => b.budgetId === action.payload.budgetId);
      if (budget) {
        budget.budgetedAmount = action.payload.budgetedAmount;
      }
    },
  },
});

export const { setBudgets, addBudget, updateBudget } = budgetSlice.actions;
export default budgetSlice.reducer; 