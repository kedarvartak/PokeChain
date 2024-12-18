// src/services/PokeService.js
import { ethers } from 'ethers';
import PokemonNFT from '../artifacts/contracts/PokeContract.sol/PokemonNFT.json';

class PokeService {
  constructor(provider) {
    this.provider = provider;
    this.contractAddress = '0x8f119cd256a0FfFeed643E830ADCD9767a1d517F'; // Your PokemonNFT address
  }

  async getContract(needSigner = false) {
    try {
      console.log('Getting contract with address:', this.contractAddress);
      
      const provider = new ethers.BrowserProvider(this.provider);
      let signer = null;
      
      if (needSigner) {
        signer = await provider.getSigner();
        console.log('Got signer:', await signer.getAddress());
      }
      
      const contract = new ethers.Contract(
        this.contractAddress,
        PokemonNFT.abi,
        needSigner ? signer : provider
      );

      // Basic contract validation
      if (!contract.interface) {
        throw new Error('Invalid contract interface');
      }

      return { contract, signer };
    } catch (error) {
      console.error('Error getting contract:', error);
      throw new Error('Failed to initialize contract: ' + error.message);
    }
  }


  async isNewUser(address) {
    try {
      const { contract } = await this.getContract();
      return !(await contract.hasStarterPokemon(address));
    } catch (error) {
      console.error('Error checking if new user:', error);
      throw error;
    }
  }

  async getPokemonData(pokemonId) {
    try {
      const { contract } = await this.getContract();
      console.log(`Getting data for Pokemon ${pokemonId}`);
      
      const data = await contract.getPokemonData(ethers.getBigInt(pokemonId));
      console.log('Pokemon data:', data);
      
      return {
        name: data.name,
        type: data.pokemonType,
        level: Number(data.level),
        xp: Number(data.xp),
        isTraining: data.isTraining || false,
        trainingStartTime: Number(data.trainingStartTime) || 0,
        trainingGroundId: Number(data.trainingGroundId) || 0
      };
    } catch (error) {
      console.error(`Error getting Pokemon ${pokemonId} data:`, error);
      throw error;
    }
  }

  async getUserPokemon(address) {
    try {
      const { contract } = await this.getContract();
      const starterIds = [1, 4, 7];
      const userPokemon = [];

      for (const pokemonId of starterIds) {
        try {
          const balance = await contract.balanceOf(address, ethers.getBigInt(pokemonId));
          console.log(`Balance for Pokemon ${pokemonId}:`, balance.toString());

          if (balance > 0) {
            const pokemonData = await this.getPokemonData(pokemonId);
            userPokemon.push({
              id: pokemonId,
              ...pokemonData
            });
          }
        } catch (error) {
          console.error(`Error checking Pokemon ${pokemonId}:`, error);
        }
      }

      return userPokemon;
    } catch (error) {
      console.error('Error getting user Pokemon:', error);
      throw error;
    }
  }

  async startTraining(pokemonId, groundId) {
    try {
      console.log('Starting training with params:', { pokemonId, groundId });
      
      const { contract, signer } = await this.getContract(true);
      const address = await signer.getAddress();
      
      console.log('Contract address:', this.contractAddress);
      console.log('Signer address:', address);
      
      // First check if Pokemon can start training
      const balance = await contract.balanceOf(address, ethers.getBigInt(pokemonId));
      console.log('Pokemon balance:', balance.toString());
      if (balance === 0) {
        throw new Error('You do not own this Pokemon');
      }

      // Check if Pokemon is already training
      const pokemonData = await contract.getPokemonData(ethers.getBigInt(pokemonId));
      console.log('Pokemon data:', pokemonData);
      if (pokemonData.isTraining) {
        throw new Error('Pokemon is already training');
      }

      // Get training ground cost
      const trainingGround = await contract.getTrainingGround(ethers.getBigInt(groundId));
      console.log('Training ground:', trainingGround);
      
      // Estimate gas with higher limit
      const gasEstimate = await contract.startTraining.estimateGas(
        ethers.getBigInt(pokemonId),
        ethers.getBigInt(groundId),
        { gasLimit: 500000 }
      );
      console.log('Gas estimate:', gasEstimate.toString());

      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate * 120n / 100n;

      // Send transaction with explicit parameters
      const tx = await contract.startTraining(
        ethers.getBigInt(pokemonId),
        ethers.getBigInt(groundId),
        {
          from: address,
          gasLimit: gasLimit,
        }
      );
      console.log('Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      if (receipt.status === 0) {
        throw new Error('Transaction failed');
      }

      return receipt;
    } catch (error) {
      console.error('Training error:', error);
      
      if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient PokeCoin balance for training');
      }
      if (error.message.includes('user rejected')) {
        throw new Error('Transaction was rejected');
      }
      
      throw new Error('Failed to start training: ' + error.message);
    }
  }

  async mintStarterPokemon(pokemonId) {
    try {
      console.log('Minting starter Pokemon with ID:', pokemonId);
      
      const { contract, signer } = await this.getContract(true);
      const address = await signer.getAddress();
      
      // Check if user already has a starter
      const hasStarter = await contract.hasStarterPokemon(address);
      if (hasStarter) {
        throw new Error('You already have a starter Pokemon');
      }

      // Verify valid starter Pokemon ID (1 = Bulbasaur, 4 = Charmander, 7 = Squirtle)
      if (![1, 4, 7].includes(Number(pokemonId))) {
        throw new Error('Invalid starter Pokemon ID');
      }

      console.log('Sending mint transaction...');
      const tx = await contract.mintStarterPokemon(
        ethers.getBigInt(pokemonId),
        {
          gasLimit: 300000
        }
      );
      
      console.log('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      
      if (receipt.status === 0) {
        throw new Error('Transaction failed');
      }

      console.log('Starter Pokemon minted successfully!');
      return receipt;
    } catch (error) {
      console.error('Error in mintStarterPokemon:', error);
      if (error.message.includes('You already have a starter')) {
        throw new Error('You already have a starter Pokemon');
      }
      if (error.message.includes('Invalid starter')) {
        throw new Error('Invalid starter Pokemon selection');
      }
      throw new Error('Failed to mint starter Pokemon: ' + error.message);
    }
  }

  async getCurrentTrainingXP(pokemonId) {
    try {
      const { contract } = await this.getContract();
      
      // Get Pokemon data from contract
      const pokemon = await contract.pokemonData(ethers.getBigInt(pokemonId));
      
      if (!pokemon.isTraining) {
        return pokemon.xp;
      }

      // Calculate current XP based on contract values
      const currentTime = Math.floor(Date.now() / 1000);
      const trainingTime = currentTime - Number(pokemon.trainingStartTime);
      const minutesSpent = Math.floor(trainingTime / 60);
      
      // Use contract constants for calculations
      const XP_PER_MINUTE = await contract.XP_PER_MINUTE();
      const TYPE_BONUS_MULTIPLIER = await contract.TYPE_BONUS_MULTIPLIER();
      
      let baseXP = Number(pokemon.xp) + (minutesSpent * Number(XP_PER_MINUTE));
      
      // Check if type bonus applies
      const groundId = Number(pokemon.trainingGroundId);
      if (groundId > 0) {
        const ground = await contract.trainingGrounds(groundId);
        if (pokemon.pokemonType === ground.requiredType) {
          baseXP = Math.floor((baseXP * Number(TYPE_BONUS_MULTIPLIER)) / 100);
        }
      }

      return baseXP;
    } catch (error) {
      console.error('Error getting current training XP:', error);
      throw error;
    }
  }

  async endTraining(pokemonId) {
    let contract;
    try {
      const { contract: contractInstance, signer } = await this.getContract(true);
      contract = contractInstance;
      
      console.log('Checking if training can be completed for Pokemon:', pokemonId);
      
      // Check if we can complete training
      const [canComplete, reason] = await contract.canCompleteTraining(ethers.getBigInt(pokemonId));
      console.log('Can complete training?', canComplete, reason);
      
      if (!canComplete) {
        throw new Error(reason);
      }

      // Call completeTraining
      const tx = await contract.completeTraining(
        ethers.getBigInt(pokemonId),
        {
          gasLimit: ethers.getBigInt(300000)
        }
      );

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 0) {
        throw new Error('Transaction failed');
      }

      // Get the TrainingCompleted event from the receipt
      const event = receipt.logs
        .map(log => {
          try {
            return contract.interface.parseLog({
              topics: log.topics,
              data: log.data
            });
          } catch (e) {
            console.error('Failed to parse log:', e);
            return null;
          }
        })
        .find(event => event && event.name === 'TrainingCompleted');

      if (!event) {
        throw new Error('Training completion event not found');
      }

      return {
        xpGained: Number(event.args.xpGained)
      };
    } catch (error) {
      console.error('Error completing training:', error);
      throw error;
    }
  }
}

export const pokemonService = new PokeService(window.ethereum);