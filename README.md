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
    - [`express`](https://expressjs.com/) - to provide middleware for writing api server


## Running the code
- run api server with:
```
node app.js
```
This will start an api server at http://localhost/8000

The server right now supports two api endpoints as explained below.

### Endpoint documentation

#### 1. GET BLOCK
End point is to retrive a block from blockchain with the `blockheight` provided in GET url.

##### URL
```
http://localhost:8000/block/[blockheight]
```

##### Example URL Path
```
http://localhost:8000/block/0
```
This will return block at height `0`

##### RESPONSE
Returns the block as a json object at `blockheight`. In case block is not found, a "not found" message is returned.

##### Example Response
For URL, http://localhost:8000/block/0

```
{
    "hash": "36d974c09b8f0da0ef8aad3d314ed4022641fd46b983f6873e5a7b4c697d661a",
    "height": 0,
    "body": "First block in the chain - Genesis block",
    "time": "1541948707",
    "previousBlockHash": ""
}
```

#### 2. POST BLOCK
End point to add a new block to blockchain with the text provided in body of POST request.

##### URL - Post 
```
Post to http://localhost:8000/block

with request body containing the message to be added to the new block

```

##### Example URL Path
```
POST request to http://localhost:8000/block

with request payload containing..

{
    'body': "Add a new block to the chain"
}

```
A new block will be added and this newly added block returned as a JSON

##### RESPONSE
Returns the newly added block as a json object. In case the request payload does not have a block with key "body" or has an empty value in the key "body", no new block is created and response contains the error message. 

##### Example Response
For URL, post to http://localhost:8000/block

with request containg the payload
```
{
    "body": "First real block",
}
```

A new block is added to blockchain and returned in response body:

```
{
    "hash": "98b067d1bc81cb2d546c45984c3ffb86fcd43c367af980d517e3319ed7fa81f6",
    "height": 1,
    "body": "First real block",
    "time": "1541948760",
    "previousBlockHash": "36d974c09b8f0da0ef8aad3d314ed4022641fd46b983f6873e5a7b4c697d661a"
}
```


## Code Explanation
In this project a simple private blockchain is implemented with functionality to create new blocks and add them to block chain. The data is persisted in `leveldb` database. Additional functionality includes ability to validate individual blocks or the entire blockchain. 

-`simpleChain.js` contains the complete code. For more details on this please refer to [Project 2](https://github.com/nsanghi/BlockchainND_Project_2) 

-`app.js` server to provide api endpoints to the blockchain.


## Testing

To test code:
1: Open a command prompt or shell terminal after installing node.js.

2: Run test cases in file `testBlockchain.js` using following command:
```
node testBlockchain.js
```
This will check impelmentation of blockchain code in `simplechain.js`. 

Testing sequence is:
- create Blockchain instance
- Insert 10 new blocks into the chain
- print the data in entire blockchain
- validate the chain
- modify data(tamper) in one of the blocks
- revalidate chain and see validation failing for modified block 
