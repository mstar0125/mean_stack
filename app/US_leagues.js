var express = require('express')
var app = express()
var User = require('./models/user.js')
var League = require('./models/US_league.js')
var Expectation = require('./models/US_expectation.js')
var Prize = require('./models/US_prize.js')
var DeviceToken = require('./models/deviceToken.js')
var _=require('underscore-node')
var async = require("async")
var jsonQuery = require('json-query')
var pushnotification =  require('./pushnotification.js');
var cron = require('cron');
var Challenge = require('./models/challenge.js');
var cronJob = cron.job("0 * * * * *", function(){
    console.info('cron job started');
    var now = new Date();

    //pushnotification.PushServer.send('iOS', '837d466c970ddefc2dd6fc64aca770c169f3ad736e07551a790fe1fc5a26ec21', 1, 'test');

    League.find({}, function(err, leagues) {
        if(err) {
            console.log("error");
            return;
        }
        if(leagues) {
            leagues.forEach(function(league) {
                if(league.fixture_info && league.fixture_info.length>0) {
                    league.fixture_info.forEach(function(fixture_week) {
                        //console.log(fixture_week.start_date);
                        //console.log(new Date(fixture_week.start_date));
                        var start_date = new Date(fixture_week.start_date);
                        //console.log(start_date);
                        //console.log("start_date = " + start_date.getTime());
                        //console.log(now);
                        //console.log("now = " + now.getTime());
                        if( (start_date.getTime() - now.getTime() >= 48*60*60*1000 ) && (start_date.getTime() - now.getTime() < (48*60+1)*60*1000) ) {
                            //console.log(fixture_week.start_date);
                            //console.log(league.index + ":" + league.name);
                            var current_week = fixture_week.week_no;

                            Expectation.find().distinct("userId", {leagueId: league.index}, function(err, users) {
                                if(!err) {
                                    //console.log(users);
                                    if(users && users.length>0) {
                                        users.forEach(function(userID) {
                                            Expectation.find().distinct("week_no", {userId: userID, leagueId: league.index}, function(err, weeks) {
                                                if(!err && weeks) {
                                                    //console.log(weeks);
                                                    if( !_.contains(weeks, current_week) && (_.contains(weeks, current_week-1) || _.contains(weeks, current_week-2) || _.contains(weeks, current_week-3) || _.contains(weeks, current_week-6)) ) {
                                                        //console.log("sending 2nd push notification to " + userID);
                                                        //console.log("Fixture week"+current_week+" of "+league.name+" will be started in 48 hours.");
                                                        Prize.findOne({}, function(err, prize) {
                                                            if(!err && prize) {
                                                                prize.league_pool.forEach(function(leaguePool) {
                                                                    if(leaguePool.index==league.index) {
                                                                        //console.log("Don't forget to predict " + league.name + " this week for a chance to win $" + leaguePool.pool.toFixed(2));
                                                                        send_push_notification(userID, "Don't forget to predict " + league.name + " this week for a chance to win $" + leaguePool.pool.toFixed(2), null);
                                                                    }
                                                                });
                                                            }
                                                        });                                                        
                                                    }
                                                }
                                            });
                                        });
                                    }
                                }
                            });                          
                        }
                    });
                }
            });            
        }
    });
}); 
cronJob.start();

function predicateBy(prop) {
    return function(a, b) {
        if(a[prop] < b[prop])
            return 1;
        else if(a[prop] > b[prop])
            return -1;
        return 0;
    }
}

function isEmptyObject(obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}

