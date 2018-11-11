const BlockchainClasses = require('./simpleChain.js');

const Block = BlockchainClasses.Block;
const Blockchain = BlockchainClasses.Blockchain;


//add "i" blocks to chain
async function createChain(chain, n) {
  let newBlock = new Block("Test Block - " + (n + 1));
  await chain.addBlock(newBlock);
  if (n < 10) {
    await createChain(chain, n+1);
  }
}


//print chain
async function printChain(chain, n) {
  let val = await chain.getBlock(n);
  console.log(val);
  if (n < 10) {
    await printChain(chain, n+1);
  }
}

async function modifyBlock(chain) {
  const key = 1;
  let block = await chain.getBlock(key);
  block.body = "Modified Data";
  await chain.putBlock(key, block);
}
/*=====  Testing the functionality =========================|
| add 10 new blcoks to chain                                |
| print the chain value                                     |
| validate chain                                            |
| modify data in block 1                                    |
| revalidate chain                                          |
|+=====  Testing the functionality ========================*/


setTimeout(async () => {
  //init block chain with genesis block
  let blockchain = await new Blockchain();
  await createChain(blockchain, 0);
  console.log('');
  console.log('Block chain created');
  console.log('');
  console.log('Printing block chain data...');
  await printChain(blockchain, 0);
  console.log('');
  console.log('Validating blockchain....');
  await blockchain.validateChain();
  console.log('');
  console.log('Modifying data in block 1...');
  console.log('data before modification...');
  console.log(await blockchain.getBlock(1));
  console.log('');
  await modifyBlock(blockchain);
  console.log("data after modification...");
  console.log(await blockchain.getBlock(1));
  console.log('');
  console.log('Validating blockchain after modification...')
  await blockchain.validateChain();
  console.log('');
  console.log('Creating a new instance of blcokchain...')
  let blockchain_2 = await new Blockchain();
  console.log('Printing block chain - only one Gneesis block is created')
  await printChain(blockchain_2, 0);
}, 1000);
