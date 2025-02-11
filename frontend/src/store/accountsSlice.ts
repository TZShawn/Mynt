import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Account {
  account_id: string;
  account_name: string;
  account_subtype: string;
}

interface AccessToken {
  access_token: string;
  bank_name: string;
  cursor: string;
  accounts: Account[];
  last_synced: string;
}

interface AccountsState {
  accessTokens: AccessToken[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  accessTokens: [],
  isLoading: false,
  error: null,
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setAccessTokens: (state, action: PayloadAction<AccessToken[]>) => {
      state.accessTokens = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setAccessTokens, setLoading, setError } = accountsSlice.actions;
export default accountsSlice.reducer; 