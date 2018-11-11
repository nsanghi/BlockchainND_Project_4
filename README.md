# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to install all the project dependencies.
```
npm install
```
- This project depends on following packages
    - [`crypto-js`](https://www.npmjs.com/package/crypto-js) - Code uses SHA256 hasing from this package
    - [`level db`](https://github.com/Level/levelup) - to provide a key/value persistence store

## Code Explanation
In this project a simple private blockchain is implemented with functionality to create new blocks and add them to block chain. The data is persisted in `leveldb` database. Additional functionality includes ability to validate individual blocks or the entire blockchain. 

`simpleChain.js` contains the complete code. `simpleChainOriginal.js` contains the starter code. You can use starter code to implement the following functionality. Complete Solution is contained in file `simpleChain.js`

1. Starter code right now uses an array to persist the code. Please modify the code to persist the data into an instance of levelDB database. 
2. `addBlock(newBlock)` function includes a method to store newBlock with LevelDB.
3. Genesis block persists as the first block in the blockchain using LevelDB. Additionally, when adding a new block to the chain, code checks if a Genesis block already exists. If not, one is created before adding the a block.
4. Modify the `validateBlock()` function to validate a block stored within levelDB.
5. Modify the `validateChain()` function to validate blockchain stored within levelDB.
6. Modify `getBlock()` function to retrieve a block by it's block height within the LevelDB chain.
7. Modify `getBlockHeight()` function to retrieve current block height within the LevelDB chain.

## Testing

To test code:
1: Open a command prompt or shell terminal after installing node.js.

2: Run the test cases in file `testBlockchain.js` using following command:
```
node testBlockchain.js
```

Testing sequence follows as follows:
    - create Blockchain instance
    - Insert 10 new blocks into the chain
    - print the data in entire blockchain
    - validate the chain
    - modify data(tamper) in one of the blocks
    - revalidate chain and see validation failing for modified block 
