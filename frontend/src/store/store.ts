import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './transactionsSlice';
import accountsReducer from './accountsSlice';
import plaidReducer from './plaidSlice';
import authReducer from './authSlice';
import budgetReducer from './budgetSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionsReducer,
    accounts: accountsReducer,
    plaid: plaidReducer,
    budgets: budgetReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 