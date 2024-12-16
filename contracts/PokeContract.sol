// contracts/PokemonNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PokemonNFT is ERC1155, Ownable {
    using Strings for uint256;
    
    // Mapping from token ID to Pokemon data
    struct Pokemon {
        string name;
        string pokemonType;
        uint256 level;
        uint256 xp;
    }
    
    mapping(uint256 => Pokemon) public pokemonData;
    mapping(address => bool) public hasStarterPokemon;
    
    // Base URI for metadata
    string private baseURI;
    
    constructor() ERC1155("") Ownable(msg.sender) {
        // Initialize starter Pokemon
        pokemonData[1] = Pokemon("Bulbasaur", "Grass", 5, 0);
        pokemonData[4] = Pokemon("Charmander", "Fire", 5, 0);
        pokemonData[7] = Pokemon("Squirtle", "Water", 5, 0);
    }
    
    function mintStarterPokemon(uint256 pokemonId) external {
        require(pokemonId == 1 || pokemonId == 4 || pokemonId == 7, "Invalid starter Pokemon");
        require(!hasStarterPokemon[msg.sender], "Already has starter Pokemon");
        
        // Mint the Pokemon NFT
        _mint(msg.sender, pokemonId, 1, "");
        hasStarterPokemon[msg.sender] = true;
    }
    
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }
    
    function uri(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(
            baseURI,
            tokenId.toString(),
            ".json"
        ));
    }
    
    function getPokemonData(uint256 tokenId) external view returns (Pokemon memory) {
        return pokemonData[tokenId];
    }
}