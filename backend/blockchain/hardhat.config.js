import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};

// Only add Sepolia IF env vars exist
if (process.env.RPC_URL && process.env.PRIVATE_KEY) {
  config.networks.sepolia = {
    url: process.env.RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
  };
}

export default config;
