var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var expectationSchema = new Schema({
  userId: String,
  leagueId: Number,
  week_no: Number,
  home_team: [String],
  home_abbr: [String],
  away_team: [String],
  away_abbr: [String],
  expectation:[String],
  match_result: [Number],
  percent: {type: Number, default: -1},
  correctCnt: {type: Number, default: 0},
  wrongCnt: {type: Number, default: 0},
  avg: {type: Number, default:0},
  jackpot_won: {type: Number, default: 0},
  league_won: {type: Number, default: 0},
  start_date: Date,
  eligible: {type:Number, default:0},
  status: {type:String, default:'non-active'}

}, {collection: 'expectations' });

module.exports = mongoose.model('Expectation', expectationSchema);