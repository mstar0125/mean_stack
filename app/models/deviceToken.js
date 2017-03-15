var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var tokenSchema = new Schema({
	OS: String,
	token: String,	
	badgeNum: Number
}, {collection: 'deviceToken' });

module.exports = mongoose.model('DeviceToken', tokenSchema);