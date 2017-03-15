var express = require('express')
var app = express()
var User = require('./models/user.js')
var Challenge = require('./models/challenge.js')
var League = require('./models/league.js')
var US_League = require('./models/US_league.js')
var pushnotification =  require('./pushnotification.js')
var _=require('underscore-node')

function send_push_notification(userId, message, payload) {
    console.log(userId);    
    User.findOne({_id:userId}, function(err,user) {
        console.log("notification_user: "+JSON.stringify(user));
        if(err)
            return;
        if(user && user.deviceToken) {
            if(user.badgeNum===undefined)
                user.badgeNum = 0;
            console.log(user.deviceToken + "," + user.badgeNum);
            pushnotification.PushServer.send('iOS', user.deviceToken, user.badgeNum+1, message, payload);
            user.badgeNum = user.badgeNum + 1;
            user.save();
        }
    });    
}

function isEmptyObject(obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}

exports.getUserChallenges = function(req, res) {
    Challenge.find({leagueType:req.params.leagueType, $or:[{fromID:req.params.userID}, {toID:req.params.userID}], status:{$ne:1}}, function(err, challenge) {
        if(err) {
            res.json({status:'error'});
            return;
        }
        res.json({status:'success', challenge:challenge});
    });
}

exports.getChallengableWeeks = function(req, res) {
    var week_found = 0;
    var start_week = 0;

    var today = new Date();
    var Leagues;
    if(req.params.leagueType==0) {
        Leagues = League;
    } else {
        Leagues = US_League;
    }
    Leagues.findOne({'index': req.params.leagueID}, function(err, league) {
        if(!err) {
            if(league) {
                for(var i=0; i<league.fixture_info.length; i++) {
                    if(league.fixture_info[i].start_date.getTime() >= today.getTime() && week_found==0) {
                        week_found = 1;
                        start_week = i;
                    }
                }
                if(week_found==0) {
                    res.json({'status':'no week to pick'});
                } else {
                    res.json({'status':'success', 'start':league.fixture_info[start_week].week_no, 'count':league.fixture_info.length-start_week});
                }

            } else {
                res.json({"status":"league not found"});
            }
        } else {
            res.json({"status":"error while finding league"});
        }
    }); 
}

exports.postRequest = function(req, res) {
    var payload = {
        'type'       : 'challenge_request',
        'leagueType' : req.params.leagueType,
        'duration'   : req.params.duration,
        'leagueID'   : req.params.leagueID,
        'from'       : req.params.fromID,
        'start'      : req.params.start
    };
    send_push_notification(req.params.toID, "Someone challenges you!", payload);
    res.json({"status": "success"});
}

exports.acceptRequest = function(req, res) {
    User.findOne({_id:req.params.toID}, function(err, user) {
        if(err)
            res.json({"status": "error while finding user"});
        if(user) {
            var payload = {
                'type'     : 'challenge_accept',
                'to'       : req.params.toID
            };
            send_push_notification(req.params.fromID, user.name + " accepted your challenge!", payload);

            var new_challenge = new Challenge({
                leagueType:   req.params.leagueType,
                leagueID:     req.params.leagueID,
                fromID:       req.params.fromID,
                toID:         req.params.toID,
                start_week:   req.params.start,
                duration:     req.params.duration
            });

            new_challenge.save(function(err, data) {
                if (err) {
                    console.log("Creating New Challenge error");
                    res.json({status:'error'});
                } else {
                    newResult = {
                        status:"success",
                        userID:new_challenge._id
                    };
                    res.json(newResult);
                }
            });
                       
        } else {
            res.json({"status":"user not found"});
        }
    });
}

exports.declineRequest = function(req, res) {
    var payload = {
        'type'     : 'challenge_decline',
        'to'       : req.params.toID
    };
    User.findOne({_id:req.params.toID}, function(err, user) {
        if(err)
            res.json({"status": "error"});
        if(user) {
            send_push_notification(req.params.fromID, user.name + " declined your challenge!", payload);
            res.json({"status": "success"});
        }
    });    
}