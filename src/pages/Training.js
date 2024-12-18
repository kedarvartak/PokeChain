import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import { usePokemon } from '../context/PokemonContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { pokemonService as PokeService } from '../services/PokeService';
import { StarIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/LoadingSpinner';

const TRAINING_GROUNDS = {
  1: { 
    name: "Basic Training",
    description: "A simple training ground suitable for all Pokemon types.",
    color: "bg-[#4ECDC4]",
    minLevel: 1,
    image: "https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images/010.png",
    requiredType: null,
    bgPattern: "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23000000' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E"
  },
  2: {
    name: "Fire Dojo",
    description: "Intense training ground. Fire-type Pokemon gain bonus XP.",
    color: "bg-[#FF6B6B]",
    minLevel: 5,
    image: "https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images/006.png",
    requiredType: "fire",
    bgPattern: "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23FF0000' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E"
  },
  3: {
    name: "Water Temple",
    description: "Specialized training ground. Water-type Pokemon gain bonus XP.",
    color: "bg-[#4ECDC4]",
    minLevel: 5,
    image: "https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images/009.png",
    requiredType: "water",
    bgPattern: "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%230000FF' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E"
  },
  4: {
    name: "Grass Garden",
    description: "Nature-focused training ground. Grass-type Pokemon gain bonus XP.",
    color: "bg-[#95D44A]",
    minLevel: 5,
    image: "https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images/003.png",
    requiredType: "grass",
    bgPattern: "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%2300FF00' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E"
  }
};

const Training = () => {
  const { isConnected } = useWallet();
  const { userPokemon, loading } = usePokemon();
  const [selectedGround, setSelectedGround] = useState(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (location.state?.preSelectedPokemon) {
      setSelectedPokemon(location.state.preSelectedPokemon);
    }
  }, [location]);

  const handleStartTraining = async (pokemonId, groundId) => {
    setIsProcessing(true);
    try {
      await PokeService.startTraining(pokemonId, groundId);
      toast.success('Training started successfully!');
      navigate('/profile');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeBonus = (groundId, pokemonType) => {
    const ground = TRAINING_GROUNDS[groundId];
    if (!ground.requiredType || !pokemonType) return false;
    return ground.requiredType.toLowerCase() === pokemonType.toLowerCase();
  };

  if (!isConnected) return <Navigate to="/" />;
  if (loading) return <LoadingSpinner text="LOADING TRAINING GROUNDS" />;

  return (
    <div className="min-h-screen pt-36 ">
      {/* Hero Section */}
      <div className="relative h-[40vh] overflow-hidden border-b-4 border-black">
        <div className="absolute inset-0">
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center z-10"
          >
            <h1 className="text-6xl font-black bg-white border-4 border-black p-8 
                         shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              TRAINING GROUNDS
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Pokemon Selection Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border-4 border-black p-6 
                         shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black mb-6 pb-4 border-b-4 border-black">
                YOUR POKEMON
              </h2>
              <div className="space-y-4">
                {userPokemon.map((pokemon) => (
                  <motion.div
                    key={pokemon.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPokemon(pokemon)}
                    className={`relative overflow-hidden cursor-pointer
                              border-4 border-black p-4 transition-all duration-200
                              ${selectedPokemon?.id === pokemon.id 
                                ? 'bg-[#FFD93D]' 
                                : 'bg-white hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={`https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images/${String(pokemon.id).padStart(3, '0')}.png`}
                        alt={pokemon.name}
                        className="w-20 h-20 object-contain"
                      />
                      <div>
                        <h3 className="font-black text-lg">{pokemon.name}</h3>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 text-sm bg-[#4ECDC4] border-2 border-black font-bold">
                            Lvl {pokemon.level}
                          </span>
                          <span className="px-2 py-1 text-sm bg-[#FF6B6B] border-2 border-black font-bold">
                            {pokemon.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Training Grounds Grid */}
          <div className="lg:col-span-8">
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(TRAINING_GROUNDS).map(([id, ground]) => {
                const hasTypeBonus = selectedPokemon && 
                  getTypeBonus(id, userPokemon.find(p => p.id === selectedPokemon)?.type);

                return (
                  <motion.div
                    key={id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGround(id)}
                    className={`relative overflow-hidden cursor-pointer
                              border-4 border-black transition-all duration-200
                              ${selectedGround === id 
                                ? `${ground.color} shadow-none translate-x-[4px] translate-y-[4px]` 
                                : 'bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'}`}
                    
                  >
                    <div className="p-6">
                      <div className="flex gap-6">
                        <img 
                          src={ground.image}
                          alt={ground.name}
                          className="w-32 h-32 object-contain"
                        />
                        <div>
                          <h3 className="text-2xl font-black mb-2">{ground.name}</h3>
                          <p className="font-bold mb-2">{ground.description}</p>
                          <p className="font-bold">Min Level: {ground.minLevel}</p>
                          {hasTypeBonus && (
                            <div className="mt-3 inline-flex items-center gap-2 
                                        bg-[#FFD93D] border-2 border-black p-2">
                              <StarIcon className="w-6 h-6" />
                              <span className="font-black">1.5x XP BONUS!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Training Action Panel */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8 bg-white border-4 border-black p-6 
                       shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black mb-2">Ready to Train?</h3>
                  <p className="font-bold text-gray-600">
                    {!selectedPokemon 
                      ? "Select a Pokemon to begin" 
                      : !selectedGround 
                        ? "Choose a training ground" 
                        : "All set! Start training"}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStartTraining(selectedPokemon?.id, selectedGround)}
                  disabled={!selectedGround || !selectedPokemon || isProcessing}
                  className="px-8 py-4 bg-[#FFD93D] font-black text-xl border-4 border-black 
                           shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]
                           transition-all duration-200"
                >
                  {isProcessing ? 'STARTING TRAINING...' : 'START TRAINING!'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 
                     flex items-center justify-center">
          <LoadingSpinner text="STARTING TRAINING" />
        </div>
      )}
    </div>
  );
};

export default Training; 