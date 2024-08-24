// pages/index.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { connectWallet } from '@/redux/walletSlice';

const Home: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { account, status } = useSelector((state: RootState) => state.wallet);

  const handleConnectWallet = () => {
    dispatch(connectWallet());
  };

  useEffect(() => {
    if (status === 'idle') {
      dispatch(connectWallet());
    }
  }, [dispatch, status]);

  return (
    <div style={{ textAlign: 'center', marginTop: '20vh' }}>
      <h1>Welcome to the Coin Flipper!</h1>
      {account ? (
        <p>Connected Wallet: {account}</p>
      ) : (
        <>
          <p>Please Connect Your Wallet:</p>
          <button onClick={handleConnectWallet} style={{ padding: '10px 20px', fontSize: '16px' }}>
            {status === 'loading' ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </>
      )}
    </div>
  );
};

export default Home;
