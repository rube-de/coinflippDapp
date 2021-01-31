pragma solidity 0.5.12;

import "./Ownable.sol";

contract CoinFlip is Ownable{
    uint public balance;

    event coinFlipped(uint bettingAmount, address player);
    event balancedRaised(uint value, address raiser);
    event payout(uint amount, address player);
    event wonFlip(uint amount, address player);
    event lostFlip(uint amount, address player);

    event changeBalance(uint balance);

    mapping (address => uint) private playerBalance;
    address[] private players;

    function doCoinFlip() public payable returns (bool){
        players.push(msg.sender);
        uint result = random();
        uint bettingAmount = msg.value;
        balance += msg.value;
        emit changeBalance(balance);
        if(result == 1){
            //player won
            require(balance >= bettingAmount *2, "Contract balance needs to be higher than winning amount");
            playerBalance[msg.sender] = bettingAmount *2;
            emit wonFlip(bettingAmount *2, msg.sender);
        }else{
            emit lostFlip(bettingAmount, msg.sender);
        }
        emit coinFlipped(bettingAmount, msg.sender);
        return result > 0;
    }

    function payoutPrize() public {
        //send to player adr
        uint prizeAmount = playerBalance[msg.sender];
        require(prizeAmount > 0);
        balance = balance - prizeAmount;
        msg.sender.transfer(playerBalance[msg.sender]);
        playerBalance[msg.sender] = 0;
        emit payout(prizeAmount, msg.sender);
    }

    function getFlipResult() public view returns (bool won){
        return playerBalance[msg.sender] > 0;
    }

    function random() private view returns (uint){
        return now % 2;
    }

    function loadPrizePool() public payable {
        balance += msg.value;
        emit balancedRaised(msg.value, msg.sender);
    }

    function withdrawAll() public onlyOwner returns(uint) {
        uint toTransfer = balance;
        balance = 0;
        msg.sender.transfer(toTransfer);
        return toTransfer;
    }

    function getPlayerBalance() public view returns(uint){
        return playerBalance[msg.sender];
    }
}