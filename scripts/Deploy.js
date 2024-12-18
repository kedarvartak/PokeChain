// scripts/Deploy.js
const hre = require("hardhat");

async function main() {
  try {
    // Get existing PokeCoin contract
    console.log("Getting existing PokeCoin contract...");
    const PokeCoin = await hre.ethers.getContractFactory("PokeCoin");
    // Use the most recently deployed PokeCoin address ithe takaychay address
    const pokeCoin = PokeCoin.attach("0x4f42528B7bF8Da96516bECb22c1c6f53a8Ac7312"); // Latest deployed address
    console.log("Found PokeCoin at:", await pokeCoin.getAddress());

    // Deploy PokemonNFT
    console.log("\nDeploying PokemonNFT...");
    const PokemonNFT = await hre.ethers.getContractFactory("PokemonNFT");
    const pokemonNFT = await PokemonNFT.deploy();
    await pokemonNFT.waitForDeployment();
    const pokemonNFTAddress = await pokemonNFT.getAddress();
    console.log("PokemonNFT deployed to:", pokemonNFTAddress);

    await pokemonNFT.deploymentTransaction().wait(2);

    // Link contracts
    console.log("\nLinking contracts...");
    const setPokeCoinTx = await pokemonNFT.setPokeCoinContract(await pokeCoin.getAddress());
    await setPokeCoinTx.wait(2);
    
    // Add PokemonNFT as minter
    console.log("Adding PokemonNFT as minter...");
    const addMinterTx = await pokeCoin.addMinter(pokemonNFTAddress);
    await addMinterTx.wait(2);
    
    console.log("Contracts linked and permissions set successfully");

    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log("PokeCoin:", await pokeCoin.getAddress());
    console.log("PokemonNFT:", pokemonNFTAddress);

  } catch (error) {
    console.error("Deployment error:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });