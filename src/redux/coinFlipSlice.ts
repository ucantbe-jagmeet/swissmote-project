// store/coinFlipSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CoinFlipState {
  result: 'heads' | 'tails' | null;
  userBet: 'heads' | 'tails' | null;
  wagerAmount: number;
  outcome: 'win' | 'lose' | null;
}

const initialState: CoinFlipState = {
  result: null,
  userBet: null,
  wagerAmount: 0,
  outcome: null,
};

const flipCoin = (): 'heads' | 'tails' => {
  return Math.random() < 0.5 ? 'heads' : 'tails';
};

const coinFlipSlice = createSlice({
  name: 'coinFlip',
  initialState,
  reducers: {
    setBet: (state, action: PayloadAction<{ userBet: 'heads' | 'tails'; wagerAmount: number }>) => {
      state.userBet = action.payload.userBet;
      state.wagerAmount = action.payload.wagerAmount;
    },
    flip: (state) => {
      const result = flipCoin();
      state.result = result;
      state.outcome = state.userBet === result ? 'win' : 'lose';
    },
    reset: (state) => {
      state.result = null;
      state.userBet = null;
      state.wagerAmount = 0;
      state.outcome = null;
    },
  },
});

export const { setBet, flip, reset } = coinFlipSlice.actions;
export default coinFlipSlice.reducer;
