import Web3 from 'web3';
import { assert } from 'chai';
import { describe, it } from 'mocha';

const infuraUrl = 'PUT_YOUR_CONST_INFURAURL';
const web3 = new Web3(new Web3.providers.HttpProvider(infuraUrl));

const aliseAddress = 'PUT_YOUR_ALISE_ADDRESS';
const alisePrivateKey = 'PUT_YOUR_ALISE_PRIVATE_KEY';
const bobAddress = 'PUT_YOUR_BOB_ADDRESS';
const bobPrivateKey = 'PUT_YOUR_BOB_PRIVATE_KEY';

const failAddress = 'PUT_YOUR_FAIL_ADDRESS';
const failPrivateKey = 'PUT_YOUR_FAIL_PRIVATE_KEY';


const tokenContractAddress = 'TOKEN_CONTRACT_ADDRESS';

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

describe('ERC-20 Token Transfer', function () {
  it('should transfer 5 tokens from Bob to Alice', async function () {
    const amount = web3.utils.toWei('5', 'ether');
    const nonce = await web3.eth.getTransactionCount(bobAddress, 'latest');

    const tx = {
      from: bobAddress,
      to: tokenContractAddress,
      nonce: nonce,
      gas: 2000000,
      data: tokenContract.methods.transfer(aliseAddress, amount).encodeABI()
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, bobPrivateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    assert.isTrue(receipt.status, 'Transaction failed');
  });

  it('should transfer 5 tokens from Alise to Bob', async function () {
    const amount = web3.utils.toWei('5', 'ether');
    const nonce = await web3.eth.getTransactionCount(aliseAddress, 'latest');

    const tx = {
      from: aliseAddress,
      to: tokenContractAddress,
      nonce: nonce,
      gas: 2000000,
      data: tokenContract.methods.transfer(bobAddress, amount).encodeABI()
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, alisePrivateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    assert.isTrue(receipt.status, 'Transaction failed');
  });


});
