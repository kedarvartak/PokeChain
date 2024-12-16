import React from 'react';
import { motion } from 'framer-motion';
import { useMarketplace } from '../context/MarketplaceContext';
import { useWallet } from '../context/WalletContext';

const ITEM_IMAGES = {
  1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
  2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
  3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
  4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png'
};

const Marketplace = () => {
  const { items, loading, error, purchaseItem } = useMarketplace();
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 mt-36 py-12 text-center">
        <h2 className="text-2xl font-black mb-4">Please connect your wallet to access the marketplace</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 mt-36 py-12 text-center">
        <h2 className="text-2xl font-black mb-4">Loading marketplace items...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 mt-36 py-12 text-center">
        <h2 className="text-2xl font-black mb-4 text-red-500">Error: {error}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 mt-36 py-12">
      <h2 className="text-4xl font-black text-center mb-12">
        <span className="bg-[#4ECDC4] border-4 border-black p-4 inline-block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          POKEMON ITEMS SHOP
        </span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.05 }}
            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <img
              src={ITEM_IMAGES[item.id]}
              alt={item.name}
              className="w-32 h-32 mx-auto mb-4 object-contain"
            />
            <h3 className="text-xl font-black text-center mb-2">{item.name}</h3>
            <p className="text-center font-bold mb-2">Type: {item.type}</p>
            <p className="text-center font-bold mb-4">{item.price} ETH</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => purchaseItem(item.id, 1)}
              disabled={!item.isAvailable || loading}
              className="w-full px-4 py-2 bg-[#4ECDC4] text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] disabled:opacity-50"
            >
              {loading ? 'PURCHASING...' : 'BUY NOW'}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace; 