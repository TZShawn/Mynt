import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Account {
  account_id: string;
  account_name: string;
  account_subtype: string;
  account_type: string;
  mask: string;
  balance: number;
}

interface AccessToken {
  access_token: string;
  bank_name: string;
  cursor: string;
  accounts: Account[];
  last_synced: string;
}

interface NetworthData {
  date: string;
  networth: number;
  accounts: Account[];
}

interface AccountsState {
  accessTokens: AccessToken[];
  isLoading: boolean;
  error: string | null;
  networthHistory: NetworthData[];
  dateRange: '30' | '60' | '90' | 'custom';
  customStartDate: string | null;
  customEndDate: string | null;
}

const initialState: AccountsState = {
  accessTokens: [],
  isLoading: false,
  error: null,
  networthHistory: [],
  dateRange: '30',
  customStartDate: null,
  customEndDate: null,
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
    setNetworthHistory: (state, action: PayloadAction<NetworthData[]>) => {
      state.networthHistory = action.payload;
    },
    updateCurrentDayNetworth: (state, action: PayloadAction<NetworthData>) => {
      const today = new Date().toISOString().split('T')[0];
      const index = state.networthHistory.findIndex(data => data.date.split('T')[0] === today);
      
      if (index !== -1) {
        state.networthHistory[index] = action.payload;
      } else {
        state.networthHistory.push(action.payload);
      }
    },
    setDateRange: (state, action: PayloadAction<AccountsState['dateRange']>) => {
      state.dateRange = action.payload;
      // Reset custom dates when switching to preset ranges
      if (action.payload !== 'custom') {
        state.customStartDate = null;
        state.customEndDate = null;
      }
    },
    setCustomDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.customStartDate = action.payload.startDate;
      state.customEndDate = action.payload.endDate;
      state.dateRange = 'custom';
    },
  },
});

export const { 
  setAccessTokens, 
  setLoading, 
  setError, 
  setNetworthHistory,
  updateCurrentDayNetworth,
  setDateRange,
  setCustomDateRange
} = accountsSlice.actions;

export default accountsSlice.reducer; 