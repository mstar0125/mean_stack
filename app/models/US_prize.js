var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var us_prizeSchema = new Schema({
	jackpot_pool:    Number,
	inc_jack_per_ad: Number,
	league_pool: [
		{
			index:    	Number,
			pool:     	Number,
			inc_per_ad: Number
		}
	]	
}, {collection: 'US_prize' });

module.exports = mongoose.model('USPrize', us_prizeSchema);