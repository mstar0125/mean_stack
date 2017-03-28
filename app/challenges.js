var express = require('express')
var app = express()
var User = require('./models/user.js')
var Notification = require('./models/notification.js')
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
        if(user) {
            if(user.badgeNum===undefined)
                user.badgeNum = 0;
            console.log(user.deviceToken + "," + user.badgeNum);
            
            var new_notification = new Notification({
                user_id:   userId,
                message:   message,
                payload:   payload,
                status:    0
            });

            new_notification.save(function(err, data) {
                if (err) {
                    console.log("Creating New Notification error" + JSON.stringify(err));
                    
                } else {
                    newResult = {
                        status:"success",
                        notificationId:new_notification._id
                    };
                    console.log("Creating New Notification" + JSON.stringify(newResult));

                    if(user.deviceToken) {
                        payload["_id"] = new_notification._id;
                        pushnotification.PushServer.send('iOS', user.deviceToken, user.badgeNum+1, message, payload);
                        user.badgeNum = user.badgeNum + 1;    
                    }
                    
                    user.save();
                }
            });
        }else{

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
    Challenge.find({leagueType:req.params.leagueType, $or:[{fromID:req.params.userID}, {toID:req.params.userID}], status:1}, function(err, challenge) {
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
                challengeID:new_challenge._id
            };
            // res.json(newResult);

            var payload = {
                'type'       : 'challenge_request',
                'leagueType' : req.params.leagueType,
                'duration'   : req.params.duration,
                'leagueID'   : req.params.leagueID,
                'from'       : req.params.fromID,
                'start'      : req.params.start,
                'challenge_id': new_challenge._id,
            };
            send_push_notification(req.params.toID, "Someone challenges you!", payload);
            res.json({"status": "success"});
        }
    });

    
}

exports.acceptRequest = function(req, res) {

    Challenge.findOne({_id:req.params.challengeId}, function(err, challenge) {
        if(err)
            res.json({"status": "error while finding challenge"});

        if(challenge) {
            challenge.status = 1;
            challenge.save(function(err, data) {
                if (err) {
                    console.log("Updating Challenge error");
                    res.json({status:'error'});
                } else {
                    
                    User.findOne({_id:challenge.toID}, function(err, user) {
                        if(err)
                            res.json({"status": "error while finding user"});
                        if(user) {
                            
                            var payload = {
                                'type'     :    'challenge_accept',
                                'to'       :    challenge.toID,
                                'challenge_id': challenge._id
                            };
                            send_push_notification(challenge.fromID, user.name + " accepted your challenge!", payload);
                            
                            res.json({"status":"success"}); 
                        } else {
                            res.json({"status":"user not found"});
                        }
                    });
                }
            });
        }
    });
}

exports.declineRequest = function(req, res) {
    
    console.log("declineRequest: challengeId" + req.params.challengeId);
    Challenge.findOne({_id:req.params.challengeId}, function(err, challenge) {
        if(err)
            res.json({"status": "error while finding challenge"});

        console.log("challenge=" + JSON.stringify(challenge));
        if(challenge) {
            challenge.status = 2;
            challenge.save(function(err, data) {
                if (err) {
                    console.log("Updating Challenge error");
                    res.json({status:'error'});
                } else {
                    
                    User.findOne({_id:challenge.toID}, function(err, user) {
                        if(err)
                            res.json({"status": "error"});
                        if(user) {
                            var payload = {
                                'type'     : 'challenge_decline',
                                'to'       : challenge.toID,
                                'challenge_id': challenge._id
                            };
                            send_push_notification(challenge.fromID, user.name + " declined your challenge!", payload);
                            res.json({"status":"success"}); 
                        }else {
                            res.json({"status":"user not found"});
                        }
                    });   
                    
                }
            });
        }
    });     
}