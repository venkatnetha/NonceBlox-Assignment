const { ethers } = require('hardhat');
const { assert, expect,assertReverts } = require("chai")


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
    await Lottery.deployed();
  });

  describe("startLottery", () => {
    it('reverts if Lottery state was not in CLOSED state', async () => {
      await Lottery.startLottery("100000000000000000");
      await assert(Lottery.startLottery("100000000000000000"), "can't start the lottery yet");
    });

    it('state becomes OPEN when start lottery is called', async () => {
      await Lottery.startLottery("100000000000000000");
      const currentlotterystate = await Lottery.lottery_state();
      expect(currentlotterystate).to.equal(0);
    });

  });

  
  describe("PlayLottery", () => {    
    it("reverts when you don't pay enough", async () => {
      tx = await Lottery.startLottery("100000000000");
      const entranceFee = await Lottery.entryFee();
      await expect(Lottery.PlayLottery({ value: entranceFee.sub(1) })).to.be.revertedWith(
            "Value sent is not equal to entryFee - 0.1 ether"
        )
    });

    it('user enters lottery when amount greater than required fee', async () => {
      tx = await Lottery.startLottery("100000000000");
      const entranceFee = await Lottery.entryFee();
      await expect(Lottery.PlayLottery({ value: entranceFee.add(1) })).to.emit(
        Lottery,
        "PlayerJoined"
        )
    });

    it("emits event on enter", async () => {
      tx = await Lottery.startLottery("100000000000");
      const entranceFee = await Lottery.entryFee();
      await expect(Lottery.PlayLottery({ value: entranceFee })).to.emit(
        Lottery,
        "PlayerJoined"
        )
    });
  });


  describe('when owner ends the lottery', () => {
    it('reverts if Not enough LINK tokens present in the account', async () => {      
        const currentlotterystate = await Lottery.lottery_state();             
        await expect(Lottery.pickRandomWinner()).to.be.revertedWith(
            "Not enough LINK"
        )
    });

  });
});
