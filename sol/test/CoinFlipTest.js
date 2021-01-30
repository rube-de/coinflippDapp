const coinFlip = artifacts.require("CoinFlip");
const truffleAssert = require("truffle-assertions");

contract("CoinFlip", async function(accounts){
    let instance;
    beforeEach(async function(){
        instance = await coinFlip.deployed();
    });
    it("contract is correct initialized", async function (){
        let contractBalance = parseFloat(await instance.balance());
        assert(contractBalance !== 0, "balance is 0");
    })


    it("shouldn't let non-owner allow withdraw balance", async function(){
        await truffleAssert.fails(instance.withdrawAll({from: accounts[1]}),truffleAssert.ErrorType.REVERT);
    });
    it("should let owner withdraw balance", async function(){
        let ownerOldBalance =  parseFloat(await web3.eth.getBalance(accounts[0]));
        await truffleAssert.passes(instance.withdrawAll({from: accounts[0]}));
        let ownerNewBalance =  parseFloat(await web3.eth.getBalance(accounts[0]));
        assert(ownerNewBalance > ownerOldBalance, "balance didn't increase")
    });
    it("should reset balance to 0 after withdrawal", async function(){
        await instance.loadPrizePool({value: web3.utils.toWei("1", "ether"), from: accounts[3]});
        await instance.withdrawAll();
        let balance = parseFloat(await instance.balance());
        let networkBalance = parseFloat(await web3.eth.getBalance(instance.address));
        assert(balance == networkBalance, "network and local balance doesn't match");
        assert(balance == 0, "local balance isn't 0");
        assert(networkBalance == 0, "network balance isn't 0");

    });

});

contract("CoinFlip", async function(accounts) {
    let instance;
    it("should decrease balance when paying out prize", async function () {
        instance = await coinFlip.deployed();
        while (await instance.getPlayerBalance({from:accounts[1]}) < 1){
            await instance.doCoinFlip({value: web3.utils.toWei("1", "ether"), from: accounts[1]})
        }


        let oldBalance = parseFloat(await instance.balance());
        console.log("old balance: " + oldBalance);
        instance.payoutPrize({from: accounts[1]});
        let newBalance = parseFloat(await instance.balance());
        console.log("new balance: " + newBalance);
        let networkBalance = parseFloat(await web3.eth.getBalance(instance.address));
        console.log("network balance: " + networkBalance);
        assert(newBalance != oldBalance, "Balance didn't decreased");
        assert(newBalance == networkBalance, "local and network balance didn't update correctly");
    });
});