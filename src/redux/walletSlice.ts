// store/walletSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletState {
  account: string | null;
  provider: Web3Provider | null;
  network: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: WalletState = {
  account: null,
  provider: null,
  network: null,
  status: 'idle',
  error: null,
};

export const connectWallet = createAsyncThunk<
  { account: string; provider: Web3Provider }, // Return type
  void, // Argument type (void because no arguments are passed)
  { rejectValue: string } // Rejection value type
>('wallet/connectWallet', async (_, { rejectWithValue }) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    // Request MetaMask to re-request permissions
    await window.ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{
        eth_accounts: {}
      }],
    });

    // Request MetaMask to prompt account selection
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const provider = new Web3Provider(window.ethereum);
    const account = accounts[0]; // This will be the account the user selects

    return { account, provider };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return rejectWithValue(error.message);
  }
});

// New action to disconnect the wallet
export const disconnectWallet = createAsyncThunk<void, void, { rejectValue: string }>(
  'wallet/disconnectWallet',
  async (_, { rejectWithValue }) => {
    try {
      // Optional: If you need to perform any cleanup or reset operations
      return;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    // Reset the state to initial state on disconnect
    resetWalletState: (state) => {
      state.account = null;
      state.provider = null;
      state.network = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(connectWallet.fulfilled, (state, action: PayloadAction<{ account: string; provider: Web3Provider }>) => {
        state.status = 'succeeded';
        state.account = action.payload.account;
        state.provider = action.payload.provider;
      })
      .addCase(connectWallet.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.status = 'failed';
        state.error = action.payload ?? null;
      })
      .addCase(disconnectWallet.fulfilled, (state) => {
        // Reset wallet state when disconnect action is fulfilled
        walletSlice.caseReducers.resetWalletState(state);
      });
  },
});

export const { resetWalletState } = walletSlice.actions;
export default walletSlice.reducer;
