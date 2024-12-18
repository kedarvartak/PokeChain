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

// Add these motion variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
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
    <motion.div 
      className="py-20 max-w-7xl mx-auto pt-36 px-4 min-h-screen bg-[#F6F6F6]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="text-center mb-16"
        variants={itemVariants}
      >
        <h2 className="text-5xl font-black inline-block bg-[#FFD93D] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg] hover:rotate-[0deg] transition-transform">
          TRAINING GROUNDS
        </h2>
      </motion.div>

      {/* Pokemon Selection */}
      <motion.div className="mb-16" variants={itemVariants}>
        <h3 className="text-3xl font-black mb-8 bg-white inline-block border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          Select Pokemon
        </h3>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {userPokemon.map((pokemon) => (
            <motion.div
              key={pokemon.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, rotate: 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPokemon(pokemon)}
              className={`bg-white border-4 border-black p-8 cursor-pointer transform transition-all
                ${selectedPokemon?.id === pokemon.id 
                  ? 'ring-4 ring-[#FFD93D] shadow-none translate-x-[4px] translate-y-[4px]' 
                  : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                }`}
            >
              <motion.img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                alt={pokemon.name}
                className="w-40 h-40 mx-auto mb-6 drop-shadow-lg"
                whileHover={{ y: -5 }}
              />
              <h3 className="text-2xl font-black text-center mb-3">{pokemon.name}</h3>
              <div className="flex justify-center gap-4">
                <span className="bg-[#4ECDC4] text-black font-bold px-4 py-2 border-2 border-black">
                  Level: {pokemon.level}
                </span>
                <span className="bg-[#FF6B6B] text-black font-bold px-4 py-2 border-2 border-black">
                  {pokemon.type}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Training Grounds */}
      <div className="grid md:grid-cols-2 gap-12">
        <motion.div variants={itemVariants}>
          <h3 className="text-3xl font-black mb-8 bg-white inline-block border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            Select Training Ground
          </h3>
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
          >
            {Object.entries(TRAINING_GROUNDS).map(([id, ground]) => {
              const hasTypeBonus = selectedPokemon && 
                getTypeBonus(id, userPokemon.find(p => p.id === selectedPokemon)?.type);

              return (
                <motion.div
                  key={id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, rotate: 0.5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${ground.color} border-4 border-black p-8 cursor-pointer transform transition-all
                    ${selectedGround === id 
                      ? 'shadow-none translate-x-[4px] translate-y-[4px]' 
                      : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  onClick={() => setSelectedGround(id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-2xl font-black mb-3">{ground.name}</h4>
                      <p className="font-bold text-lg mb-2">{ground.description}</p>
                      <span className="inline-block bg-white font-bold px-4 py-2 border-2 border-black">
                        Min Level: {ground.minLevel}
                      </span>
                    </div>
                    {hasTypeBonus && (
                      <div className="bg-[#FFD93D] border-2 border-black p-3 rotate-12">
                        <StarIcon className="w-8 h-8" />
                        <span className="text-sm font-black block">1.5x XP</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Start Training Button */}
        <motion.div 
          className="mt-8 text-center self-center"
          variants={itemVariants}
        >
          <motion.button
            whileHover={{ scale: 1.05, rotate: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartTraining}
            disabled={!selectedGround || !selectedPokemon || isLoading}
            className="px-12 py-6 bg-[#FFD93D] text-2xl font-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
          >
            {isLoading ? 'STARTING TRAINING...' : 'START TRAINING'}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Training; 