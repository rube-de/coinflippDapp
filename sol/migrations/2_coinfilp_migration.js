const CoinFlip = artifacts.require("CoinFlip");

module.exports = function (deployer, network, accounts) {
    deployer.deploy(CoinFlip).then(function (instance){
        //instance.loadPrizePool({value: web3.utils.toWei("5", "ether"), from: accounts[0]});
    });
};