exports.getPickableFixtureData = function(req, res) {

    var curr = new Date();
    var first = curr.getDate() - curr.getDay();
    var last = first + 8;

    var today = new Date();
    var lastday = new Date(curr.setDate(last));
    lastday.setHours(0,0,0);
    //console.log(lastday);
    var count = 0;
    var count1 = 0;
    var count2 = 0;
    var week_found = 0;
    var result = {};

    League.findOne({'index': req.params.leagueIndex}, function(err, league) {
        if(!err) {
            if(league) {
                if(league.fixture_info.length>=1) {
                    league.fixture_info.forEach(function(item) {
                        //console.log(JSON.stringify(item));
                        //console.log("next count");
                        count1++;
                        console.log("count="+count1);
                        console.log("start=" + item.start_date);
                        console.log("today=" + today);
                        console.log("lastday=" + lastday);
                        if(item.start_date.getTime() >= today.getTime()) {// && item.start_date.getTime() <= lastday.getTime()) {
                            week_found = 1;
                            count2++;
                            console.log("ok");
                            //console.log(req.params.userId);
                            //console.log(req.params.leagueIndex);
                            //console.log(item.week_no);
                            
                            Expectation.findOne({"week_no": item.week_no, "userId": req.params.userId, "leagueId": req.params.leagueIndex}, function(err, expectation) {
                                count2--;
                                console.log(expectation);
                                console.log("count="+count1);
                                if((!expectation || expectation.status=='non-active') && isEmptyObject(result)) {
                                    //console.log("length=0");                                
                                    result = {
                                        status: 'success',
                                        data: item
                                    };
                                    if(!expectation)
                                        result.repeat = 0;
                                    else if(expectation.status=='non-active') {
                                        result.data = expectation;
                                        result.repeat = 1;
                                    }
                                    res.json(result);
                                }                       
                                if(count2 == 0 && isEmptyObject(result)) {                        
                                    console.log("week_found=0");
                                    res.json({status:'none'});
                                }
                            });                        
                        }
                        if(count1==league.fixture_info.length && week_found==0) {
                            res.json({status:'none'});
                        }
                        
                    });      
                } else {
                    res.json({status:'none'});
                }          
            } else {
                console.log("none");                
                res.json({status:'none'});
            }
        } else {
            result = {
                status: 'error',
                data: err
            };
            res.json(result);
        }
    });
}

exports.getExpectData = function(req, res) {
    var week_no = req.params.weekNO;
    var userId  = req.params.userId;

    console.log(JSON.stringify(req.params));

    Expectation.find({"week_no": week_no, "userId": userId/*, "percent": { $gt: -1 }*/}).sort({'percent': -1}).exec(function(err, expectation) {
        console.log(expectation);
        if(!err) {
            expectation.sort(predicateBy("jackpot_won"));            
            res.json({status:'success', expect:expectation});
        }
        else {
            res.json({status:'error', expect:[]});
        }
    });        
}

exports.getUserExpectData = function(req, res) {
    var userId  = req.params.userId;

    console.log(JSON.stringify(req.params));

    Expectation.find({"userId": userId/*, "percent": { $gt: -1 }*/}).sort({'start_date': -1, 'percent': -1, 'jackpot_won': -1}).exec(function(err, expectation) {
        console.log(expectation);
        if(!err) {
            //expectation.sort(predicateBy("jackpot_won"));            
            res.json({status:'success', expect:expectation.slice(0,15)});
        }
        else {
            res.json({status:'error', expect:[]});
        }
    });        
}

exports.getExpectDataById = function(req, res) {
    Expectation.findById(req.params.id, function(err, expect) {
        if (err) return;
        if(expect)
            res.json({status:'success', data:expect});
        else res.json({status:'none'});
    });
}

