// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../NonceBlox.sol";

contract LotteryTest is NonceBloxLottery {
    // todo using SafeMath ??

    constructor(      
        address _vrfCoordinator,
        address _link,
        uint256 _fee        
    ) NonceBloxLottery(_vrfCoordinator, _link, _fee) {}

    function testFulfillRandomnessNotStarted(bytes32 requestId, uint256 _randomness) public {
        NonceBloxLottery.fulfillRandomness(requestId, _randomness);
    }

    function testFulfillRandomnessZeroRandomness(bytes32 requestId, uint256 _randomness) public {
        NonceBloxLottery.lottery_state = LOTTERY_STATE.CALCULATING_WINNER;
        NonceBloxLottery.fulfillRandomness(requestId, _randomness);
    }

    function testFulfillRandomnessZeroPlayers(bytes32 requestId, uint256 _randomness) public {
        NonceBloxLottery.lottery_state = LOTTERY_STATE.CALCULATING_WINNER;
        NonceBloxLottery.fulfillRandomness(requestId, _randomness);
    }

    function testFulfillRandomnessSuccess(bytes32 requestId, uint256 _randomness) public payable {
        NonceBloxLottery.lottery_state = LOTTERY_STATE.OPEN;
        NonceBloxLottery.PlayLottery();

        uint256 senderBalanceBefore = msg.sender.balance;

        NonceBloxLottery.lottery_state = LOTTERY_STATE.CALCULATING_WINNER;
        NonceBloxLottery.fulfillRandomness(requestId, _randomness);

        uint256 senderBalanceAfter = msg.sender.balance;

        
        require((senderBalanceAfter - senderBalanceBefore) == msg.value, "Incorrect amount transfered to the winner");
        require(NonceBloxLottery.players.length == 0, "Players array is not set to empty after lottery ends");
        require(NonceBloxLottery.lottery_state == LOTTERY_STATE.CLOSED, "Lottery didn't close");
        
    }
}