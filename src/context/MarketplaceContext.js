import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';
import { marketplaceService } from '../services/MarketplaceService';

const MarketplaceContext = createContext();

export const MarketplaceProvider = ({ children }) => {
  const { address, isConnected } = useWallet();
  const [items, setItems] = useState([]);
  const [userItems, setUserItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isConnected && address) {
      loadItems();
      loadUserItems();
    }
  }, [isConnected, address]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const marketplaceItems = await marketplaceService.getItems();
      setItems(marketplaceItems);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserItems = async () => {
    try {
      const items = await marketplaceService.getUserItems(address);
      setUserItems(items);
    } catch (error) {
      console.error('Error loading user items:', error);
    }
  };

  const purchaseItem = async (itemId, amount) => {
    try {
      setLoading(true);
      await marketplaceService.purchaseItem(itemId, amount);
      await loadItems(); // Refresh items
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketplaceContext.Provider
      value={{
        items,
        userItems,
        loading,
        error,
        purchaseItem
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => useContext(MarketplaceContext); 