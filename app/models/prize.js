var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var prizeSchema = new Schema({
	jackpot_pool:    Number,
	inc_jack_per_ad: Number,
	league_pool: [
		{
			index:    	Number,
			pool:     	Number,
			inc_per_ad: Number
		}
	]	
}, {collection: 'prize' });

module.exports = mongoose.model('Prize', prizeSchema);