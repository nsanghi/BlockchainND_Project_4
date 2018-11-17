const express = require('express');
const app = express();
const bodyParser = require('body-parser');

//import blockchain classes from simplechain.js
const Block = require('./Block');
const Blockchain = require('./Blockchain');

// import Mempool class
const Mempool = require('./Mempool');

//import hex2ascii module
const hex2ascii = require('hex2ascii');

// configure app to use bodyParser()
// this will allow us to get data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// set port
const port = 8000;


// variable holding blockchain instance
// will be initialised in a async function at the time of 
// starting the server at the end of this file
let blockchain = null;

// variable holding mempool
let mempool = new Mempool();

// Routes for our api
// ====================================================
const router = express.Router();

router.get('/', function(req, res) {
  res.json({ message: 'Welcome to blockchain api!.' });
});


// ==============================================================
// 1st route is a post to http://localhost:8000/requestValidation
// This endpoint validates the request
// ==============================================================

router.route('/requestValidation').post((req, res) => {
  const walletAddress = req.body.address;

  // send 400 if body does not contain wallet address
  if (!walletAddress) {
    res.status(400).send("Request body does not contain wallet address i.e. a field named 'address'.");
  } 

  res.json(mempool.addRequestValidation(walletAddress));
});

// ==============================================================
// 2nd route is a post to http://localhost:8000/message-signature/validate
// This endpoint validates the signed request
// ==============================================================
router.route('/message-signature/validate').post((req, res) => {
  const walletAddress = req.body.address;
  const signature = req.body.signature;
  if (!walletAddress || !signature) {
    res.status(400).send("Request body requires a walletAddress and signagture.");
  }
  res.json(mempool.validateRequestByWallet(walletAddress, signature));
});


// ==============================================================
// 3rd route is a post to http://localhost:8000/block
// This endpoint registers a star request 
// and returns the added block in blockchain
// ==============================================================
router.route('/block').post(async (req, res) => {
  const walletAddress = req.body.address;
  const star = req.body.star;
  if (!walletAddress || !star) {
    res.status(400).send("Request body requires a walletAddress and a star to be registered.");
  }

  // check if there is a verified request in mempool
  if (!mempool.verifyAddressRequest(walletAddress)) {
    res.json({ message: "No verified request found" });
  } else {
    // add new block to chain
    const storyDecoded = star.story;
    const storyEncoded = Buffer(storyDecoded).toString('hex');
    const blockBody = {walletAddress,
                       star}
    blockBody.star.story = storyEncoded;
    console.log('blockBody:'+ blockBody);
    const block = new Block(blockBody);
    try {
      const newBlock = await blockchain.addBlock(block);
      newBlock.body.star.storyDecoded = hex2ascii(newBlock.body.star.story);
      // remove the valid request from mempool
      mempool.removeAddressRequest(walletAddress);
      console.log("Added new Block:");
      console.log(newBlock);
      res.json(newBlock);
    } catch (err) {
      console.log("Error in post block:" + err);
      res.status(500).send("something broke in server");
    }
  }
});


// ==============================================================
// 4th route is a post to http://localhost:8000/block/hash:<hashvalue>
// This endpoint returns a block with matching hashvalue 
// ==============================================================
router.route('/block/hash::hash').get(async function(req, res) {
  console.log("need to fetch block with hash: " + req.params.hash);
  try {
    let block = await blockchain.getBlockByHash(req.params.hash);
    if (block) {
      block.body.star.storyDecoded = hex2ascii(block.body.star.story);
      res.json(block);
    } else {
      res.json({ message: 'block not found.'})
    }
  } catch (err) {
    //console.log(err);
    if (err.notFound) {
      res.status(404).send('block hash: "' + req.params.hash + '" not found' );
    } else {
      console.log("Error in getBlockByHash: "+ err);
      res.status(500).send("something broke in server");
    }
  }
});

// ====================================================
// 5th route is a get to http://localhost:8000/block/address:<address>
// return all the blocks with given walletAddress
// ====================================================
router.route('/block/address::address').get(async function(req, res) {
  console.log("need to fetch blocks with address: " + req.params.address);
  try {
    let blocks = await blockchain.getBlocksByAddress(req.params.address);
    if (blocks) {
      blocks.forEach(elem => {
        elem.body.star.decodedStory = hex2ascii(elem.body.star.story); 
      });
      res.json(blocks);
    } else {
      res.json({ message: 'blocks not found.'})
    }
  } catch (err) {
    //console.log(err);
    if (err.notFound) {
      res.status(404).send('block hash: "' + req.params.hash + '" not found' );
    } else {
      console.log("Error in getBlockByHash: "+ err);
      res.status(500).send("something broke in server");
    }
  }
});


// ====================================================
// 6th route is a get to http://localhost:8000/block/:id
// return the block with blockheight = id
// ====================================================
router.route('/block/:blockheight').get(async function(req, res) {
  console.log("need to fetch block: " + req.params.blockheight);
  try {
    let block = await blockchain.getBlock(req.params.blockheight);
    block.body.star.storyDecoded = hex2ascii(block.body.star.story);
    res.json(block);
  } catch (err) {
    //console.log(err);
    if (err.notFound) {
      res.status(404).send('block: "' + req.params.blockheight + '" not found' );
    } else {
      console.log("Error in getBlock: "+ err);
      res.status(500).send("something broke in server");
    }
  }
});

// configure api end point to base URL
app.use('/', router);


// Start Server
// ====================================================
(async () => {
  //start blockchain instance
  blockchain = await new Blockchain();
  // start api server and listen to requests at port=8000
  app.listen(port);
  console.log('Blockchain api server running at post ' + port);
})();
