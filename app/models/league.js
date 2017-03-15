var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var leagueSchema = new Schema({
  index: Number,
  name: String,
  icon: String,
  team_cnt: Number,
  team_info: 
  [
  	{
  		name: String,
      abbr: String,
  		jersey: {type:String, default:''},
      jersey_name: {type:String, default:''}
  	}
  ],
  fixture_info:
  [
  	{
  		week_no: Number,
  		start_date: Date,
      game_info:
      [
  		  {
          home_team: String,
          home_abbr: String,
          home_jersey: {type:String, default:''},
  		    away_team: String,
          away_abbr: String,
          away_jersey: {type:String, default:''},
  		    result: String
        }
      ]
  	}
  ]

}, {collection: 'leagues' });

module.exports = mongoose.model('Leagues', leagueSchema);