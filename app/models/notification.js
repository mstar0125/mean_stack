var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var notificationSchema = new Schema({
  user_id:       String,
  message:     String,
  payload:      Object,
  status:       { type:Number, default:0 }, //0:pending 1:finished
  create_date: Date,
  priority: { type:Number, default:0 }	// 0: default, 1: weekly report
}, {collection: 'notification' });

module.exports = mongoose.model('Notification', notificationSchema);