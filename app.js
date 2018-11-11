const express = require('express');
const app = express();
const bodyParser = require('body-parser');

//import blockchain classes from simplechain.js
const BlockchainClasses = require('./simpleChain.js');
const Block = BlockchainClasses.Block;
const Blockchain = BlockchainClasses.Blockchain;

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

// Routes for our api
// ====================================================
const router = express.Router();

router.get('/', function(req, res) {
  res.json({ message: 'Welcome to blockchain api!. use post to /block to add a new block. use get to /block/:id to retrieve a block' });
});


// Register routes
// ====================================================
// first route is a post to http://localhost:8000/block
// where body contains a json object { body: "<new block message>" }
// ====================================================
router.route('/block').post(async function(req, res) {

  console.log(req.body);

  let body = req.body.body;
  // check if body contains a json object with a key "body"
  // trim the value to remove leading and trailing spaces
  if (body) {
    body = body.trim();
  }
  // check request has an empty message. If so do not create the block
  if (!body) {
    res.json({ message: "Cannot add empty block. Please provide a text in a key named 'body'" });
  } else {
    // all good. Now create a new block and persist the block in levelDB
    const block = new Block(body);
    try {
      const newBlock = await blockchain.addBlock(block);
      console.log("Added new Block:");
      console.log(newBlock);
      res.json(newBlock);
    } catch (err) {
      res.status(500).send("something broke in server");
    }
  }

});

// ====================================================
// 2nd route is a get to http://localhost:8000/block/:id
// return the block with blockheight = id
// ====================================================
router.route('/block/:blockheight').get(async function(req, res) {
  console.log("need to fetch block: " + req.params.blockheight);
  try {
    let block = await blockchain.getBlock(req.params.blockheight);
    res.json(block);
  } catch (err) {
    //console.log(err);
    if (err.notFound) {
      res.status(404).send('block: "' + req.params.blockheight + '" not found' );
    } else {
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
