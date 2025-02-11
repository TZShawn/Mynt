import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlaidState {
  linkToken: string | null;
  error: string | null;
}

const initialState: PlaidState = {
  linkToken: null,
  error: null,
};

const plaidSlice = createSlice({
  name: 'plaid',
  initialState,
  reducers: {
    setLinkToken: (state, action: PayloadAction<string>) => {
      state.linkToken = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearLinkToken: (state) => {
      state.linkToken = null;
    },
  },
});

export const { setLinkToken, setError, clearLinkToken } = plaidSlice.actions;
export default plaidSlice.reducer; 