var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var userSchema = new Schema({
  name:       String,
  fbID:       String,
  fbEmail:    String, 
  fbFriends:  [String],
  country:    { type:String, default: '' },
  city:       { type:String, default: '' },
  balance:    { type:Number, default:0 },
  deviceToken: { type:String, default:'' },
  badgeNum:   { type:Number, default:0 },
  score:      { type:Number, default:2000},
  scalps:     {
                //{
                //  userID: String
                //}
              }
}, {collection: 'users' });

module.exports = mongoose.model('Users', userSchema);