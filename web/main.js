var web3 = new Web3(Web3.givenProvider);
var contractInstance;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
        contractInstance = new web3.eth.Contract(abi, "0xf80e28c32557f0b132F0eE624E9BED317A5B5e3a", {from: accounts[0]});
        console.log(contractInstance);
    });
    $("#flip_coin_button").click(inputData);
    $("#claim_button").click(claimPrize);
    $("#get_result_button").click(fetchAndDisplayResult);
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
        });
}

function fetchAndDisplayResult(){
    console.log("check result button clicked");
    contractInstance.methods.getFlipResult().call().then(function (res) {
        console.log("result: " + res);
        if(res){
            $("#result_output").text("you have won");
        }else {
            $("#result_output").text("you have lost");
        }
        
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
        });
}
