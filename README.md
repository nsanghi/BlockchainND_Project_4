# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to install all the project dependencies.

```javascript
npm install
```

- This project depends on following packages

    - [`crypto-js`](https://www.npmjs.com/package/crypto-js) - Code uses SHA256 hashing from this package
    - [`level db`](https://github.com/Level/levelup) - to provide a key/value persistence store
    - [`express`](https://expressjs.com/) - to provide middleware for writing api server
    - [`bitcoinjs-lib`](https://www.npmjs.com/package/bitcoinjs-lib) - A javascript Bitcoin library for node.js and browsers.
    - [`bitcoinjs-message`](https://www.npmjs.com/package/bitcoinjs-message) - A javascript library to sing/verify message signatures using `bitcoinjs-lib`
    - [`hex2ascii`](https://www.npmjs.com/package/hex2ascii) - Convert hex to ascii in JavaScript. 

## Running the code

- run api server with:

```javascript
node app.js
```

This will start an api server at http://localhost/8000

The server right now supports six api endpoints as explained below.

### Endpoint documentation

#### 1. POST VALIDATION REQUEST

End point is to generate a request for validation with payload containing a walletAddress.

##### URL

"post" to

```javascript
http://localhost:8000/requestValidation
```

with request body containing 

```javascript
{
    "address":"12m14JXqX6DbwwFoScrUyaSPhPTbheuGfT"
}
```

##### RESPONSE

Registers a request in mempool and returns the request Object

```javascript
{
    "walletAddress": "12m14JXqX6DbwwFoScrUyaSPhPTbheuGfT",
    "requestTimeStamp": "1542453128",
    "message": "12m14JXqX6DbwwFoScrUyaSPhPTbheuGfT:1542453128:starRegistry",
    "validationWindow": 300
}
```

`validationWindow` is the time in seconds this request will be valid and stay in mempool.

#### 2. POST VERIFY VALIDATION REQUEST

End point is to verify a request for validation with payload containing a walletAddress and message signature.

You can use the `message` returned by above request and sign it with the `walletAddress` using [`Electrum`](https://electrum.org/#home). 

##### URL

"post" to

```javascript
http://localhost:8000/message-signature/validate
```

with request body containing 

```javascript
{
    "address": "12m14JXqX6DbwwFoScrUyaSPhPTbheuGfT",
    "signature": "HztubDBR2CzMneybxoBXcukJhTNmQMMzX46qtnVE6IwqKLbAtuWSxEhingrfi+nx8/wrQC3YzKNbqY0E8GqjMzk="
}
```

##### RESPONSE

Validates a request registered in mempool and returns the valid request Object

```javascript
{
    "registerStar": true,
    "status": {
        "walletAddress": "12m14JXqX6DbwwFoScrUyaSPhPTbheuGfT",
        "requestTimeStamp": "1542453128",
        "message": "12m14JXqX6DbwwFoScrUyaSPhPTbheuGfT:1542453128:starRegistry",
        "validationWindow": 1800,
        "messageSignature": "valid"
    }
}
```

#### 3. POST STAR DATA

End point is to register a star data in blockchain for a valid request.

##### URL

"post" to

```javascript
http://localhost:8000/block
```

with request body containing address and star data.

```javascript
{
    "address": "12m14JXqX6DbwwFoScrUyaSPhPTbheuGfT",
    "star": {
        "dec": "68° 52' 53.9",
        "ra": "16h 29m 1.0s",
        "story": "Found star using telescope"
    }
}
```

##### RESPONSE

Registers a star against the address in blockchain. Returns the newly added block.

```javascript
{
    "hash": "0ffb3bdeaf779fb297d357b1e3b79e1f7f15337e3ca91aa715b3279cdf3f4df6",
    "height": 2,
    "body": {
        "walletAddress": "12m14JXqX6DbwwFoScrUyaSPhPTbheuGfT",
        "star": {
            "dec": "68° 52' 53.9",
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672074656c6573636f7065",
            "storyDecoded": "Found star using telescope"
        }
    },
    "time": "1542453200",
    "previousBlockHash": "422e46d1b86fa534d5054496a5efc8d9152eebc0d38a74db52845faf9f30561c"
}
```

#### 4. GET BLOCK BY HASH

End point is to retrieve a block by hash value.

##### URL
"get" to

```javascript
http://localhost:8000/block/hash:<hasvalue>
```

e.g.

```javascript
http://localhost:8000/block/hash:422e46d1b86fa534d5054496a5efc8d9152eebc0d38a74db52845faf9f30561c
```

##### RESPONSE

Returns a block from blockchain matching the hash value.

```javascript
{
    "hash": "422e46d1b86fa534d5054496a5efc8d9152eebc0d38a74db52845faf9f30561c",
    "height": 1,
    "body": {
        "walletAddress": "12m14JXqX6DbwwFoScrUyaSPhPTbheuGfT",
        "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1542449148",
    "previousBlockHash": "18053a73a6597e7a73e50dc47829ad0351bce84748956f2bb61840c9edd22fb9"
}
```

#### 5. GET BLOCK BY BLOCK HEIGHT

End point is to retrieve a block by blockheight.

##### URL

"get" to

```javascript
http://localhost:8000/block/<blockheight>
```

e.g.

```javascript
http://localhost:8000/block/1
```

##### RESPONSE

Returns a block from blockchain matching blockheight.

```javascript
{
    "hash": "422e46d1b86fa534d5054496a5efc8d9152eebc0d38a74db52845faf9f30561c",
    "height": 1,
    "body": {
        "walletAddress": "12m14JXqX6DbwwFoScrUyaSPhPTbheuGfT",
        "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1542449148",
    "previousBlockHash": "18053a73a6597e7a73e50dc47829ad0351bce84748956f2bb61840c9edd22fb9"
}
```

#### 6. GET BLOCK(S) BY WALLET ADDRESS

End point is to retrieve block(s) by wallet address.

##### URL

"get" to

```javascript
http://localhost:8000/block/address:<address>
```

e.g.

```javascript
http://localhost:8000/block/address:12m14JXqX6DbwwFoScrUyaSPhPTbheuGfT
```

##### RESPONSE

Returns block(s) from blockchain matching wallet address.

```javascript
[
    {
        "hash": "422e46d1b86fa534d5054496a5efc8d9152eebc0d38a74db52845faf9f30561c",
        "height": 1,
        "body": {
            "walletAddress": "12m14JXqX6DbwwFoScrUyaSPhPTbheuGfT",
            "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "decodedStory": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1542449148",
        "previousBlockHash": "18053a73a6597e7a73e50dc47829ad0351bce84748956f2bb61840c9edd22fb9"
    },
    {
        "hash": "0ffb3bdeaf779fb297d357b1e3b79e1f7f15337e3ca91aa715b3279cdf3f4df6",
        "height": 2,
        "body": {
            "walletAddress": "12m14JXqX6DbwwFoScrUyaSPhPTbheuGfT",
            "star": {
                "dec": "68° 52' 53.9",
                "ra": "16h 29m 1.0s",
                "story": "466f756e642073746172207573696e672074656c6573636f7065",
                "decodedStory": "Found star using telescope"
            }
        },
        "time": "1542453200",
        "previousBlockHash": "422e46d1b86fa534d5054496a5efc8d9152eebc0d38a74db52845faf9f30561c"
    }
]
```

## Code Explanation

In this project a simple private blockchain is implemented with functionality to create new blocks and add them to block chain. The data is persisted in `leveldb` database. Additional functionality includes ability to validate individual blocks or the entire blockchain. 

- `Block.js` and `Blockchain.js` contain implementation of blockchain.
- `Mempool.js` contains implementation of a simple mempool to register and validate requests, holding these in memory till timeouts.
- `app.js` contains the code for `api` server. The end points are explained above.
- `testBlockchain.js` contains some basic test cases to test bloclchain code as explained below.

## Testing

To test code:

1: Open a command prompt or shell terminal after installing node.js.

2: Run test cases in file `testBlockchain.js` using following command:

```javascript
node testBlockchain.js
```

This will check implementation of blockchain code in `Blockchain.js`. 

Testing sequence is:

- create Blockchain instance
- Insert 10 new blocks into the chain
- print the data in entire blockchain
- validate the chain
- modify data(tamper) in one of the blocks
- revalidate chain and see validation failing for modified block 
