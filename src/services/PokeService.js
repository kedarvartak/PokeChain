// src/services/PokeService.js
import { ethers } from 'ethers';
import PokemonNFTJson from '../artifacts/contracts/PokeContract.sol/PokemonNFT.json';
const PokemonNFTAbi = PokemonNFTJson.abi;
const CONTRACT_ADDRESS = '0x94fFA1C7330845646CE9128450F8e6c3B5e44F86'; 

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
      console.log('PokeService: Checking if user is new:', address);
      const contract = await this.getContract();
      const hasStarter = await contract.hasStarterPokemon(address);
      console.log('PokeService: Has starter pokemon:', hasStarter);
      return !hasStarter;
    } catch (error) {
      console.error('PokeService: Error checking user status:', error);
      throw error;
    }
  },

  // Get user's Pokemon
  async getUserPokemon(address) {
    try {
      console.log('PokeService: Fetching Pokemon for address:', address);
      const contract = await this.getContract();
      
      const starterIds = [1, 4, 7];
      const userPokemon = [];

      for (const id of starterIds) {
        try {
          console.log(`PokeService: Checking balance for Pokemon ${id}`);
          const balance = await contract.balanceOf(address, id);
          console.log(`PokeService: Balance for Pokemon ${id}:`, balance);
          
          if (balance > 0n) {
            console.log(`PokeService: Fetching data for Pokemon ${id}`);
            const pokemonData = await contract.getPokemonData(id);
            console.log(`PokeService: Pokemon ${id} data:`, pokemonData);
            
            userPokemon.push({
              id,
              name: pokemonData.name,
              type: pokemonData.pokemonType,
              level: Number(pokemonData.level),
              xp: Number(pokemonData.xp),
              isTraining: pokemonData.isTraining,
              trainingStartTime: Number(pokemonData.trainingStartTime)
            });
          }
        } catch (err) {
          console.error(`PokeService: Error checking Pokemon ${id}:`, err);
        }
      }
      
      console.log('PokeService: Final user Pokemon array:', userPokemon);
      return userPokemon;
    } catch (error) {
      console.error('PokeService: Error in getUserPokemon:', error);
      throw error;
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
  },

  async startTraining(pokemonId, groundId) {
    try {
      const contract = await this.getContract(true);
      const gasEstimate = await contract.startTraining.estimateGas(pokemonId, groundId);
      const gasLimit = gasEstimate * 120n / 100n;

      const tx = await contract.startTraining(pokemonId, groundId, { gasLimit });
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error('Error starting training:', error);
      if (error.message.includes('user rejected')) {
        throw new Error('Transaction was rejected');
      }
      throw new Error('Failed to start training');
    }
  },

  async endTraining(pokemonId, groundId) {
    try {
      const contract = await this.getContract(true);
      const gasEstimate = await contract.endTraining.estimateGas(pokemonId, groundId);
      const gasLimit = gasEstimate * 120n / 100n;

      const tx = await contract.endTraining(pokemonId, groundId, { gasLimit });
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error('Error ending training:', error);
      if (error.message.includes('user rejected')) {
        throw new Error('Transaction was rejected');
      }
      throw new Error('Failed to end training');
    }
  }
};

export default pokemonService;