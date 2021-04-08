pragma solidity 0.5.12;

import "./Ownable.sol";
import "./provableAPI.sol";
import "./SafeMath.sol";

contract CoinFlip is Ownable, usingProvable{
    using SafeMath for uint256;

    uint public balance;

    mapping (bytes32 => address) private playerQuery;
    mapping (bytes32 => uint) private randomResult;
    mapping(address => Player) players;

    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;
    uint256 public latestNumber;

    event coinFlipped(bytes32 queryId, bool won, uint bettingAmount, address player);
    event balancedRaised(uint value, address raiser);
    event payout(uint amount, address player);
    event wonFlip(uint amount, address player);
    event lostFlip(uint amount, address player);
    event changeBalance(uint balance);
    event newCoinFlip(address player , bytes32 queryId, uint amount);

    event LogNewProvableQuery(string msg);
    event generatedRandomNumber(bytes32 indexed queryId, uint256 randomNumber);

    struct Player {
        address adr;
        uint betAmount;
        uint balance;
        bool isPlaying;
    }

    struct Play {
        address playerAddress;
        bytes32 id;
    }
    constructor() public {
      //  update();
    }

    function _createPlayer(address _adr, uint _betAmount) private returns(Player storage){
        players[_adr] = Player(_adr,_betAmount, 0, false);
        return players[_adr];
    }

    function doCoinFlip() public payable {
        require (address(this).balance >= msg.value.mul(2), "Contract balance needs to be higher than winning amount");
        Player memory currentPlayer;
        if(players[msg.sender].betAmount > 0){
            require (players[msg.sender].isPlaying == false, "Currently in game");
            currentPlayer = players[msg.sender];
            currentPlayer.betAmount = msg.value;
        } else{
            currentPlayer = _createPlayer(msg.sender,msg.value);
        }
        currentPlayer.isPlaying = true;
        bytes32 queryId = update();
        playerQuery[queryId] = msg.sender;
        balance += msg.value;
        emit changeBalance(balance);
        emit newCoinFlip(msg.sender, queryId, msg.value);
    }

    function calculateResult(bytes32 queryId) private {
        uint result = randomResult[queryId];
        Player memory player = players[playerQuery[queryId]];
        if(result == 1){
            //player won
            require(balance >= player.betAmount *2, "Contract balance needs to be higher than winning amount");
            player.balance += player.betAmount *2;
            emit coinFlipped(queryId, true, player.betAmount,player.adr);
            emit wonFlip(player.betAmount, player.adr);
        }else{
            emit coinFlipped(queryId, false, player.betAmount,player.adr);
            emit lostFlip(player.betAmount, player.adr);
        }
    }

    function payoutPrize() public {
        //send to player adr
        uint prizeAmount = players[msg.sender].balance;
        require(prizeAmount > 0);
        balance = balance - prizeAmount;
        msg.sender.transfer(prizeAmount);
        players[msg.sender].balance = 0;
        emit payout(prizeAmount, msg.sender);
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
        return players[msg.sender].balance;
    }

    function __callback(bytes32 _queryId, string memory _result, bytes memory _proof) public {
        require(msg.sender == provable_cbAddress());
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(_result))) % 2;
        randomResult[_queryId] = randomNumber;
        emit generatedRandomNumber(_queryId, randomNumber);
        calculateResult(_queryId);
    }

    function update() payable public returns (bytes32){
        uint256 QUERY_EXECUTION_DELAY = 0;
        uint256 GAS_FOR_CALLBACK = 200000;
        bytes32 queryId = provable_newRandomDSQuery(
            QUERY_EXECUTION_DELAY,
            NUM_RANDOM_BYTES_REQUESTED,
            GAS_FOR_CALLBACK
        );
        //bytes32 queryId = testRandom();
        emit LogNewProvableQuery("Provable query was sent, standing by for answer");
        return queryId;
    }

    //for local testing
    function testRandom() public returns(bytes32){
        bytes32 queryId = bytes32(keccak256(abi.encodePacked(msg.sender)));
        __callback(queryId, "1", bytes("test"));
        return queryId;
    }

    //for local testing
    function random() private view returns (uint){
        return now % 2;
    }
}