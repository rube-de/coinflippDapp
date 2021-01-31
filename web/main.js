var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var playerAddress;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
        contractInstance = new web3.eth.Contract(abi, "0xc112aC742A063Cc142a8681D46e72a536B552204", {from: accounts[0]});
        console.log(contractInstance);
        playerAddress = accounts[0];
        getPlayerBalance();

        contractInstance.events.wonFlip((err, ev) => {
            $("#result_event").text("you have won");
        });
        contractInstance.events.lostFlip((err, ev) => {
            $("#result_event").text("you have lost, try again");
        });
    });
    $("#flip_coin_button").click(inputData);
    $("#claim_button").click(claimPrize);
});

function inputData(){
    var bettingAmount = $("#betting_input").val();
    console.log("flip button with " + bettingAmount + " ether");

    var config = {
        value: web3.utils.toWei(bettingAmount, "ether")
    }

    contractInstance.methods.doCoinFlip().send(config)
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
