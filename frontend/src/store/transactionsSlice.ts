import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Transaction {
    transCategory: string[];
    transDate: string;
    transAmount: number;
    transactionId: string;
    userId: string;
}

interface TransactionsState {
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;
}

const initialState: TransactionsState = {
    transactions: [],
    isLoading: false,
    error: null
};

const transactionsSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        setTransactions: (state, action: PayloadAction<Transaction[]>) => {
            state.transactions = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
        }
    }
});

export const { setTransactions, setLoading, setError } = transactionsSlice.actions;
export default transactionsSlice.reducer; 