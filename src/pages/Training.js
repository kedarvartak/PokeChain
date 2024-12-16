import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import { usePokemon } from '../context/PokemonContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { pokemonService as PokeService } from '../services/PokeService';
import { StarIcon } from '@heroicons/react/24/solid';

const TRAINING_GROUNDS = {
  1: { 
    name: "Basic Training",
    description: "A simple training ground suitable for all Pokemon types.",
    color: "bg-[#4ECDC4]",
    minLevel: 1
  },
  2: {
    name: "Fire Dojo",
    description: "Intense training ground. Fire-type Pokemon gain bonus XP.",
    color: "bg-[#FF6B6B]",
    minLevel: 5
  },
  3: {
    name: "Water Temple",
    description: "Specialized training ground. Water-type Pokemon gain bonus XP.",
    color: "bg-[#4ECDC4]",
    minLevel: 5
  },
  4: {
    name: "Grass Garden",
    description: "Nature-focused training ground. Grass-type Pokemon gain bonus XP.",
    color: "bg-[#95D44A]",
    minLevel: 5
  }
};

const Training = () => {
  const { isConnected } = useWallet();
  const { userPokemon, loading } = usePokemon();
  const [selectedGround, setSelectedGround] = useState(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state?.preSelectedPokemon) {
      setSelectedPokemon(location.state.preSelectedPokemon);
    }
  }, [location]);

  const handleStartTraining = async () => {
    if (!selectedGround || !selectedPokemon) return;
    
    setIsLoading(true);
    try {
      await PokeService.startTraining(selectedPokemon.id, selectedGround);
      toast.success('Pokemon training started!');
      navigate('/profile');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeBonus = (groundId, pokemonType) => {
    const ground = TRAINING_GROUNDS[groundId];
    if (!ground.requiredType || !pokemonType) return false;
    return ground.requiredType.toLowerCase() === pokemonType.toLowerCase();
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

  return (
    <div className="py-20 max-w-7xl mx-auto pt-36 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black inline-block bg-[#FFD93D] border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          TRAINING GROUNDS
        </h2>
      </div>

      {/* Pokemon Selection */}
      <div className="mb-12">
        <h3 className="text-2xl font-black mb-6">Select Pokemon</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {userPokemon.map((pokemon) => (
            <motion.div
              key={pokemon.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedPokemon(pokemon)}
              className={`bg-white border-4 border-black p-6 cursor-pointer ${
                selectedPokemon?.id === pokemon.id ? 'ring-4 ring-blue-500' : ''
              } shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}
            >
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                alt={pokemon.name}
                className="w-32 h-32 mx-auto mb-4"
              />
              <h3 className="text-xl font-black text-center mb-2">{pokemon.name}</h3>
              <p className="text-center font-bold">Level: {pokemon.level}</p>
              <p className="text-center font-bold">Type: {pokemon.type}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Training Grounds */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-2xl font-black mb-6">Select Training Ground</h3>
          <div className="space-y-4">
            {Object.entries(TRAINING_GROUNDS).map(([id, ground]) => {
              const hasTypeBonus = selectedPokemon && 
                getTypeBonus(id, userPokemon.find(p => p.id === selectedPokemon)?.type);

              return (
                <motion.div
                  key={id}
                  whileHover={{ scale: 1.02 }}
                  className={`${ground.color} border-4 border-black p-6 cursor-pointer ${
                    selectedGround === id ? 'shadow-none translate-x-[3px] translate-y-[3px]' : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                  onClick={() => setSelectedGround(id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-black mb-2">{ground.name}</h4>
                      <p className="font-bold">{ground.description}</p>
                      <p className="font-bold mt-2">Minimum Level: {ground.minLevel}</p>
                    </div>
                    {hasTypeBonus && (
                      <div className="bg-[#FFD93D] border-2 border-black p-2">
                        <StarIcon className="w-6 h-6" />
                        <span className="text-sm font-black">1.5x XP</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Start Training Button */}
        <div className="mt-8 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartTraining}
            disabled={!selectedGround || !selectedPokemon || isLoading}
            className="px-8 py-4 bg-[#FFD93D] font-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'STARTING TRAINING...' : 'START TRAINING'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Training; 