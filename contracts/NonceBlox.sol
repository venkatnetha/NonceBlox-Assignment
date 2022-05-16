// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract NonceBloxLottery is VRFConsumerBase, Ownable{
    enum LOTTERY_STATE {
        OPEN,
        CLOSED,
        CALCULATING_WINNER
    }

    LOTTERY_STATE public lottery_state;

    // The amount of LINK to send with the request
    uint256 public fee;

    // The player array where players addresses are stored to pick the winner and to pay them
    address[] public players;

    // keyhash will be the owners public key for providing randomness      
    bytes32 public keyHash = 0x3ebe2809e8ab9ecade58008e52868676fb39c3bd42c381c9949421a49d03541a;

    // The  time limit can be set from the constructor
    uint256 public timeLimit;

    // the entry limit is configurable one for the game
    uint256 public entryFee;
     // current game id
    uint256 public lotteryId;

    event RequestedRandomness(bytes32 requestId);
        // emitted when the game starts
    event LotteryStarted(uint256 lotteryId, uint256 entryFee);
    // emitted when someone joins a game
    event PlayerJoined(uint256 lotteryId, address player);
    // emitted when the game ends
    event LotteryEnded(uint256 lotteryId, address winner,bytes32 requestId);

      /**
   * constructor inherits a VRFConsumerBase and initiates the values for keyHash, fee and gameStarted
   * @param vrfCoordinator address of VRFCoordinator contract
   * @param linkToken address of LINK token contract
   * @param vrfFee the amount of LINK to send with the request  
   */
    constructor(address vrfCoordinator, address linkToken, 
     uint256 vrfFee)
    VRFConsumerBase(vrfCoordinator, linkToken) {        
        fee = vrfFee;
        lottery_state = LOTTERY_STATE.CLOSED;        
    }
    
    /**
    * startGame starts the game by setting appropriate values for all the variables
    */
    function startLottery(uint256 _entryFee) public onlyOwner {
        // Check if there is a game already running
        require(lottery_state == LOTTERY_STATE.CLOSED, "Game is currently running");
        // empty the players array
        delete players;
        // set the time limit in seconds for the game --3600 seconds is 1 hour
        timeLimit = block.timestamp + 60;
        // set the game started to true
        lottery_state = LOTTERY_STATE.OPEN;
        // setup the entryFee for the game
        entryFee = _entryFee;
        lotteryId += 1;
        emit LotteryStarted(lotteryId, entryFee);
    }

    /**
    joinGame is called when a player wants to enter the game
     */
    function PlayLottery() public payable {
        // Check if a game is already running
        require(lottery_state == LOTTERY_STATE.OPEN, "Game has not been started yet");
        // Check the 1 hour time limit to participate in the game
        require(block.timestamp <= timeLimit, " The one hour time limit ended for the game-try next one");
        // Check if the value sent by the user matches the entryFee
        require(msg.value >= entryFee, "Value sent is not equal to entryFee - 0.1 ether");        
        // add the sender to the players list
        players.push(msg.sender);
        emit PlayerJoined(lotteryId, msg.sender);
    }

    /**
    * fulfillRandomness is called by VRFCoordinator when it receives a valid VRF proof.
    * This function is overrided to act upon the random number generated by Chainlink VRF.
    * @param requestId  this ID is unique for the request we sent to the VRF Coordinator
    * @param randomness this is a random unit256 generated and returned to us by the VRF Coordinator
   */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal virtual override  {
        // We want out winnerIndex to be in the length from 0 to players.length-1
        // For this we mod it with the player.length value
        uint256 winnerIndex = randomness % players.length;
        // get the address of the winner from the players array
        address winner = players[winnerIndex];
        // send the ether in the contract to the winner
        (bool sent,) = winner.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
        // Emit that the game has ended
        emit LotteryEnded(lotteryId, winner,requestId);
        // set the gameStarted variable to false
        lottery_state = LOTTERY_STATE.CLOSED;
    }

    /**
    * getRandomWinner is called to start the process of selecting a random winner
    */
    function pickRandomWinner() public onlyOwner returns (bytes32 requestId) {
        //check for the time period elapsed- if less than 1 hour - let the game run
        require(block.timestamp >= timeLimit, "Time for the game not yet finished");
        //set the game state to calculating
        lottery_state = LOTTERY_STATE.CALCULATING_WINNER;
        // LINK is an internal interface for Link token found within the VRFConsumerBase
        // Here we use the balanceOF method from that interface to make sure that our 
        // contract has enough link so that we can request the VRFCoordinator for randomness
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        // Make a request to the VRF coordinator. 
        // requestRandomness is a function within the VRFConsumerBase
        // it starts the process of randomness generation 
        return requestRandomness(keyHash, fee);
    }

     // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}
