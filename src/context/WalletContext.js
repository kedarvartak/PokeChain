// src/context/WalletContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { walletService } from '../services/Wallet';
import { pokemonService } from '../services/PokeService';
const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);

  // Check initial wallet connection
  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    try {
      const isConnected = await walletService.getWalletStatus();
      if (isConnected) {
        const { address } = await walletService.connect();
        const chainId = await walletService.getChainId();
        setIsConnected(true);
        setAddress(address);
        setChainId(Number(chainId));
      }
    } catch (error) {
      console.error('Connection check failed:', error);
    }
  };

  const connectWallet = async () => {
    try {
      await pokemonService.ensureLineaSepoliaNetwork();
      setError(null);
      const { address } = await walletService.connect();
      const chainId = await walletService.getChainId();
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
      setIsConnected(true);
      setAddress(address);
      setChainId(Number(chainId));
    } } catch (error) {
      setError(error.message);
      console.error('Connection failed:', error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAddress(null);
    } else {
      setAddress(accounts[0]);
      setIsConnected(true);
    }
  };

  const handleChainChanged = (chainId) => {
    setChainId(parseInt(chainId, 16));
    window.location.reload();
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        chainId,
        error,
        connectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);