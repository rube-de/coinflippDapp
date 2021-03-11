var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var playerAddress;
const contractAdr = "0xcaF48b9B869a5c80ce8941b028E0b0F1E8d78d21"

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
        contractInstance = new web3.eth.Contract(abi, contractAdr, {from: accounts[0]});
        console.log(contractInstance);
        playerAddress = accounts[0];
        getPlayerBalance();
        getPoolBalance();

        contractInstance.events.wonFlip((err, ev) => {
            $("#result_event").text("you have won");
        });
        contractInstance.events.lostFlip((err, ev) => {
            $("#result_event").text("you have lost, try again");
        });
    });
    $("#flip_coin_button").click(flipCoin);
    $("#claim_button").click(claimPrize);
    $("#loadPrizePool").click(loadPrizePool);
});

function flipCoin(){

    var bettingAmount = $("#betting_input").val();
    console.log("flip button with " + bettingAmount + " ether");

    var config = {value: web3.utils.toWei(bettingAmount, "ether")};

    contractInstance.methods.doCoinFlip().send(config)
        .on("transactionHash", hash => {
            console.log("hash: " + hash);
            $.blockUI({ message: "<h1>flipping the coin...</h1>" });
        })
        .on("confirmation", confirmationNr => {
            console.log("confirmation: " + confirmationNr);
        })
        .on("receipt", receipt =>{
            console.log(receipt);
        });
    console.log(playerAddress);
    contractInstance.once("newCoinFlip", {
        filter: {player: playerAddress},
        },function(error,event){
            console.log("call Callback");
            console.log(event.returnValues.queryId);
            getFlipResult();
        });

   // getFlipResult();

}

function getFlipResult(queryId){
    console.log("call flipresult");
    //contractInstance.callCallback(queryId);
    contractInstance.once("coinFlipped", {
        filter: {player: playerAddress},
        fromBlock: 0
     },function(error,event){
            console.log("event: " + event);
            console.log("event: " + event.returnValues.won);
            getPlayerBalance();
            $.unblockUI();
        });
}


function claimPrize(){
    console.log("claim button clicked");
    contractInstance.methods.payoutPrize().send()
        .on("transactionHash", hash => {
            console.log("hash: " + hash);
        })
        .on("confirmation", confirmationNr => {
            console.log("confirmation: " + confirmationNr);
        })
        .on("receipt", receipt =>{
            console.log("receip: " + receipt);
            getPlayerBalance();
        });
}

function getPlayerBalance(){
    web3.eth.getBalance(playerAddress).then(function(balance){
        $("#player_balance").text("you have " + web3.utils.fromWei(balance, "ether") + " ether");
    });
}

function loadPrizePool(){
    var config = {value: web3.utils.toWei("5", "ether")};
    contractInstance.methods.loadPrizePool().send(config);
    getPoolBalance();
}

function getPoolBalance(){
    web3.eth.getBalance(contractAdr).then(function(balance){
        $("#pool_balance").text("pool has " + web3.utils.fromWei(balance, "ether") + " ether");
    })
}