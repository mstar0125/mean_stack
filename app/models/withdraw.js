var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var withdrawSchema = new Schema({
  userID: String,
  name: String,
  picture: String,
  detail:{
    birthday: String,
    address: String,
    city: String,
    country: String,
    postalcode: String,
    phone: String,
    email: String
  },
  status:{type:Number, default:0}, //0: pending, 1: verify, 2: resubmit, 3:denny
  withdraw_requests: [{
    withdraw_amount: Number,
    withdraw_date: String,
    balance: Number,
    total_won: Number,
    withdraw_process: {type: Boolean, default:false}
  }]  
}, {collection: 'withdraws' });

module.exports = mongoose.model('Withdraw', withdrawSchema);