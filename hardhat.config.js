require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");

//Advanced configurations

require("hardhat-gas-reporter");
require("solidity-coverage");

require("hardhat-deploy");
require("@appliedblockchain/chainlink-plugins-fund-link");



module.exports = {
  networks: {
    rinkeby :{
      url: process.env.RINKEYBY_URL || "",
      chainId : 4,
      accounts : process.env.RINKEBY_ACCOUNT,
    },
  },
  gasReporter :{
    enabled : true,
    currency : "USD",    
  },
  etherscan : {
    apikey : process.env.ETHERSCAN_API_KEY,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
      },
      {
        version: "0.6.6",
      },
      {
        version: "0.4.24",
      },
    ],
  },
};
