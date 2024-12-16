// src/context/PokemonContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';
import { pokemonService } from '../services/PokeService';

const PokemonContext = createContext();

export const starterPokemon = [
  { id: 1, name: 'Bulbasaur', type: 'Grass', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png' },
  { id: 4, name: 'Charmander', type: 'Fire', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png' },
  { id: 7, name: 'Squirtle', type: 'Water', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png' }
];

export const PokemonProvider = ({ children }) => {
  const { address, isConnected } = useWallet();
  const [isNewUser, setIsNewUser] = useState(null);
  const [userPokemon, setUserPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check user status and load Pokemon when wallet connects
  useEffect(() => {
    const checkUserStatus = async () => {
      if (isConnected && address) {
        try {
          setLoading(true);
          setError(null);
          
          // Check if user has starter Pokemon using the contract
          const isNew = await pokemonService.isNewUser(address);
          setIsNewUser(isNew);
          
          if (!isNew) {
            // If user has Pokemon, fetch them from the contract
            const userPokemonData = await pokemonService.getUserPokemon(address);
            setUserPokemon(userPokemonData);
          } else {
            setUserPokemon([]);
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      } else {
        // Reset state when wallet disconnects
        setIsNewUser(null);
        setUserPokemon([]);
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [isConnected, address]);

  const selectStarterPokemon = async (pokemonId) => {
    try {
      setLoading(true);
      setError(null);
  
      // Get contract instance from pokemonService
      const contract = await pokemonService.getContract(true);
      
      // Mint the starter Pokemon NFT
      const result = await pokemonService.mintStarterPokemon(pokemonId);
      
      // Update state with the minted Pokemon
      setIsNewUser(false);
      setUserPokemon([result.pokemon]);
      
    } catch (error) {
      console.error('Error selecting starter Pokemon:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  
  };

  return (
    <PokemonContext.Provider
      value={{
        isNewUser,
        userPokemon,
        loading,
        error,
        selectStarterPokemon,
        starterPokemon
      }}
    >
      {children}
    </PokemonContext.Provider>
  );
};

export const usePokemon = () => useContext(PokemonContext);