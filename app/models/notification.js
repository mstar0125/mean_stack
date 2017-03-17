var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var notificationSchema = new Schema({
  user_id:       String,
  message:     String,
  payload:      String,
  status:       { type:Number, default:0 }, //0:pending 1:finished
}, {collection: 'notification' });

module.exports = mongoose.model('Notification', notificationSchema);