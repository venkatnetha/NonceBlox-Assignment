const { ethers } = require('hardhat');
const { expect } = require("chai");


require("@nomiclabs/hardhat-waffle");


describe('NonceBloxLottery', () => {
  let NonceBloxLottery;
  let Link;
  let VRFCoordinator;
  let V3Aggregator;
  let LotteryWrapper;

  let users;
  let owner, user;

  let tx;

  let fee = '100000000000000000';
  let keyHash = '0x3ebe2809e8ab9ecade58008e52868676fb39c3bd42c381c9949421a49d03541a';

  beforeEach('identify signers', async () => {
    users = await ethers.getSigners();
    [owner, user] = users;
  });

  beforeEach('deploy lottery contract', async () => {
    let factory = await ethers.getContractFactory('LinkToken');
    Link = await factory.deploy();

    factory = await ethers.getContractFactory('VRFCoordinatorMock');
    VRFCoordinator = await factory.deploy(Link.address);

    factory = await ethers.getContractFactory('NonceBloxLottery');
    Lottery = await factory.deploy(     
      VRFCoordinator.address,
      Link.address,
      fee     
    );
  });

  describe('when user opens a lottery', () => {
    it('reverts if user is not owner', async () => {
      const user = await NonceBloxLottery.connect(user).startLottery();
      expect(user).to.equal(owner);
    });

    it('reverts if Lottery state was not in CLOSED state', async () => {
      const lotterystate = await NonceBloxLottery.startLottery();
      expect(lotterystate).to.equal(CLOSED);      
    });
   
    it('state becomes OPEN when user is owner and earlier state was closed', async () => {
      const lotterystate = await NonceBloxLottery.startLottery();
      expect(lotterystate).to.equal(OPEN);      
    });
  });
  
});
