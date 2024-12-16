// contracts/PokemonNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PokemonNFT is ERC1155, Ownable {
    using Strings for uint256;
    
    struct Pokemon {
        string name;
        string pokemonType;
        uint256 level;
        uint256 xp;
        uint256 trainingStartTime;
        bool isTraining;
    }
    
    struct TrainingGround {
        string name;
        uint256 xpPerHour;
        string requiredType;
        uint256 minLevel;
    }
    
    mapping(uint256 => Pokemon) public pokemonData;
    mapping(address => bool) public hasStarterPokemon;
    mapping(uint256 => TrainingGround) public trainingGrounds;
    
    uint256 public constant BASIC_TRAINING = 1;
    uint256 public constant FIRE_DOJO = 2;
    uint256 public constant WATER_TEMPLE = 3;
    uint256 public constant GRASS_GARDEN = 4;
    
    uint256 public constant MIN_TRAINING_TIME = 1 hours;
    uint256 public constant TYPE_BONUS_MULTIPLIER = 150;
    
    string private baseURI;
    
    event TrainingStarted(uint256 indexed pokemonId, uint256 groundId, uint256 startTime);
    event TrainingCompleted(uint256 indexed pokemonId, uint256 groundId, uint256 xpGained);
    
    constructor() ERC1155("") Ownable(msg.sender) {
        pokemonData[1] = Pokemon("Bulbasaur", "Grass", 5, 0, 0, false);
        pokemonData[4] = Pokemon("Charmander", "Fire", 5, 0, 0, false);
        pokemonData[7] = Pokemon("Squirtle", "Water", 5, 0, 0, false);
        
        trainingGrounds[BASIC_TRAINING] = TrainingGround("Basic Training", 10, "", 1);
        trainingGrounds[FIRE_DOJO] = TrainingGround("Fire Dojo", 20, "Fire", 5);
        trainingGrounds[WATER_TEMPLE] = TrainingGround("Water Temple", 20, "Water", 5);
        trainingGrounds[GRASS_GARDEN] = TrainingGround("Grass Garden", 20, "Grass", 5);
    }
    
    function mintStarterPokemon(uint256 pokemonId) external {
        require(pokemonId == 1 || pokemonId == 4 || pokemonId == 7, "Invalid starter Pokemon");
        require(!hasStarterPokemon[msg.sender], "Already has starter Pokemon");
        
        _mint(msg.sender, pokemonId, 1, "");
        hasStarterPokemon[msg.sender] = true;
    }
    
    function startTraining(uint256 pokemonId, uint256 groundId) external {
        require(balanceOf(msg.sender, pokemonId) > 0, "Not your Pokemon");
        require(!pokemonData[pokemonId].isTraining, "Already training");
        require(pokemonData[pokemonId].level >= trainingGrounds[groundId].minLevel, "Level too low");
        
        pokemonData[pokemonId].isTraining = true;
        pokemonData[pokemonId].trainingStartTime = block.timestamp;
        
        emit TrainingStarted(pokemonId, groundId, block.timestamp);
    }
    
    function endTraining(uint256 pokemonId, uint256 groundId) external {
        require(balanceOf(msg.sender, pokemonId) > 0, "Not your Pokemon");
        require(pokemonData[pokemonId].isTraining, "Not training");
        require(block.timestamp >= pokemonData[pokemonId].trainingStartTime + MIN_TRAINING_TIME, 
                "Min training time not met");
        
        uint256 trainingTime = block.timestamp - pokemonData[pokemonId].trainingStartTime;
        uint256 hoursSpent = trainingTime / 1 hours;
        
        uint256 baseXP = hoursSpent * trainingGrounds[groundId].xpPerHour;
        
        if (keccak256(bytes(pokemonData[pokemonId].pokemonType)) == 
            keccak256(bytes(trainingGrounds[groundId].requiredType))) {
            baseXP = (baseXP * TYPE_BONUS_MULTIPLIER) / 100;
        }
        
        pokemonData[pokemonId].xp += baseXP;
        
        while (pokemonData[pokemonId].xp >= 100) {
            pokemonData[pokemonId].level += 1;
            pokemonData[pokemonId].xp -= 100;
        }
        
        pokemonData[pokemonId].isTraining = false;
        pokemonData[pokemonId].trainingStartTime = 0;
        
        emit TrainingCompleted(pokemonId, groundId, baseXP);
    }
    
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }
    
    function uri(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));
    }
    
    function getPokemonData(uint256 tokenId) external view returns (Pokemon memory) {
        return pokemonData[tokenId];
    }
    
    function getTrainingGround(uint256 groundId) external view returns (TrainingGround memory) {
        return trainingGrounds[groundId];
    }
}