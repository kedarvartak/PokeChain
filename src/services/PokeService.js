// src/services/PokeService.js
import { ethers } from 'ethers';
import PokemonNFTJson from '../artifacts/contracts/PokeContract.sol/PokemonNFT.json';
const PokemonNFTAbi = PokemonNFTJson.abi;
const CONTRACT_ADDRESS = '0x572316aC11CB4bc5daf6BDae68f43EA3CCE3aE0e'; 

const LINEA_SEPOLIA_CONFIG = {
  chainId: '0xE705', // 59141 in hex
  chainName: 'Linea Sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://rpc.sepolia.linea.build'],
  blockExplorerUrls: ['https://sepolia.lineascan.build']
};

export const pokemonService = {

  async ensureLineaSepoliaNetwork() {
    if (window.ethereum) {
      try {
        // Try to switch to Linea Sepolia
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: LINEA_SEPOLIA_CONFIG.chainId }],
        });
      } catch (switchError) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [LINEA_SEPOLIA_CONFIG],
            });
          } catch (addError) {
            throw new Error('Failed to add Linea Sepolia network');
          }
        } else {
          throw new Error('Failed to switch to Linea Sepolia network');
        }
      }
    }
  },


  // Get contract instance
  async getContract(withSigner = false) {
    try {
      console.log('Getting contract with ABI:', PokemonNFTAbi);
      await this.ensureLineaSepoliaNetwork();
      const provider = new ethers.BrowserProvider(window.ethereum);
      if (withSigner) {
        const signer = await provider.getSigner();
        return new ethers.Contract(CONTRACT_ADDRESS, PokemonNFTAbi, signer);
      }
      return new ethers.Contract(CONTRACT_ADDRESS, PokemonNFTAbi, provider);
    } catch (error) {
      console.error('Detailed error getting contract:', error);
      throw new Error('Failed to connect to the game contract');
    }
  },

  // Check if user is new (doesn't have starter Pokemon)
  async isNewUser(address) {
    try {
      const contract = await this.getContract();
      const hasStarter = await contract.hasStarterPokemon(address);
      return !hasStarter;
    } catch (error) {
      console.error('Error checking user status:', error);
      throw new Error('Failed to check user status');
    }
  },

  // Get user's Pokemon
  async getUserPokemon(address) {
    try {
      const contract = await this.getContract();
      
      // Get all possible starter Pokemon IDs
      const starterIds = [1, 4, 7]; // Bulbasaur, Charmander, Squirtle
      const userPokemon = [];

      // Check each Pokemon ID
      for (const id of starterIds) {
        const balance = await contract.balanceOf(address, id);
        if (balance > 0) {
          // Get Pokemon data from contract
          const pokemonData = await contract.getPokemonData(id);
          userPokemon.push({
            id,
            name: pokemonData.name,
            type: pokemonData.pokemonType,
            level: Number(pokemonData.level),
            xp: Number(pokemonData.xp),
            // Add URI for metadata/image
            uri: await contract.uri(id)
          });
        }
      }
      
      return userPokemon;
    } catch (error) {
      console.error('Error getting user Pokemon:', error);
      throw new Error('Failed to fetch your Pokemon');
    }
  },

  // Mint starter Pokemon
  async mintStarterPokemon(pokemonId) {
    try {
      const contract = await this.getContract(true);
      
      // Estimate gas first
      const gasEstimate = await contract.mintStarterPokemon.estimateGas(pokemonId);
      
      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate * 120n / 100n;

      // Send transaction
      const tx = await contract.mintStarterPokemon(pokemonId, {
        gasLimit
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      // Get the minted Pokemon data
      const pokemonData = await contract.getPokemonData(pokemonId);

      // Return transaction details and Pokemon data
      return {
        success: true,
        transactionHash: receipt.hash,
        pokemon: {
          id: pokemonId,
          name: pokemonData.name,
          type: pokemonData.pokemonType,
          level: Number(pokemonData.level),
          xp: Number(pokemonData.xp),
          uri: await contract.uri(pokemonId)
        }
      };
    } catch (error) {
      console.error('Error minting starter Pokemon:', error);
      
      // Handle specific error cases
      if (error.message.includes('user rejected')) {
        throw new Error('Transaction was rejected');
      }
      if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient funds for transaction');
      }
      throw new Error('Failed to mint starter Pokemon');
    }
  },

  // Listen for Pokemon minted event
  async listenToMintEvents(callback) {
    try {
      const contract = await this.getContract();
      
      // Listen for TransferSingle event (ERC1155 transfer event)
      contract.on("TransferSingle", (operator, from, to, id, value) => {
        if (from === ethers.ZeroAddress) { // New mint
          callback({
            type: 'MINT',
            tokenId: id,
            to: to,
            value: value
          });
        }
      });

      return () => {
        contract.removeAllListeners("TransferSingle");
      };
    } catch (error) {
      console.error('Error setting up event listener:', error);
      throw new Error('Failed to setup mint event listener');
    }
  },

  // Get Pokemon metadata URI
  async getPokemonMetadata(tokenId) {
    try {
      const contract = await this.getContract();
      const uri = await contract.uri(tokenId);
      const response = await fetch(uri);
      const metadata = await response.json();
      return metadata;
    } catch (error) {
      console.error('Error fetching Pokemon metadata:', error);
      throw new Error('Failed to fetch Pokemon metadata');
    }
  }
};