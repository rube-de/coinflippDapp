pragma solidity 0.5.12;

import "./Ownable.sol";

contract CoinFlip is Ownable{
    uint public balance;

    function doCoinFlip() public payable{
        uint result = random();
        uint bettingAmount = msg.value;
        if(result == 1){
            //player won
            payoutPrize(bettingAmount);
        } else {
            //add bettingAmount to conract balance
            balance += msg.value;
        }
    }

    function payoutPrize(uint value) {
        uint prize = value*2;
        //send to player adr
    }

    function random() public view returns (uint){
        return now % 2;
    }

    function withdrawAll() public onlyOwner returns(uint) {
        uint toTransfer = balance;
        balance = 0;
        msg.sender.transfer(toTransfer);
        return toTransfer;
    }
}