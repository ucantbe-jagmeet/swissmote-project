import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './walletSlice';
import coinFlipReducer from './coinFlipSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    coinFlip: coinFlipReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
