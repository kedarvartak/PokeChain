// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PokemonItems is ERC1155, Ownable {
    using Strings for uint256;
    
    struct Item {
        string name;
        string itemType;
        uint256 price;
        bool isAvailable;
    }
    
    mapping(uint256 => Item) public items;
    
    // Item IDs
    uint256 public constant POKEBALL = 1;
    uint256 public constant GREAT_BALL = 2;
    uint256 public constant ULTRA_BALL = 3;
    uint256 public constant MASTER_BALL = 4;
    
    constructor() ERC1155("") Ownable(msg.sender) {
        // Initialize items
        items[POKEBALL] = Item("Pokeball", "Ball", 0.001 ether, true);
        items[GREAT_BALL] = Item("Great Ball", "Ball", 0.002 ether, true);
        items[ULTRA_BALL] = Item("Ultra Ball", "Ball", 0.003 ether, true);
        items[MASTER_BALL] = Item("Master Ball", "Ball", 0.01 ether, true);
    }
    
    function mintItem(uint256 itemId, uint256 amount) external payable {
        require(items[itemId].isAvailable, "Item not available");
        require(msg.value >= items[itemId].price * amount, "Insufficient payment");
        
        _mint(msg.sender, itemId, amount, "");
    }
    
    function setItemPrice(uint256 itemId, uint256 newPrice) external onlyOwner {
        items[itemId].price = newPrice;
    }
    
    function setItemAvailability(uint256 itemId, bool isAvailable) external onlyOwner {
        items[itemId].isAvailable = isAvailable;
    }
    
    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
} 