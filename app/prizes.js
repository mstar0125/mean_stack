var express = require('express')
var app = express()
var League = require('./models/league.js')
var Prize = require('./models/prize.js')
var _=require('underscore-node')


function predicateBy(prop) {
    return function(a, b) {
        if(a[prop] < b[prop])
            return 1;
        else if(a[prop] > b[prop])
            return -1;
        return 0;
    }
}

exports.updatePoolData = function(req, res) {
  console.log(JSON.stringify(req.body));

  Prize.find({}, function(err, prizes) {
    if(prizes.length == 0) {
      console.log("length=0");
      var league_pool = [];
      var temp1 = {};
      temp1.index = req.params.league_index;
      temp1.pool = req.body.league_pool;
      temp1.inc_per_ad = req.body.inc_league_per_ad;
      league_pool.push(temp1);

      var prize_pool = new Prize({
        jackpot_pool: req.body.jackpot_pool,
        inc_jack_per_ad: req.body.inc_jack_per_ad,
        league_pool: league_pool
      });
      prize_pool.save(function(err, data) {
          if (err) {
              console.log("Creating Prize Pool error");
              return;
          }else {
              var newResult = {
                  status:'success',
                  prizeID:prize_pool._id
              };
              res.json(newResult);
          }
      });
    }
    else {
      console.log(JSON.stringify(prizes[0]));
      var count = 0;
      var found = 0;
      prizes[0].jackpot_pool = req.body.jackpot_pool;
      prizes[0].inc_jack_per_ad = req.body.inc_jack_per_ad;
      console.log(prizes[0].league_pool);
      prizes[0].league_pool.forEach(function(data) {
        count++;
        if(data.index == req.params.league_index) {
          console.log("found");
          found = 1;
          data.pool = req.body.league_pool;
          data.inc_per_ad = req.body.inc_league_per_ad; 
          prizes[0].save(function(err) {
            if(!err){
              var update_result = {
                status:'update'
              }
              res.json(update_result);
            }
          });         
          
        }
        if(count==prizes[0].league_pool.length && found==0) {
          var temp = {};
          temp.index = req.params.league_index;
          temp.pool = req.body.league_pool;
          temp.inc_per_ad = req.body.inc_league_per_ad;
          prizes[0].league_pool.push(temp);
          prizes[0].save(function(err) {
            if(!err) {
              var update_result = {
                status:'update'
              }
              res.json(update_result);
            }
          });     
        }
      }); 
    }
  });
}

exports.getPrizePoolData = function(req, res) {
  
    Prize.find({}, function(err, prizes) {
      if(err)
        return;
      else {
        if(prizes.length != 0) {
            prizes[0].league_pool.sort(predicateBy("pool"));
            var result = {
              status: 'success',
              prizepool: prizes[0]
            }
            res.json(result);
        }else {
            res.json({status: 'none'});
        }
      }
    });
}

exports.getLeaguePoolData = function(req, res) {
  if(req.params.league_index != 0) {
    Prize.find({}, function(err, prizes) {
      if(err)
        return;
      else {
        if(prizes.length != 0) {
          var count = 0;
          var found = 0;
            console.log(JSON.stringify(prizes));
            prizes[0].league_pool.forEach(function(data) {
              count++;
              if(data.index==req.params.league_index) {
                found = 1;
                var result = {
                  status: 'success',
                  pool: data.pool,
                  inc_per_ad: data.inc_per_ad
                }
                res.json(result);
              }
              if(count==prizes[0].league_pool.length && found==0){
                res.json({status: 'none'});
              }
            });            
        }else {
            res.json({status: 'none'});
        }
      }
    });
  }
}