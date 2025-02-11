import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './transactionsSlice';
import accountsReducer from './accountsSlice';
import plaidReducer from './plaidSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionsReducer,
    accounts: accountsReducer,
    plaid: plaidReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 