import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import { usePokemon, starterPokemon } from '../context/PokemonContext';
import { useMarketplace } from '../context/MarketplaceContext';

import PokemonCard from '../components/PokemonCard';
import TrainingProgress from '../components/TrainingProgress';
import { useTraining } from '../context/TrainingContext';
import { toast } from 'react-hot-toast';
import { pokemonService } from '../services/PokeService';

const ITEM_IMAGES = {
  1: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
  2: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
  3: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
  4: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png'
};

const Profile = () => {
  const { isConnected } = useWallet();
  const { isNewUser, loading, userPokemon, refreshPokemon } = usePokemon();
  const { userItems } = useMarketplace();
  const { trainingPokemon } = useTraining();

  const handleSelectStarter = async (pokemonId) => {
    try {
      await pokemonService.mintStarterPokemon(pokemonId);
      await refreshPokemon(); // Refresh Pokemon list after minting
      toast.success('Starter Pokemon claimed successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!isConnected) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <h2 className="text-4xl font-black mb-4 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          LOADING...
        </h2>
      </div>
    );
  }

  if (isNewUser) {
    return (
      <div className="py-20 max-w-7xl mx-auto pt-36 px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black inline-block bg-[#FFD93D] border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            CHOOSE YOUR STARTER POKEMON
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {starterPokemon.map((pokemon) => (
            <motion.div
              key={pokemon.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              onClick={() => handleSelectStarter(pokemon.id)}
            >
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className="w-32 h-32 mx-auto mb-4"
              />
              <h3 className="text-2xl font-black text-center mb-2">{pokemon.name}</h3>
              <p className="text-center font-bold">Type: {pokemon.type}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (!userPokemon || userPokemon.length === 0) {
    return (
      <div className="text-center py-20 pt-36">
        <h2 className="text-4xl font-black mb-4 bg-[#FF6B6B] inline-block border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          NO POKEMON FOUND
        </h2>
        <p className="text-xl font-bold mt-4">Something went wrong loading your Pokemon team.</p>
      </div>
    );
  }

  return (
    <div className="py-20 max-w-7xl mx-auto pt-36 px-4">
      {/* Team Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black inline-block bg-[#FFD93D] border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          YOUR POKEMON TEAM
        </h2>
      </div>

       {/* Team Stats */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: "TOTAL POKEMON", value: userPokemon.length },
          { label: "HIGHEST LEVEL", value: Math.max(...userPokemon.map(p => p.level)) },
          { label: "TOTAL XP", value: userPokemon.reduce((sum, p) => sum + p.xp, 0) },
          { label: "BATTLES WON", value: "0" }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            className="bg-white border-4 border-black p-4 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <h4 className="font-black text-lg mb-2">{stat.label}</h4>
            <p className="text-3xl font-black text-[#FF6B6B]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Training Progress */}
      {Object.keys(trainingPokemon).length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-black mb-6">
            <span className="bg-[#4ECDC4] border-4 border-black p-4 inline-block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              ACTIVE TRAINING
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(trainingPokemon).map(([pokemonId, data]) => (
              <TrainingProgress
                key={pokemonId}
                pokemon={userPokemon.find(p => p.id === Number(pokemonId))}
                groundId={data.groundId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pokemon Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {userPokemon.map((pokemon, idx) => (
          <PokemonCard key={idx} pokemon={pokemon} />
        ))}
      </div>

      {/* Items Inventory Section */}
      <div className="mt-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black inline-block bg-[#4ECDC4] border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            YOUR ITEMS
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {userItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <img
                src={ITEM_IMAGES[item.id]}
                alt={item.name}
                className="w-24 h-24 mx-auto mb-4 object-contain"
              />
              <h3 className="text-xl font-black text-center mb-2">{item.name}</h3>
              <p className="text-center font-bold">Amount: {item.amount}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile; 