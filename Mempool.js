const bitcoinMessage = require('bitcoinjs-message'); 


const TimeoutRequestsWindowTime = 5*60*1000;
const TimeoutMempoolValidWindowTime = 30*60*1000;

class Mempool {

  constructor() {
    this.mempool = [];
    this.timeoutRequests = [];
    this.mempoolValid = [];
    this.timeoutMempoolValid = [];
  }


  // method to add a new validation request or to retrieve an existing one
  addRequestValidation(walletAddress) {

    if (walletAddress in this.mempool) {
      const req = this.mempool[walletAddress];
      let timeElapse = (new Date().getTime().toString().slice(0,-3)) - req.requestTimeStamp;
      let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
      req.validationWindow = timeLeft;
      return req;
    } else {
      let timeStamp = (new Date().getTime().toString().slice(0,-3));
      const req = {
        walletAddress: walletAddress,
        requestTimeStamp: timeStamp,
        message:`${walletAddress}:${timeStamp}:starRegistry`,
        validationWindow: TimeoutRequestsWindowTime/1000
      }

      // add request to mempool
      this.mempool[walletAddress] = req;
      // set timout to remove entry from mempool
      this.timeoutRequests[req.walletAddress] = 
        setTimeout(() => this.removeRequestValidation(req.walletAddress),
                    TimeoutRequestsWindowTime)
      return req;
    }
  }

  // method to remove validationrequest on timeout
  removeRequestValidation(walletAddress) {
    //filterout existing entry with walletAddress from mempool
    this.mempool = this.mempool.filter(elem => elem.address !== walletAddress);
  }


  //method to validates request by walletAddress
  validateRequestByWallet(walletAddress, signature) {

    if (walletAddress in this.mempoolValid) {
      if (bitcoinMessage.verify(this.mempoolValid[walletAddress].status.message, walletAddress, signature)) {
        const req = this.mempoolValid[walletAddress];
        console.log(req);
        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - req.status.requestTimeStamp;
        let timeLeft = (TimeoutMempoolValidWindowTime/1000) - timeElapse;
        req.status.validationWindow = timeLeft;
        return req;
      } else {
        return {message:'Signature invlaid. Please try again.'};
      }
    }

    if (walletAddress in this.mempool) {
      if (bitcoinMessage.verify(this.mempool[walletAddress].message, walletAddress, signature)) {
        const req = {
          registerStar: true,
          status: Object.assign({}, 
                      this.mempool[walletAddress], 
                      { validationWindow: TimeoutMempoolValidWindowTime/1000,
                        messageSignature: 'valid',
                      })
          }

        clearTimeout(this.timeoutRequests[walletAddress]); //clear timout
        this.removeRequestValidation(walletAddress); // remove request from mempool
        // add request to valid request mempool
        this.mempoolValid[walletAddress] = req;
        // set timout to remove entry from valid rquest mempool
        this.timeoutMempoolValid[walletAddress] = 
          setTimeout( () => this.removeRequestByWallet(walletAddress),
                      TimeoutMempoolValidWindowTime)
        return req;
      } else {
        return {message:'Signature invlaid. Please try again.'};
      }
    } else {
      return { message: "Validation request expired or not created." };
    }
  }

  // method to remove validation request on timeout
  removeRequestByWallet(walletAddress) {
    //filterout existing entry with walletAddress from mempool
    this.mempoolValid = this.mempoolValid.filter(elem => elem.address !== walletAddress);
  }

  // verify if there is a valid request in mempoolValid
  verifyAddressRequest(walletAddress) {
    return walletAddress in this.mempoolValid;
  }

  // remove request and clear SetTimeout
  removeAddressRequest(walletAddress) {
    clearTimeout(this.timeoutMempoolValid[walletAddress]); //clear timout
    this.removeRequestByWallet(walletAddress); // remove request from mempool
  }

}

module.exports = Mempool;