exports.postExpectData = function(req, res) {

    var leagueId = req.params.leagueId;
    var userId = req.body.userId;
    var home_team = req.body.home_team;
    var home_abbr = req.body.home_abbr;
    var away_team = req.body.away_team;
    var away_abbr = req.body.away_abbr;
    var user_expectation = req.body.expectation;
    var week = req.body.week;
    var start_date = req.body.start_date;
    var eligible = req.body.eligible;


    var today = new Date();

    console.log(JSON.stringify(req.body));
    
    League.findOne({index: leagueId}, function(err, league) {
        if(!err && league) {               
            var week_index = -1;
            for(var i=0; i<league.fixture_info.length; i++)
            {
                if(league.fixture_info[i].week_no == week) {
                    if(league.fixture_info[i].start_date.getTime() < today.getTime()) {
                        console.log("expired");
                        res.json({status: 'expired'});
                    }
                    else {
                        Expectation.findOne({leagueId: leagueId, week_no: week, userId: userId}, function(err, expectation){
                            if(expectation) {
                                expectation.expectation = user_expectation;
                                expectation.match_result = [];
                                for(var i=0; i<expectation.expectation.length; i++) {
                                    expectation.match_result.push(-1);
                                }
                                expectation.eligible = eligible;
                                expectation.save(function(err, data) {
                                    if (err) {
                                        console.log("Updating Expectation error");
                                        return;
                                    } 
                                    else if(eligible == 1) {

                                        Prize.find({}, function(err, prizes) {
                                            if(!err) {
                                                var count = 0;
                                                var found = 0;
                                                prizes[0].jackpot_pool = prizes[0].jackpot_pool + prizes[0].inc_jack_per_ad;
                                                prizes[0].league_pool.forEach(function(league_pool) {
                                                    count++;
                                                    if(league_pool.index == leagueId) {
                                                        found = 1;
                                                        league_pool.pool = league_pool.pool + league_pool.inc_per_ad;
                                                        console.log(league_pool.pool);
                                                        prizes[0].save(function(err) {
                                                            if(err) {
                                                                console.log(err);
                                                                return;
                                                            }
                                                            else {
                                                                var newResult = {
                                                                    status:'success',
                                                                    pool:prizes[0]
                                                                };
                                                                res.json(newResult);
                                                            }
                                                        });
                                                    }
                                                    if(count==prizes[0].league_pool.length && found==0) {
                                                        res.json({status:'none'});
                                                    }
                                                });
                                            }
                                        });                    
                                    }
                                    else {
                                        res.json({status:'success'});
                                    }
                                })
                            }
                            else {
                                var temp = [];
                                for(var i=0; i<user_expectation.length; i++) {
                                    temp.push(-1);
                                }
                                var newExpectation = new Expectation({
                                    userId: userId,
                                    leagueId: leagueId,
                                    week_no: week,
                                    home_team: home_team,
                                    home_abbr: home_abbr,
                                    away_team: away_team,
                                    away_abbr: away_abbr,
                                    expectation: user_expectation,
                                    match_result: temp,
                                    percent: -1,
                                    start_date: start_date,
                                    eligible: eligible
                                }); 

                                newExpectation.save(function(err, data) {
                                    if (err) {
                                        console.log("Creating New Expectation error");
                                        return;
                                    }else if(eligible==1) {

                                        Prize.find({}, function(err, prizes) {
                                            if(!err) {
                                                var count = 0;
                                                var found = 0;
                                                prizes[0].jackpot_pool = prizes[0].jackpot_pool + prizes[0].inc_jack_per_ad;
                                                prizes[0].league_pool.forEach(function(league_pool) {
                                                    count++;
                                                    if(league_pool.index == leagueId) {
                                                        found = 1;
                                                        league_pool.pool = league_pool.pool + league_pool.inc_per_ad;
                                                        console.log(league_pool.pool);
                                                        prizes[0].save(function(err) {
                                                            if(err) {
                                                                console.log(err);
                                                                return;
                                                            }
                                                            else {
                                                                var newResult = {
                                                                    status:'success',
                                                                    expectationId:newExpectation._id,
                                                                    pool:prizes[0]
                                                                };
                                                                res.json(newResult);
                                                            }
                                                        });
                                                    }
                                                    if(count==prizes[0].league_pool.length && found==0) {
                                                        res.json({status:'none'});
                                                    }
                                                });
                                            }
                                        });

                                        
                                    }
                                    else {
                                        res.json({status:'success'});
                                    }
                                })
                            }

                        });
                    }
                }
            }
        }
    });  
}

exports.getLeagueDataByIndex = function(req, res) {
    console.log(req.params.index);
    League.findOne({index: req.params.index}, function(err, league) {
        if(!err) {
            if(league) {
                console.log(JSON.stringify(league));
                var result = {
                    status: 'success',
                    data: league
                };
                res.json(result);
            }
            else
                res.json({status:'none'});
        }
    });
}

// function send_push_notification(league, week) {
//     console.log(league + ":" + week);
//     message = "Fixture Week"+week+" of "+league+" updated!";
//     DeviceToken.find({}, function(err,token) {
//         if(err)
//             return;
//         if(token.length>0) {
//             for(var i=0; i<token.length; i++) {
//                 console.log(JSON.stringify(token[i]));
//                 pushnotification.PushServer.send(token[i].OS, token[i].token, token[i].badgeNum+1, message);
//                 token[i].badgeNum = token[i].badgeNum + 1;
//                 token[i].save();
//             }
//         }
//     });    
// }

function send_push_notification(userId, message, payload) {
    console.log(userId);    
    User.findOne({_id:userId}, function(err,user) {
        //console.log("notification_user: "+JSON.stringify(user));
        if(err)
            return;
        if(user && user.deviceToken) {
            if(user.badgeNum===undefined)
                user.badgeNum = 0;
            //console.log(user.deviceToken + "," + user.badgeNum);
            pushnotification.PushServer.send('iOS', user.deviceToken, user.badgeNum+1, message, payload);
            user.badgeNum = user.badgeNum + 1;
            user.save();
        }
    });    
}

exports.updateLeagueDataByIndex = function(req, res) {
    console.log("updateLeague: "+JSON.stringify(req.body));
    League.findOne({index: req.params.index}, function(err, league) {
        if(!err) {
            if(league) {
                league.index = req.params.index;
                league.name = req.body.name;
                league.team_cnt = req.body.team_cnt;
                league.team_info = req.body.team_info;
                var week_index = -1;
                for(var i=0; i<league.fixture_info.length; i++)
                {
                    if(league.fixture_info[i].week_no == req.body.fixture_week) {
                        league.fixture_info[i].start_date = new Date(req.body.fixture_start);
                        league.fixture_info[i].game_info = req.body.fixture_info;
                        week_index = i;

                        var expect_count = 0;
                        var win_expect_count = 0;
                        var win_users_list = [];
                        var totalCorrectCount = 0;
                        var totalExpectCount = 0;

                        Expectation.find({'week_no': req.body.fixture_week, 'leagueId': req.params.index}, function(err, expectations) {
                            //console.log(JSON.stringify(expectations));
                            totalExpectCount = expectations.length;
                            expectations.forEach(function(expectation) { 
                                expect_count++;
                                for(var ii=0; ii<expectation.match_result.length; ii++)
                                    expectation.match_result[ii] = -1;

                                expectation.status = 'non-active';
                                expectation.markModified('status');

                                var totalCount = 0;
                                var correctCount = 0;
                                var wrongCount = 0;
                                for(var j = 0; j < req.body.fixture_info.length; j++) {
                                    if(parseInt(req.body.fixture_info[j].result) > 0) {
                                        //console.log("result>0");
                                        if(parseInt(req.body.fixture_info[j].result) != 4) {
                                            if(expectation.status=='non-active')
                                            {
                                                expectation.status = 'active';
                                                expectation.markModified('status');
                                            }                                        
                                            if(req.body.fixture_info[j].result == expectation.expectation[totalCount]) {
                                                //console.log("same");
                                                expectation.match_result[j] = 1;
                                                correctCount++;
                                            }
                                            else {
                                                //console.log("not same");
                                                expectation.match_result[j] = 0;
                                                wrongCount++;
                                            }
                                        }
                                        totalCount++;
                                    }                                    
                                }
                                expectation.markModified('match_result');                                


                                var percent = -1;
                                if((correctCount+wrongCount) != 0) {
                                    percent = (correctCount / (correctCount+wrongCount)) * 100;

                                    if(totalCount==expectation.expectation.length)
                                    {
                                        expectation.status = 'finished';
                                        expectation.markModified('status');
                                        expectation.correctCnt = correctCount;
                                        expectation.wrongCnt = wrongCount;
                                        expectation.markModified('correctCnt');
                                        expectation.markModified('wrongCnt');
                                        totalCorrectCount += correctCount;


                                        console.log("sending 1st push notifications...");
                                        var payload = {
                                            'type' : 'updated_week',
                                            'leagueType' : 1,
                                            'id' : expectation._id
                                        };
                                        send_push_notification(expectation.userId, "Results are in for " + league.name + "! See how you did in Week " + expectation.week_no + "!", payload);
                                    }
                                }


                                
                                expectation.percent = percent;
                                expectation.markModified('percent');
                                //console.log(expectation);
                                expectation.save(function(err, data) {

                                    //console.log(data);
                                    if(expectation.status == 'finished' && expectation.eligible==1 && expectation.percent==100) {
                                        win_users_list.push(expectation.userId);
                                        console.log("adding win_user");  
                                    }                                   
                                

                                    expect_count--;
                                    if(expect_count == 0)//expectations.length)
                                    {
                                        //calculate & store average_correct_pick_count
                                        Expectation.find({'week_no':req.body.fixture_week, 'leagueId':req.params.index, 'status':'finished'}, function(err, expects) {
                                            if(expects.length>0) {
                                                for(var m=0; m<expects.length; m++)
                                                {
                                                    expects[m].avg = totalCorrectCount / totalExpectCount;
                                                    expects[m].markModified('avg');
                                                    expects[m].save();
                                                }
                                            }                                            
                                        });

                                        if(expectation.status == 'finished') {
                                            //update challenge battle result
                                            Challenge.find({'leagueType':1 , 'status':0, 'leagueID':req.params.index}, function(err, challenges) {
                                                if(!err) {
                                                    if(challenges) {
                                                        challenges.forEach(function(challenge) {
                                                            var fromUser = challenge.fromID;
                                                            var toUser = challenge.toID;
                                                            async.parallel([
                                                                function(callback) {
                                                                    Expectation.findOne({'userId':fromUser, 'leagueId':req.params.index, 'week_no':req.body.fixture_week}, function(err, expect1) {
                                                                        if(err) {
                                                                            return callback(err);
                                                                        }
                                                                        if(expect1 && expect1.status=='finished') {
                                                                            if(challenge.completed_week==0)
                                                                                challenge.fromUserPercent = expect1.percent;
                                                                            else
                                                                                challenge.fromUserPercent = (challenge.fromUserPercent + expect1.percent) / 2;
                                                                        } else if(!expect1) {
                                                                            challenge.fromUserPercent = challenge.fromUserPercent / 2;
                                                                        }
                                                                        challenge.markModified('fromUserPercent');
                                                                        challenge.save();
                                                                        callback();
                                                                    });
                                                                },
                                                                function(callback) {
                                                                    Expectation.findOne({'userId':toUser, 'leagueId':req.params.index, 'week_no':req.body.fixture_week}, function(err, expect2) {
                                                                        if(err) {
                                                                            return callback(err);
                                                                        }
                                                                        if(expect2 && expect2.status=='finished') {
                                                                            if(challenge.completed_week==0)
                                                                                challenge.toUserPercent = expect2.percent;
                                                                            else
                                                                                challenge.toUserPercent = (challenge.toUserPercent + expect2.percent) / 2;
                                                                        } else if(!expect2) {
                                                                            challenge.toUserPercent = challenge.toUserPercent / 2;
                                                                        }
                                                                        challenge.markModified('toUserPercent');
                                                                        challenge.save();
                                                                        callback();
                                                                    });
                                                                }
                                                            ], function(err) {                                                            
                                                                challenge.completed_week++;
                                                                challenge.markModified('completed_week');
                                                                challenge.save();
                                                                if(challenge.completed_week == challenge.duration) {                                                                
                                                                    //console.log("sending push notification...");
                                                                    var message1 = "";
                                                                    var message2 = "";
                                                                    var payload1 = {};
                                                                    var payload2 = {};

                                                                    if(challenge.fromUserPercent > challenge.toUserPercent) {
                                                                        //console.log("aa");
                                                                        message1 = "You won!";
                                                                        message2 = "You lost!";
                                                                        payload1 = {
                                                                            'type' : 'challenge_won',
                                                                            'other_id' : toUser
                                                                        };
                                                                        payload2 = {
                                                                            'type' : 'challenge_lost',
                                                                            'other_id' : fromUser
                                                                        };

                                                                        User.findOne({_id:challenge.fromID}, function(err, user) {
                                                                            if(!user.scalps)
                                                                                user.scalps = {};
                                                                            if(!user.scalps[challenge.toID]) {
                                                                                //console.log("aa-1: " + challenge.toID);
                                                                                //var temp = {challenge.toID:0};
                                                                                user.scalps[challenge.toID] = 1;
                                                                            }
                                                                            else {
                                                                                //console.log("aa-2");
                                                                                user.scalps[challenge.toID] = user.scalps[challenge.toID] + 1;
                                                                            }
                                                                            console.log(JSON.stringify(user.scalps));
                                                                            user.markModified("scalps");
                                                                            user.save();
                                                                        });
                                                                    } else if(challenge.fromUserPercent < challenge.toUserPercent) {
                                                                        //console.log("bb");
                                                                        message1 = "You lost!";
                                                                        message2 = "You won!";
                                                                        payload1 = {
                                                                            'type' : 'challenge_lost',
                                                                            'other_id' : toUser
                                                                        };
                                                                        payload2 = {
                                                                            'type' : 'challenge_won',
                                                                            'other_id' : fromUser
                                                                        };
                                                                        User.findOne({_id:challenge.toID}, function(err, user) {
                                                                            if(!user.scalps)
                                                                                user.scalps = {};
                                                                            if(!user.scalps[challenge.fromID]) {
                                                                                //var temp = {challenge.fromID:0};
                                                                                user.scalps[challenge.fromID] = 1;
                                                                            }
                                                                            else
                                                                                user.scalps[challenge.fromID] = user.scalps[challenge.fromID] + 1;
                                                                            user.markModified("scalps");
                                                                            user.save();
                                                                        });
                                                                    } else {
                                                                        message1 = "A match resulted in a draw!";
                                                                        message2 = "A match resulted in a draw!";
                                                                        payload1 = {
                                                                            'type' : 'challenge_draw',
                                                                            'other_id' : toUser
                                                                        };
                                                                        payload2 = {
                                                                            'type' : 'challenge_draw',
                                                                            'other_id' : fromUser
                                                                        };
                                                                    }                                          
                                                                    send_push_notification(fromUser, message1, payload1);                                                                
                                                                    send_push_notification(toUser, message2, payload2);

                                                                    challenge.status = 1;
                                                                    challenge.markModified('status');
                                                                    challenge.save();
                                                                }
                                                            });                                                        
                                                        });
                                                    }
                                                }
                                            });
                                        }

                                        console.log("league_won_users = " + win_users_list);
                                        // divide league_pool for league won users
                                        if(win_users_list.length>0){

                                            Prize.findOne({}, function(err, prize) {
                                                if(prize) {
                                                    for(var k=0; k<prize.league_pool.length; k++) {
                                                        if(prize.league_pool[k].index==req.params.index) {
                                                            var win_amount = prize.league_pool[k].pool / win_users_list.length;                                                        
                                                            console.log("win_amount="+win_amount);
                                                            //expectation.league_won = win_amount; 
                                                            //console.log(expectation.league_won);                                                           
                                                            //expectation.save(function(err, ok) {
                                                            //    if(!err)
                                                            //        console.log("OK");
                                                            //});
                                                            prize.league_pool[k].pool = 0;
                                                            prize.save();                                          
                                                        }
                                                    }
                                                    win_users_list.forEach(function(userId) {
                                                        User.findOne({_id: userId}, function(err, win_user) {
                                                            if(win_user) {
                                                                console.log("Found league_won_user");
                                                                win_user.balance = win_user.balance + win_amount;
                                                                console.log(win_user.balance);
                                                                win_user.save();
                                                            }
                                                            else {
                                                                console.log("Not found league_won_user");
                                                            }
                                                        });

                                                        Expectation.findOne({'week_no': req.body.fixture_week, 'leagueId': req.params.index, 'userId': userId}, function(err, won_expectation) {
                                                            won_expectation.league_won = win_amount;
                                                            won_expectation.save();
                                                        });
                                                    });
                                                }
                                            });

                                            Expectation.find({'week_no': req.body.fixture_week, 'leagueId': req.params.index, 'userId': { "$nin": win_users_list } , 'eligible':1, 'status':'finished'}, function(err, lost_expect) {
                                                if(lost_expect.length>0) {                                            
                                                    
                                                    for(var kk=0; kk<lost_expect.length; kk++)
                                                    {
                                                        console.log("lost expect"+kk+":" +JSON.stringify(lost_expect[kk]));
                                                        lost_expect[kk].league_won = -1;
                                                        lost_expect[kk].save();
                                                    }
                                                }
                                                
                                            });
                                        }

                                        if(expectation.status == 'finished') {
                                            var finish_cnt = 0;
                                            
                                            console.log("checking finished all league expectations");
                                            Expectation.find({'week_no':req.body.fixture_week, 'eligible':1}, function(err, week_expectations) {

                                                //console.log(week_expectations);
                                                console.log(week_expectations.length);
                                                async.each(week_expectations, function(week_expect, callback) {
                                                    if(week_expect.status=='finished') {
                                                        finish_cnt++;
                                                        callback();
                                                    }
                                                    else 
                                                        callback();
                                                }, function(err) {
                                                    if(finish_cnt == week_expectations.length) {
                                                        console.log("all leagues finished");

                                                        //console.log(jsonQuery('week_expectations[percent=100].userId', {
                                                        //  data: data
                                                        //}).value);

                                                        var jackpot_won_users_list = [];
                                                        var jackpot_users = [];                                                
                                                        async.each(week_expectations, function(week_expect, callback) {
                                                            console.log(JSON.stringify(week_expect));
                                                            if(week_expect.percent==100) {
                                                                console.log(week_expect.userId);
                                                                
                                                                console.log("search_other: week="+week_expect.week_no + " userId="+week_expect.userId+" league_id!="+week_expect.leagueId);
                                                                Expectation.findOne({'week_no': week_expect.week_no, 'userId': week_expect.userId, 'percent':100, 'eligible':1, 'status':'finished', 'leagueId':{'$ne':week_expect.leagueId}}, function(err, other) {
                                                                    if(other) {
                                                                        if(jackpot_users.indexOf(week_expect.userId)==-1) {
                                                                            console.log("other_league");
                                                                            console.log(JSON.stringify(other));
                                                                            var temp = {};
                                                                            jackpot_users.push(week_expect.userId);
                                                                            temp.userId = week_expect.userId;
                                                                            temp.thisLeagueId = week_expect.leagueId;
                                                                            temp.otherLeagueId = other.leagueId;
                                                                            jackpot_won_users_list.push(temp);
                                                                            callback();
                                                                        }
                                                                        else 
                                                                            callback();
                                                                    }
                                                                    else
                                                                        callback();
                                                                });                                                                    
                                                                
                                                            }
                                                            else
                                                                callback();
                                                        }, function(err) {
                                                            console.log("jackpot_won_users = " + JSON.stringify(jackpot_won_users_list));
                                                            // divide jackpot_pool for jackpot won users
                                                            if(jackpot_won_users_list.length>0){
                                                                Prize.findOne({}, function(err, prize) {
                                                                    if(prize) {                                                    
                                                                        var jackpot_won_amount = prize.jackpot_pool / jackpot_won_users_list.length;                                                        
                                                                        console.log("jackpot_won_amount="+jackpot_won_amount);
                                                                        //expectation.jackpot_won = jackpot_won_amount;
                                                                        //expectation.save();
                                                                        prize.jackpot_pool = 0;
                                                                        prize.save();

                                                                        jackpot_won_users_list.forEach(function(jackpot_user) {
                                                                            User.findOne({_id: jackpot_user.userId}, function(err, jackpot_won_user) {
                                                                                if(jackpot_won_user) {
                                                                                    console.log("Found jackpot_won_user");
                                                                                    jackpot_won_user.balance = jackpot_won_user.balance + jackpot_won_amount;
                                                                                    console.log(jackpot_won_user.balance);
                                                                                    jackpot_won_user.save();
                                                                                }
                                                                                else {
                                                                                    console.log("Not found jackpot_won_user");
                                                                                }
                                                                            });
                                                                            Expectation.findOne({'week_no': req.body.fixture_week, 'userId': jackpot_user.userId, 'percent':100, 'leagueId':jackpot_user.thisLeagueId}, function(err, thisLeague) {
                                                                                if(thisLeague) {
                                                                                    thisLeague.jackpot_won = jackpot_won_amount;
                                                                                    thisLeague.save();  
                                                                                }                                                          
                                                                            });
                                                                            Expectation.findOne({'week_no': req.body.fixture_week, 'userId': jackpot_user.userId, 'percent':100, 'leagueId':jackpot_user.otherLeagueId}, function(err, otherLeague) {
                                                                                if(otherLeague) {
                                                                                    otherLeague.jackpot_won = jackpot_won_amount;
                                                                                    otherLeague.save();                                                            
                                                                                }
                                                                            });
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });                                            
                                            });
                                        }
                                    }
                                });

                            });
                            
                        });
                    }
                }
                console.log(week_index);
                if(week_index == -1) {
                    console.log("week_index = -1");
                    console.log(JSON.stringify(req.body));
                    var temp = {};
                    temp.week_no = req.body.fixture_week;
                    temp.start_date = new Date(req.body.fixture_start);
                    temp.game_info = req.body.fixture_info;
                    league.fixture_info.push(temp);
                }
                league.save();
                res.json({"status": 'success'});
            }
            else {
                var temp = {};
                temp.index = req.params.index;
                temp.name = req.body.name;
                temp.team_cnt = req.body.team_cnt;
                temp.team_info = req.body.team_info;

                temp.fixture_info = [];
                var temp1 = {};
                    temp1.week_no = req.body.fixture_week;
                    temp1.start_date = new Date(req.body.fixture_start);                    
                    temp1.game_info = req.body.fixture_info;
                temp.fixture_info.push(temp1);
                League.create(temp);

                res.json({"status": 'success'});
            }
        }
    });
}