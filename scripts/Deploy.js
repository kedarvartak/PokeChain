// scripts/Deploy.js
const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const PokemonNFT = await hre.ethers.getContractFactory("PokemonNFT");

  // Deploy the contract
  console.log("Deploying PokemonNFT...");
  const pokemonNFT = await PokemonNFT.deploy();

  // Wait for deployment to finish
  await pokemonNFT.waitForDeployment();

  // Get the deployed contract address
  const address = await pokemonNFT.getAddress();
  console.log("PokemonNFT deployed to:", address);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await pokemonNFT.deploymentTransaction().wait(5);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });