import Web3 from 'web3';
import express from 'express';
import { randomInt } from 'crypto';


const infuraUrl = process.env.INFURA_URL;
const web3 = new Web3(new Web3.providers.HttpProvider(infuraUrl));

const aliceAddress = process.env.ALICE_ADDRESS;
const alicePrivateKey = process.env.ALICE_PRIVATE_KEY;
const bobAddress = process.env.BOB_ADDRESS;
const bobPrivateKey = process.env.BOB_PRIVATE_KEY;

const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS;

const tokenABI = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "type": "function"
    }
];

const tokenContract = new web3.eth.Contract(tokenABI, tokenContractAddress);

const app = express();

async function transferTokens(fromAddress, toAddress, privateKey, amount) {
    const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest');
    const gasPrice = await web3.eth.getGasPrice();

    const tx = {
        from: fromAddress,
        to: tokenContractAddress,
        nonce: nonce,
        gas: 200000,
        gasPrice: gasPrice,
        data: tokenContract.methods.transfer(toAddress, amount).encodeABI()
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return receipt.status;
}

function getRandomAmount() {
    return web3.utils.toWei(String(randomInt(5, 51)), 'ether');
}

function getRandomOrder() {
    return Math.random() < 0.5;
}

async function executeRandomTransfer() {
    console.log('Executing random transfer...');
    const amount = getRandomAmount();
    const order = getRandomOrder();
    let success;

    if (order) {
        success = await transferTokens(bobAddress, aliceAddress, bobPrivateKey, amount);
        if (success) {
            success = await transferTokens(aliceAddress, bobAddress, alicePrivateKey, amount);
        }
    } else {
        success = await transferTokens(aliceAddress, bobAddress, alicePrivateKey, amount);
        if (success) {
            success = await transferTokens(bobAddress, aliceAddress, bobPrivateKey, amount);
        }
    }

    if (success) {
        console.log('Transfers completed successfully');
    } else {
        console.log('Transfer failed');
    }
}

function executeRandomTransferTimeout() {
    console.log('Executing random transfer...');

    setTimeout(async () => {
        try {
            await executeRandomTransfer();
        } catch (error) {
            console.error('Error executing random transfer:', error);
        }
        executeRandomTransferTimeout()
    }, 3000);
}

executeRandomTransferTimeout();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
