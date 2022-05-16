  // We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat');

async function deployLottery() {
  //const rinkebyURL = hre.config.networks.rinkeby.url;
  //const rinkebyProvider = new hre.ethers.providers.JsonRpcProvider(rinkebyURL);

  //const wallet = new hre.ethers.Wallet(hre.config.networks.rinkeby.accounts[0], rinkebyProvider);

  const Lottery = await hre.ethers.getContractFactory('NonceBloxLottery');

  // 0.25 LINK = "250000000000000000"
  const fee = '250000000000000000';

  const keyHash = '0x3ebe2809e8ab9ecade58008e52868676fb39c3bd42c381c9949421a49d03541a';

  // Rinkeby Addresses
  const priceFeedAddress = '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e';
  const vrfCoordinator = '0x6168499c0cFfCaCD319c818142124B7A15E857ab';
  const link = '0x01BE23585060835E02B77ef475b0Cc51aA1e0709';

  const lottery = await Lottery.deploy(vrfCoordinator, link,fee);

  const deployedLottery = await lottery.deployed();

  // As an owner, start the lottery
  console.log('Starting Lottery at:', deployedLottery.address);

  await deployedLottery.startLottery("100000000000000000");
}

async function main() {
  await deployLottery();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });