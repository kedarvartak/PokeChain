import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTraining } from '../context/TrainingContext';
import { useState, useEffect } from 'react';

const PokemonCard = ({ pokemon }) => {
  const { trainingPokemon, completeTraining } = useTraining();
  const navigate = useNavigate();
  
  const isTraining = trainingPokemon[pokemon.id]?.isTraining;
  const trainingStartTime = trainingPokemon[pokemon.id]?.startTime;
  
  const [prevXP, setPrevXP] = useState(pokemon.xp);

  useEffect(() => {
    if (pokemon.xp !== prevXP) {
      setPrevXP(pokemon.xp);
    }
  }, [pokemon.xp]);
  
  const handleTrainClick = () => {
    if (isTraining) {
      completeTraining(pokemon.id, 1); // Using BASIC_TRAINING as default
    } else {
      navigate('/training', { state: { preSelectedPokemon: pokemon.id } });
    }
  };

  const getTrainingTime = () => {
    if (!isTraining || !trainingStartTime) return null;
    const now = Math.floor(Date.now() / 1000);
    const timeElapsed = now - trainingStartTime;
    const hours = Math.floor(timeElapsed / 3600);
    const minutes = Math.floor((timeElapsed % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <motion.div
      whileHover={{ rotate: -2, scale: 1.05 }}
      className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      {/* Pokemon Image Container */}
      <div className="bg-[#FFE5E5] border-4 border-black p-4 mb-4">
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
          alt={pokemon.name}
          className="w-full h-48 object-contain"
        />
      </div>
  
      {/* Pokemon Info */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black">{pokemon.name}</h3>
          <span className="bg-[#4ECDC4] px-3 py-1 font-black border-2 border-black">
            LVL {pokemon.level}
          </span>
        </div>
  
        {/* Stats */}
        <div className="space-y-2">
          {/* Type Badge */}
          <div className="flex items-center gap-2">
            <span className="font-bold">Type:</span>
            <span className={`px-3 py-1 font-black border-2 border-black 
              ${pokemon.type === 'Fire' ? 'bg-[#FF6B6B]' : 
                pokemon.type === 'Water' ? 'bg-[#4ECDC4]' : 
                'bg-[#FFD93D]'}`}>
              {pokemon.type}
            </span>
          </div>
  
          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold">XP:</span>
              <AnimatePresence>
                <motion.span
                  key={pokemon.xp}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="font-bold"
                >
                  {pokemon.xp}/100
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="w-full h-4 border-2 border-black bg-white overflow-hidden">
              <motion.div 
                className="h-full bg-[#4ECDC4]"
                initial={{ width: `${prevXP}%` }}
                animate={{ width: `${pokemon.xp}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
  
          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTrainClick}
              className="flex-1 px-4 py-2 bg-[#FFD93D] font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              {isTraining ? `TRAINING (${getTrainingTime()})` : 'TRAIN'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-4 py-2 bg-[#FF6B6B] font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              BATTLE
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
 export default PokemonCard;