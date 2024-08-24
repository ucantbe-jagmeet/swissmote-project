'use client'
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { connectWallet, disconnectWallet, resetWalletState } from '@/redux/walletSlice';
import { setBet, flip, reset } from '@/redux/coinFlipSlice';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { formatEther, parseEther } from '@ethersproject/units';

const SEPOLIA_CHAIN_ID = 11155111;

const Home: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { account, status } = useSelector((state: RootState) => state.wallet);
  const { result, userBet, wagerAmount, outcome } = useSelector((state: RootState) => state.coinFlip);
  const [balance, setBalance] = useState<number>(0);
  const [networkName, setNetworkName] = useState<string | null>(null);

  const handleConnectWallet = () => {
    dispatch(connectWallet());
  };

  const handleDisconnectWallet = () => {
    dispatch(disconnectWallet());
    dispatch(resetWalletState()); // Optionally reset the wallet state in the store
  };

  const checkNetworkAndFetchData = async () => {
    if (account) {
      const provider = new Web3Provider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId === SEPOLIA_CHAIN_ID) {
        setNetworkName("Sepolia Testnet");

        // Fetch the balance if the user is on Sepolia Testnet
        const balanceBigNumber = await provider.getBalance(account);
        const balanceInEth = formatEther(balanceBigNumber);
        setBalance(parseFloat(balanceInEth));
      } else {
        setNetworkName(network.name);
        alert("You are not connected to Sepolia Testnet. Please switch to Sepolia Testnet.");
      }
    }
  };

  const handlePlaceBet = (bet: 'heads' | 'tails', amount: number) => {
    if (balance >= amount) {
      dispatch(setBet({ userBet: bet, wagerAmount: amount }));
      dispatch(flip());
      setBalance(balance - amount); // Deduct the bet amount from the balance
    } else {
      alert("Insufficient balance. Please get more coins.");
    }
  };

  const handleReset = () => {
    dispatch(reset());
    // Reset local states to allow replay
    dispatch(setBet({ userBet: null, wagerAmount: 0 }));
  };

  const handleGetFreeCoins = async () => {
    // Simulate a transaction to get free coins (this should ideally be a call to a smart contract)
    try {
      const provider = new Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      if (account) {
        const tx = {
          to: account, // Ensure account is not null
          value: parseEther('1.0'),
        };

        await signer.sendTransaction(tx);
        await checkNetworkAndFetchData(); // Update balance after transaction
      } else {
        console.error("Account is null, cannot send transaction.");
      }
    } catch (error) {
      console.error("Failed to get free coins:", error);
    }
  };

  useEffect(() => {
    if (status === 'idle') {
      dispatch(connectWallet());
    }
  }, [dispatch, status]);

  useEffect(() => {
    checkNetworkAndFetchData();
  }, [account]);

  return (
    <div className='bg-[#0c0935] text-white w-screen h-screen flex items-center flex-col'>
      <h1 className='font-sans uppercase text-6xl mt-20'>Coin Flipper</h1>
      {account ? (
        <>
          <p className='my-5'>Connected Wallet: {account}</p>
          <p className='my-5'>Network: {networkName}</p>
          <p className='my-5'>Balance: {balance} ETH</p>
          <div>
            {!result ? (
              <>
                <button
                  onClick={() => handlePlaceBet('heads', 0.0001)} // Example: 0.0001 ETH per bet
                  className='border-2 py-2 px-4 rounded mx-2 my-5'
                  disabled={balance < 0.0001}
                >
                  Bet 0.0001 ETH on Heads
                </button>
                <button
                  onClick={() => handlePlaceBet('tails', 0.0001)} // Example: 0.0001 ETH per bet
                  className='border-2 py-2 px-4 rounded mx-2 my-5'
                  disabled={balance < 0.0001}
                >
                  Bet 0.0001 ETH on Tails
                </button>
              </>
            ) : (
              <div className='mt-5 flex justify-center items-center flex-col'>
                <p>The coin landed on: {result} <span className='ml-5 font-extrabold text-xl'>You {outcome === 'win' ? 'won' : 'lost'}!</span>

                </p>
                <button
                  onClick={handleReset}
                  className='border-2 py-2 px-4 rounded my-5'
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
          <div className='my-5'>
            <button
              onClick={handleGetFreeCoins}
              className='bg-green-500 py-2 px-4 rounded mx-2'
            >
              Get Free Coins
            </button>
            <button
              onClick={handleReset}
              className='bg-black py-2 px-4 rounded mx-2'
            >
              Reset
            </button>
            <button
              onClick={handleDisconnectWallet}
              className='bg-red-500 py-2 px-4 rounded mx-2'
            >
              Disconnect Wallet
            </button>
          </div>
        </>
      ) : (
        <>
          <p className='my-10'>Please Connect Your Wallet:</p>
          <button onClick={handleConnectWallet} className='border-2 py-2 px-4 rounded my-10'>
            {status === 'loading' ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </>
      )}
    </div>
  );
};

export default Home;
