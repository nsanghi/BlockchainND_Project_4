/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

/* ===== Persist data with LevelDB ===========================
|  Learn more: level: https://github.com/Level/level         |
|  =========================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);


/*======= Import Block class =================================
|  Block class                                               |
|===========================================================*/
const Block = require('./Block');

/* ===== Blockchain Class ===========================
|  Class with a constructor for new blockchain 		  |
|  ================================================*/

class Blockchain {

constructor() {
    return (async () => {
      try {
        const height = await this.getBlockHeight();
      // if no genesis block, add that
        if (height === 0) {
          await this.addGenesisBlock();
        }
      } catch(err) {
        console.log("Error in init: "+ err);
      }
      return this;
    })();
  }

  async addGenesisBlock() {
    const genesis_block = new Block("First block in the chain - Genesis block");
    genesis_block.height = 0;
    genesis_block.time = new Date().getTime().toString().slice(0,-3);
    genesis_block.hash = await SHA256(JSON.stringify(genesis_block)).toString();
    // Adding genesis block object to chain
    try {
      await db.put(genesis_block.height, JSON.stringify(genesis_block).toString());
      console.log("Genesis block added");
    } catch(err) {
      console.log("error inside addGenesisBlock:" + err);
      throw err;
    }

  }


  // Add new block
  async addBlock(newBlock) {

    // Block height
    try {
      const height = await this.getBlockHeight();
      //console.log("addBlock:Height="+height);
    // if no genesis block, first add that
    if (height === 0) {
      await this.addGenesisBlock();
      height ++;
    }
    newBlock.height = height;

    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);

    // previous block hash
    let prevBlock = await this.getBlock(newBlock.height-1);
    newBlock.previousBlockHash = prevBlock.hash;

    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = await SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
    await db.put(newBlock.height, JSON.stringify(newBlock).toString());
    return newBlock;
    } catch (err) {
      console.log("Error in AddBlock:"+err);
      throw err;
    }
  }

  // Get block height
  getBlockHeight() {
    return new Promise((resolve, reject) => {
      let i = 0;
      db.createReadStream().on('data', (data) => {
            i++;
          }).on('error', (err) => {
              reject(err);
          }).on('close', () => {
            //console.log('Block Height' + i);
            resolve(i);
          });
    });
  } 
    

  // get block
  async getBlock(blockHeight) {
    try {
      //console.log("fetching block from db with id: "+ blockHeight);
      let blockVal = await db.get(blockHeight);
      return JSON.parse(blockVal); 
    } catch(err) {
      console.log("Error in getBlock:"+err);
      throw err;
    }
  }

  // get blcok by hash
  async getBlockByHash(blockHash) {
    return new Promise((resolve, reject) => {
      let block = null;
      db.createReadStream()
      .on('data', (data) => {
          const value = JSON.parse(data.value);
          if (value.hash === blockHash) {
            block = value;
          }
      })
      .on('error', (err) => {
          reject(err);
      })
      .on('close', () => {
            resolve(block);
      });
    });
  }

  // get block(s) by address
  async getBlocksByAddress(address) {
    return new Promise((resolve, reject) => {
      let blocks = [];
      db.createReadStream()
      .on('data', (data) => {
          const value = JSON.parse(data.value);
          if (value.body.address === address) {
            blocks.push(value);
          }
      })
      .on('error', (err) => {
          reject(err);
      })
      .on('close', () => {
            resolve(blocks);
      });
    });
  }


  // put block
  async putBlock(key, block) {
    try {
      const blockValue = JSON.stringify(block).toString();
      let result = await db.put(key, blockValue);
    } catch(err) {
      console.log("Error in putBlock:"+err);
    }
  }

  // validate block
  async validateBlock(blockHeight){
    // get block object
    let block = await this.getBlock(blockHeight);
    // get block hash
    let blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
    let validBlockHash = await SHA256(JSON.stringify(block)).toString();
    // Compare
    if (blockHash===validBlockHash) {
      return true;
    } else {
      console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
      return false;
    }
  }

  // Validate blockchain
  async validateChain(){
    let errorLog = [];
    const height = await this.getBlockHeight();
    let blockHash = '';
    let previousHash = '';
    for (var i = 0; i < height; i++) {
      // validate block
      if (!await this.validateBlock(i))errorLog.push(i);

      // get block with key=i
      let block = await this.getBlock(i);
      previousHash = block.previousBlockHash;
      if (blockHash!==previousHash) {
        // compare blocks hash link
        // except for genesis block
          errorLog.push(i);
      }
      blockHash = block.hash;
    }

    if (errorLog.length>0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: '+errorLog);
    } else {
      console.log('No errors detected');
    }
  }
}

module.exports = Blockchain;