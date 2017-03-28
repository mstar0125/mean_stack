var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var challengeSchema = new Schema({
  leagueType:   Number,
  leagueID:     Number,
  fromID:       String,
  toID:         String,
  status:       { type:Number, default:0 }, //0:pending, 1: accepted, 2: declined, 3:finished
  start_week:   Number,
  duration:     Number,
  completed_week:  { type:Number, default:0},
  fromUserPercent: { type:Number, default:0},
  toUserPercent:   { type:Number, default:0}
}, {collection: 'challenges' });

module.exports = mongoose.model('Challenges', challengeSchema);