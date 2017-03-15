var express = require('express')
var app = express()
var User = require('./models/user.js')
var Expectation = require('./models/US_expectation.js')
var League = require('./models/US_league.js')
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

exports.getRankingByCityByLeagueList = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};
    User.find({'_id': req.params.userId}, function(err, user) {

        if(user[0]) {
            User.find({'city': user[0].city}, function(err, users){
                if (err) return;
                users.forEach(function(user) {
                    callbackCount++;                    
                    Expectation.find({leagueId: {$in: req.query.leagueList}, userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){

                        if(expectations.length > 0) {
                            var sum1 = 0;
                            var sum2 = 0;
                            var totalsum1 = 0;
                            var totalsum2 = 0;
                            var count1 = 0;
                            var count2 = 0;
                            var lastExpect = null;
                            var lastlastExpect = null;

                            var sumdiscount = 0;
                            var currentleague = -1;
                            for(var i = 0; i < expectations.length; i++) {
                                var innerCount = 0;
                                if(expectations[i].percent != -1) {
                                    for(var j = 0; j < expectations[i].expectation.length; j++) {
                                        if(expectations[i].expectation[j] != 0) {
                                            innerCount++;
                                        }
                                    }
                                    totalsum1 += innerCount;
                                    count1++;

                                    if(lastExpect != null)
                                        lastlastExpect = lastExpect;
                                    lastExpect = expectations[i];

                                    if(currentleague != expectations[i].leagueId) {
                                        currentleague = expectations[i].leagueId;
                                    } else {
                                        var diff = 0;//Math.floor((lastExpect.start_date.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                        if(diff > 0) {
                                            sumdiscount += diff * 1.5;
                                        }
                                    }

                                    sum1 += expectations[i].percent * innerCount;
                                    if(i < expectations.length - 1) {
                                        totalsum2 += innerCount;
                                        sum2 += expectations[i].percent * innerCount;
                                        count2++;
                                    }

                                }
                            }

                            var average1 = -1;
                            var average2 = -1;
                            if(totalsum1 > 0)
                                average1 = sum1 / totalsum1;

                            if(totalsum2 > 0)
                                average2 = sum2 / totalsum2;

                            var today = new Date();

                            if(lastExpect != null) {
                                var difference1 = 0;//Math.floor((today.getTime() - lastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                if(difference1 > 0) {
                                    average1 -= difference1 * 1.5;
                                    average1 -= sumdiscount;
                                    if(average1 < 0)
                                        average1 = 0;
                                }
                            }

                            if(lastlastExpect != null) {
                                var difference2 = 0;//Math.floor((today.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                if(difference2 > 0) {
                                    average2 -= difference2 * 1.5;
                                    average2 -= sumdiscount;
                                    if(average2 < 0)
                                        average2 = 0;
                                }
                            }

                            var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                            if(user._id == req.params.userId)
                                currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                            if(average1 != -1)
                                resultUserList.push(newUserObject);
                        }
                        callbackCount--;
                        if(callbackCount == 0) {
                            resultUserList.sort(predicateBy("current"));
                            for(var i = 0; i < resultUserList.length; i++) {
                                if(resultUserList[i]._id == req.params.userId) {
                                    currentUser.ranking = i + 1;
                                    break;
                                }
                            }
                            resultUserList = resultUserList.slice(0, 10);
                            resultUserList.push(currentUser);
                            res.json(resultUserList);
                        }
                    });
                });
            });
        }
    });
}

exports.getRankingByCityWithoutLeague = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};
    User.find({'_id': req.params.userId}, function(err, user) {

        if(user[0]) {
            User.find({'city': user[0].city}, function(err, users){
                if (err) return;
                users.forEach(function(user) {
                    callbackCount++;                    
                    Expectation.find({userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){

                        if(expectations.length > 0) {
                            var sum1 = 0;
                            var sum2 = 0;
                            var totalsum1 = 0;
                            var totalsum2 = 0;
                            var count1 = 0;
                            var count2 = 0;
                            var lastExpect = null;
                            var lastlastExpect = null;

                            var sumdiscount = 0;
                            var currentleague = -1;
                            for(var i = 0; i < expectations.length; i++) {
                                var innerCount = 0;
                                if(expectations[i].percent != -1) {
                                    for(var j = 0; j < expectations[i].expectation.length; j++) {
                                        if(expectations[i].expectation[j] != 0) {
                                            innerCount++;
                                        }
                                    }
                                    totalsum1 += innerCount;
                                    count1++;

                                    if(lastExpect != null)
                                        lastlastExpect = lastExpect;
                                    lastExpect = expectations[i];

                                    if(currentleague != expectations[i].leagueId) {
                                        currentleague = expectations[i].leagueId;
                                    } else {
                                        var diff = 0;//Math.floor((lastExpect.start_date.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                        if(diff > 0) {
                                            sumdiscount += diff * 1.5;
                                        }
                                    }

                                    sum1 += expectations[i].percent * innerCount;
                                    if(i < expectations.length - 1) {
                                        totalsum2 += innerCount;
                                        sum2 += expectations[i].percent * innerCount;
                                        count2++;
                                    }

                                }
                            }

                            var average1 = -1;
                            var average2 = -1;
                            if(totalsum1 > 0)
                                average1 = sum1 / totalsum1;

                            if(totalsum2 > 0)
                                average2 = sum2 / totalsum2;

                            var today = new Date();

                            if(lastExpect != null) {
                                var difference1 = 0;//Math.floor((today.getTime() - lastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                if(difference1 > 0) {
                                    average1 -= difference1 * 1.5;
                                    average1 -= sumdiscount;
                                    if(average1 < 0)
                                        average1 = 0;
                                }
                            }

                            if(lastlastExpect != null) {
                                var difference2 = 0;//Math.floor((today.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                if(difference2 > 0) {
                                    average2 -= difference2 * 1.5;
                                    average2 -= sumdiscount;
                                    if(average2 < 0)
                                        average2 = 0;
                                }
                            }

                            var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                            if(user._id == req.params.userId)
                                currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                            if(average1 != -1)
                                resultUserList.push(newUserObject);
                        }
                        callbackCount--;
                        if(callbackCount == 0) {
                            resultUserList.sort(predicateBy("current"));
                            for(var i = 0; i < resultUserList.length; i++) {
                                if(resultUserList[i]._id == req.params.userId) {
                                    currentUser.ranking = i + 1;
                                    break;
                                }
                            }
                            resultUserList = resultUserList.slice(0, 10);
                            resultUserList.push(currentUser);
                            res.json(resultUserList);
                        }
                    });
                });
            });
        }
    });
}


exports.getRankingByCountryByLeagueList = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};
    User.find({'_id': req.params.userId}, function(err, user) {

        if(user[0]) {
            User.find({'country': user[0].country}, function(err, users){
                if (err) return;
                users.forEach(function(user) {
                    callbackCount++;                    
                    Expectation.find({leagueId: {$in: req.query.leagueList}, userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){

                        if(expectations.length > 0) {
                            var sum1 = 0;
                            var sum2 = 0;
                            var totalsum1 = 0;
                            var totalsum2 = 0;
                            var count1 = 0;
                            var count2 = 0;
                            var lastExpect = null;
                            var lastlastExpect = null;

                            var sumdiscount = 0;
                            var currentleague = -1;
                            for(var i = 0; i < expectations.length; i++) {
                                var innerCount = 0;
                                if(expectations[i].percent != -1) {
                                    for(var j = 0; j < expectations[i].expectation.length; j++) {
                                        if(expectations[i].expectation[j] != 0) {
                                            innerCount++;
                                        }
                                    }
                                    totalsum1 += innerCount;
                                    count1++;

                                    if(lastExpect != null)
                                        lastlastExpect = lastExpect;
                                    lastExpect = expectations[i];

                                    if(currentleague != expectations[i].leagueId) {
                                        currentleague = expectations[i].leagueId;
                                    } else {
                                        var diff = 0;//Math.floor((lastExpect.start_date.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                        if(diff > 0) {
                                            sumdiscount += diff * 1.5;
                                        }
                                    }

                                    sum1 += expectations[i].percent * innerCount;
                                    if(i < expectations.length - 1) {
                                        totalsum2 += innerCount;
                                        sum2 += expectations[i].percent * innerCount;
                                        count2++;
                                    }

                                }
                            }

                            var average1 = -1;
                            var average2 = -1;
                            if(totalsum1 > 0)
                                average1 = sum1 / totalsum1;

                            if(totalsum2 > 0)
                                average2 = sum2 / totalsum2;

                            var today = new Date();

                            if(lastExpect != null) {
                                var difference1 = 0;//Math.floor((today.getTime() - lastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                if(difference1 > 0) {
                                    average1 -= difference1 * 1.5;
                                    average1 -= sumdiscount;
                                    if(average1 < 0)
                                        average1 = 0;
                                }
                            }

                            if(lastlastExpect != null) {
                                var difference2 = 0;//Math.floor((today.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                if(difference2 > 0) {
                                    average2 -= difference2 * 1.5;
                                    average2 -= sumdiscount;
                                    if(average2 < 0)
                                        average2 = 0;
                                }
                            }

                            var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                            if(user._id == req.params.userId)
                                currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                            if(average1 != -1)
                                resultUserList.push(newUserObject);
                        }
                        callbackCount--;
                        if(callbackCount == 0) {
                            resultUserList.sort(predicateBy("current"));
                            for(var i = 0; i < resultUserList.length; i++) {
                                if(resultUserList[i]._id == req.params.userId) {
                                    currentUser.ranking = i + 1;
                                    break;
                                }
                            }
                            resultUserList = resultUserList.slice(0, 10);
                            resultUserList.push(currentUser);
                            res.json(resultUserList);
                        }
                    });
                });
            });
        }
    });
}

exports.getRankingByCountryWithoutLeague = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};
    User.find({'_id': req.params.userId}, function(err, user) {

        if(user[0]) {
            User.find({'country': user[0].country}, function(err, users){
                if (err) return;
                users.forEach(function(user) {
                    callbackCount++;
                    Expectation.find({userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){

                        if(expectations.length > 0) {
                            var sum1 = 0;
                            var sum2 = 0;
                            var totalsum1 = 0;
                            var totalsum2 = 0;
                            var count1 = 0;
                            var count2 = 0;
                            var lastExpect = null;
                            var lastlastExpect = null;

                            var sumdiscount = 0;
                            var currentleague = -1;
                            for(var i = 0; i < expectations.length; i++) {
                                var innerCount = 0;
                                if(expectations[i].percent != -1) {
                                    for(var j = 0; j < expectations[i].expectation.length; j++) {
                                        if(expectations[i].expectation[j] != 0) {
                                            innerCount++;
                                        }
                                    }
                                    totalsum1 += innerCount;
                                    count1++;

                                    if(lastExpect != null)
                                        lastlastExpect = lastExpect;
                                    lastExpect = expectations[i];

                                    if(currentleague != expectations[i].leagueId) {
                                        currentleague = expectations[i].leagueId;
                                    } else {
                                        var diff = 0;//Math.floor((lastExpect.start_date.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                        if(diff > 0) {
                                            sumdiscount += diff * 1.5;
                                        }
                                    }

                                    sum1 += expectations[i].percent * innerCount;
                                    if(i < expectations.length - 1) {
                                        totalsum2 += innerCount;
                                        sum2 += expectations[i].percent * innerCount;
                                        count2++;
                                    }

                                }
                            }

                            var average1 = -1;
                            var average2 = -1;
                            if(totalsum1 > 0)
                                average1 = sum1 / totalsum1;

                            if(totalsum2 > 0)
                                average2 = sum2 / totalsum2;

                            var today = new Date();

                            if(lastExpect != null) {
                                var difference1 = 0;//Math.floor((today.getTime() - lastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                if(difference1 > 0) {
                                    average1 -= difference1 * 1.5;
                                    average1 -= sumdiscount;
                                    if(average1 < 0)
                                        average1 = 0;
                                }
                            }

                            if(lastlastExpect != null) {
                                var difference2 = 0;//Math.floor((today.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                if(difference2 > 0) {
                                    average2 -= difference2 * 1.5;
                                    average2 -= sumdiscount;
                                    if(average2 < 0)
                                        average2 = 0;
                                }
                            }

                            var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                            if(user._id == req.params.userId)
                                currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                            if(average1 != -1)
                                resultUserList.push(newUserObject);
                        }
                        callbackCount--;
                        if(callbackCount == 0) {
                            resultUserList.sort(predicateBy("current"));
                            for(var i = 0; i < resultUserList.length; i++) {
                                if(resultUserList[i]._id == req.params.userId) {
                                    currentUser.ranking = i + 1;
                                    break;
                                }
                            }
                            resultUserList = resultUserList.slice(0, 10);
                            resultUserList.push(currentUser);
                            res.json(resultUserList);
                        }
                    });
                });
            });
        }
    });
}

exports.getRankingByFacebookByLeagueList = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};
    User.find({'_id': req.params.userId}, function(err, user) {

        if(user[0]) {
            User.find({$or: [{'fbFriends': user[0].fbID},{'fbID': user[0].fbID}]}, function(err, users){
                if (err) return;
                users.forEach(function(user) {
                    callbackCount++;
                    Expectation.find({leagueId: {$in: req.query.leagueList}, userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){

                        if(expectations.length > 0) {
                            var sum1 = 0;
                            var sum2 = 0;
                            var totalsum1 = 0;
                            var totalsum2 = 0;
                            var count1 = 0;
                            var count2 = 0;
                            var lastExpect = null;
                            var lastlastExpect = null;

                            var sumdiscount = 0;
                            var currentleague = -1;
                            for(var i = 0; i < expectations.length; i++) {
                                var innerCount = 0;
                                if(expectations[i].percent != -1) {
                                    for(var j = 0; j < expectations[i].expectation.length; j++) {
                                        if(expectations[i].expectation[j] != 0) {
                                            innerCount++;
                                        }
                                    }
                                    totalsum1 += innerCount;
                                    count1++;

                                    if(lastExpect != null)
                                        lastlastExpect = lastExpect;
                                    lastExpect = expectations[i];

                                    if(currentleague != expectations[i].leagueId) {
                                        currentleague = expectations[i].leagueId;
                                    } else {
                                        var diff = 0;//Math.floor((lastExpect.start_date.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                        if(diff > 0) {
                                            sumdiscount += diff * 1.5;
                                        }
                                    }

                                    sum1 += expectations[i].percent * innerCount;
                                    if(i < expectations.length - 1) {
                                        totalsum2 += innerCount;
                                        sum2 += expectations[i].percent * innerCount;
                                        count2++;
                                    }

                                }
                            }

                            var average1 = -1;
                            var average2 = -1;
                            if(totalsum1 > 0)
                                average1 = sum1 / totalsum1;

                            if(totalsum2 > 0)
                                average2 = sum2 / totalsum2;

                            var today = new Date();

                            if(lastExpect != null) {
                                var difference1 = 0;//Math.floor((today.getTime() - lastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                if(difference1 > 0) {
                                    average1 -= difference1 * 1.5;
                                    average1 -= sumdiscount;
                                    if(average1 < 0)
                                        average1 = 0;
                                }
                            }

                            if(lastlastExpect != null) {
                                var difference2 = 0;//Math.floor((today.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                if(difference2 > 0) {
                                    average2 -= difference2 * 1.5;
                                    average2 -= sumdiscount;
                                    if(average2 < 0)
                                        average2 = 0;
                                }
                            }

                            var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                            if(user._id == req.params.userId)
                                currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                            if(average1 != -1)
                                resultUserList.push(newUserObject);
                        }
                        callbackCount--;
                        if(callbackCount == 0) {
                            resultUserList.sort(predicateBy("current"));
                            for(var i = 0; i < resultUserList.length; i++) {
                                if(resultUserList[i]._id == req.params.userId) {
                                    currentUser.ranking = i + 1;
                                    break;
                                }
                            }
                            resultUserList = resultUserList.slice(0, 10);
                            resultUserList.push(currentUser);
                            res.json(resultUserList);
                        }
                    });
                });
            });
        }
    });
}

exports.getRankingByFacebookWithoutLeague = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};
    User.find({'_id': req.params.userId}, function(err, user) {

        if(user[0]) {
            User.find({$or: [{'fbFriends': user[0].fbID},{'fbID': user[0].fbID}]}, function(err, users){
                if (err) return;
                users.forEach(function(user) {
                    callbackCount++;
                    Expectation.find({userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){

                        if(expectations.length > 0) {
                            var sum1 = 0;
                            var sum2 = 0;
                            var totalsum1 = 0;
                            var totalsum2 = 0;
                            var count1 = 0;
                            var count2 = 0;
                            var lastExpect = null;
                            var lastlastExpect = null;

                            var sumdiscount = 0;
                            var currentleague = -1;
                            for(var i = 0; i < expectations.length; i++) {
                                var innerCount = 0;
                                if(expectations[i].percent != -1) {
                                    for(var j = 0; j < expectations[i].expectation.length; j++) {
                                        if(expectations[i].expectation[j] != 0) {
                                            innerCount++;
                                        }
                                    }
                                    totalsum1 += innerCount;
                                    count1++;

                                    if(lastExpect != null)
                                        lastlastExpect = lastExpect;
                                    lastExpect = expectations[i];

                                    if(currentleague != expectations[i].leagueId) {
                                        currentleague = expectations[i].leagueId;
                                    } else {
                                        var diff = 0;//Math.floor((lastExpect.start_date.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                        if(diff > 0) {
                                            sumdiscount += diff * 1.5;
                                        }
                                    }

                                    sum1 += expectations[i].percent * innerCount;
                                    if(i < expectations.length - 1) {
                                        totalsum2 += innerCount;
                                        sum2 += expectations[i].percent * innerCount;
                                        count2++;
                                    }

                                }
                            }

                            var average1 = -1;
                            var average2 = -1;
                            if(totalsum1 > 0)
                                average1 = sum1 / totalsum1;

                            if(totalsum2 > 0)
                                average2 = sum2 / totalsum2;

                            var today = new Date();

                            if(lastExpect != null) {
                                var difference1 = 0;//Math.floor((today.getTime() - lastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                if(difference1 > 0) {
                                    average1 -= difference1 * 1.5;
                                    average1 -= sumdiscount;
                                    if(average1 < 0)
                                        average1 = 0;
                                }
                            }

                            if(lastlastExpect != null) {
                                var difference2 = 0;//Math.floor((today.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                if(difference2 > 0) {
                                    average2 -= difference2 * 1.5;
                                    average2 -= sumdiscount;
                                    if(average2 < 0)
                                        average2 = 0;
                                }
                            }

                            var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                            if(user._id == req.params.userId)
                                currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                            if(average1 != -1)
                                resultUserList.push(newUserObject);
                        }
                        callbackCount--;
                        if(callbackCount == 0) {
                            resultUserList.sort(predicateBy("current"));
                            for(var i = 0; i < resultUserList.length; i++) {
                                if(resultUserList[i]._id == req.params.userId) {
                                    currentUser.ranking = i + 1;
                                    break;
                                }
                            }
                            resultUserList = resultUserList.slice(0, 10);
                            resultUserList.push(currentUser);
                            res.json(resultUserList);
                        }
                    });
                });
            });
        }
    });
}

exports.getRankingByAllByLeagueList = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};

    User.find({}, function(err, users){
        if (err) return;
        users.forEach(function(user) {
            callbackCount++;                    
            Expectation.find({leagueId: {$in: req.query.leagueList}, userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){

                if(expectations.length > 0) {
                    var sum1 = 0;
                    var sum2 = 0;
                    var totalsum1 = 0;
                    var totalsum2 = 0;
                    var count1 = 0;
                    var count2 = 0;
                    var lastExpect = null;
                    var lastlastExpect = null;

                    var sumdiscount = 0;
                    var currentleague = -1;
                    for(var i = 0; i < expectations.length; i++) {
                        var innerCount = 0;
                        if(expectations[i].percent != -1) {
                            for(var j = 0; j < expectations[i].expectation.length; j++) {
                                if(expectations[i].expectation[j] != 0) {
                                    innerCount++;
                                }
                            }
                            totalsum1 += innerCount;
                            count1++;

                            if(lastExpect != null)
                                lastlastExpect = lastExpect;
                            lastExpect = expectations[i];

                            if(currentleague != expectations[i].leagueId) {
                                currentleague = expectations[i].leagueId;
                            } else {
                                var diff = 0;//Math.floor((lastExpect.start_date.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                if(diff > 0) {
                                    sumdiscount += diff * 1.5;
                                }
                            }

                            sum1 += expectations[i].percent * innerCount;
                            if(i < expectations.length - 1) {
                                totalsum2 += innerCount;
                                sum2 += expectations[i].percent * innerCount;
                                count2++;
                            }

                        }
                    }

                    var average1 = -1;
                    var average2 = -1;
                    if(totalsum1 > 0)
                        average1 = sum1 / totalsum1;

                    if(totalsum2 > 0)
                        average2 = sum2 / totalsum2;

                    var today = new Date();

                    if(lastExpect != null) {
                        var difference1 = 0;//Math.floor((today.getTime() - lastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                        if(difference1 > 0) {
                            average1 -= difference1 * 1.5;
                            average1 -= sumdiscount;
                            if(average1 < 0)
                                average1 = 0;
                        }
                    }

                    if(lastlastExpect != null) {
                        var difference2 = 0;//Math.floor((today.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                        if(difference2 > 0) {
                            average2 -= difference2 * 1.5;
                            average2 -= sumdiscount;
                            if(average2 < 0)
                                average2 = 0;
                        }
                    }

                    var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                    if(user._id == req.params.userId)
                        currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                    if(average1 != -1)
                        resultUserList.push(newUserObject);
                }
                callbackCount--;
                if(callbackCount == 0) {
                    resultUserList.sort(predicateBy("current"));
                    for(var i = 0; i < resultUserList.length; i++) {
                        if(resultUserList[i]._id == req.params.userId) {
                            currentUser.ranking = i + 1;
                            break;
                        }
                    }
                    resultUserList = resultUserList.slice(0, 10);
                    resultUserList.push(currentUser);
                    res.json(resultUserList);
                }
            });
        });
    });
}

exports.getRankingByAllWithoutLeague = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};

    User.find({}, function(err, users){
        if (err) return;
        users.forEach(function(user) {
            callbackCount++;

            Expectation.find({userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){

                if(expectations.length > 0) {
                    var sum1 = 0;
                    var sum2 = 0;
                    var totalsum1 = 0;
                    var totalsum2 = 0;
                    var count1 = 0;
                    var count2 = 0;
                    var lastExpect = null;
                    var lastlastExpect = null;

                    var sumdiscount = 0;
                    var currentleague = -1;
                    for(var i = 0; i < expectations.length; i++) {
                        var innerCount = 0;
                        if(expectations[i].percent != -1) {
                            for(var j = 0; j < expectations[i].expectation.length; j++) {
                                if(expectations[i].expectation[j] != 0) {
                                    innerCount++;
                                }
                            }
                            totalsum1 += innerCount;
                            count1++;

                            if(lastExpect != null)
                                lastlastExpect = lastExpect;
                            lastExpect = expectations[i];

                            if(currentleague != expectations[i].leagueId) {
                                currentleague = expectations[i].leagueId;
                            } else {
                                var diff = 0;//Math.floor((lastExpect.start_date.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                                if(diff > 0) {
                                    sumdiscount += diff * 1.5;
                                }
                            }

                            sum1 += expectations[i].percent * innerCount;
                            if(i < expectations.length - 1) {
                                totalsum2 += innerCount;
                                sum2 += expectations[i].percent * innerCount;
                                count2++;
                            }

                        }
                    }

                    var average1 = -1;
                    var average2 = -1;
                    if(totalsum1 > 0)
                        average1 = sum1 / totalsum1;

                    if(totalsum2 > 0)
                        average2 = sum2 / totalsum2;

                    var today = new Date();

                    if(lastExpect != null) {
                        var difference1 = 0;//Math.floor((today.getTime() - lastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                        if(difference1 > 0) {
                            average1 -= difference1 * 1.5;
                            average1 -= sumdiscount;
                            if(average1 < 0)
                                average1 = 0;
                        }
                    }

                    if(lastlastExpect != null) {
                        var difference2 = 0;//Math.floor((today.getTime() - lastlastExpect.start_date.getTime()) / (1000 * 3600 * 24 * 7));
                        if(difference2 > 0) {
                            average2 -= difference2 * 1.5;
                            average2 -= sumdiscount;
                            if(average2 < 0)
                                average2 = 0;
                        }
                    }

                    var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                    if(user._id == req.params.userId)
                        currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'current': average1, 'last': average2};
                    if(average1 != -1)
                        resultUserList.push(newUserObject);
                }

                callbackCount--;
                if(callbackCount == 0) {
                    resultUserList.sort(predicateBy("current"));
                    for(var i = 0; i < resultUserList.length; i++) {
                        if(resultUserList[i]._id == req.params.userId) {
                            currentUser.ranking = i + 1;
                            break;
                        }
                    }
                    resultUserList = resultUserList.slice(0, 10);
                    resultUserList.push(currentUser);
                    res.json(resultUserList);
                }
            });
        });
    });
}

exports.getUserStatus = function(req, res){
    //var callbackCount = 0;
    var correctCount = 0;
    var wrongCount = 0;
    var wonCount = 0;
    var lastExpectedDate = new Date(2000, 1, 1);

    Expectation.find({'userId': req.params.userId}, function(err, expectations) {
        if(expectations.length>0) {
            //expectations.forEach(function(expectation) {
            for(var i=0; i<expectations.length; i++) {
                //callbackCount++;
                if(expectations[i].percent == 100)
                    wonCount++;
                // League.find({'index': expectation.leagueId}, function(err, leagues) {
                //     var fixture_info = leagues[0].fixture_info;
                //     for(var i = 0; i < fixture_info.length; i++) {
                //         if(fixture_info[i].week_no == expectation.week_no) {
                //             if(lastExpectedDate < fixture_info[i].start_date)
                //                 lastExpectedDate = fixture_info[i].start_date;
                //             for(var k = 0; k < expectation.expectation.length; k++) {
                //                 if(fixture_info[i].game_info[k].result != 0) {
                //                     if(fixture_info[i].game_info[k].result == expectation.expectation[k])
                //                         correctCount++;
                //                     else
                //                         wrongCount++;
                //                 }
                //             }
                //         }
                //     }

                //     callbackCount--;
                //     if(callbackCount == 0) {
                //         var today = new Date();
                //         var difference = Math.floor((today.getTime() - lastExpectedDate.getTime()) / (1000 * 3600 * 24 * 7));
                //         var percent = 0;
                //         if(wrongCount + correctCount != 0) {
                //             percent = (correctCount) / (correctCount + wrongCount) * 100;
                //             if(difference > 0) {
                //                 percent -= difference * 1.5;
                //                 if(percent<0)
                //                     percent = 0;
                //             }
                //         }
                //         res.json({status:"success", correctCount: correctCount, wrongCount: wrongCount, percent: percent, wonCount: wonCount});
                //     }
                // });

                if(lastExpectedDate < expectations[i].start_date)
                    lastExpectedDate = expectations[i].start_date;
                for(var k=0; k<expectations[i].match_result.length; k++)
                {
                    if(expectations[i].match_result[k]==1)
                        correctCount++;
                    else if(expectations[i].match_result[k]==0)
                        wrongCount++;
                }
            //});
            }

            var today = new Date();
            var penalty = 0;//Math.floor((today.getTime() - lastExpectedDate.getTime()) / (1000 * 3600 * 24 * 7));
            var percent = 0;

            if(wrongCount + correctCount + penalty != 0) {
                percent = (correctCount) / (correctCount + wrongCount + penalty) * 100;
                if(percent < 0)
                    percent = 0;
            }
            res.json({status:"success", correctCount: correctCount, wrongCount: wrongCount, percent: percent, wonCount: wonCount});
        } else {
            res.json({status:"none"});
        }
    });
}


/*  Version2 APIs */

function calc_score(user_score, average_score, callback) {
    var diff = user_score - average_score;
    var score = {'score':0};
    if(diff==0) {
        score = {'score':0};
        callback(score);
    }
    else if(diff>0 && diff<=1) {
        score = {'score':10};
        callback(score);
    }
    else if(diff>1 && diff<=2) {
        score = {'score':20};
        callback(score);
    }
    else if(diff>2 && diff<=3) {
        score = {'score':30};
        callback(score);
    }
    else if(diff>3 && diff<=4) {
        score = {'score':50};
        callback(score);
    }
    else if(diff>4 && diff<=5) {
        score = {'score':80};
        callback(score);
    }
    else if(diff>5 && diff<=6) {
        score = {'score':130};
        callback(score);
    }
    else if(diff>6 && diff<=7) {
        score = {'score':210};
        callback(score);
    }
    else if(diff>7 && diff<=8) {
        score = {'score':340};
        callback(score);
    }
    else if(diff>8 && diff<=9) {
        score = {'score':560};
        callback(score);
    }
    else if(diff>9 && diff<=10) {
        score = {'score':900};
        callback(score);
    }
    else if(diff<0 && diff>=-1) {
        score = {'score':-10};
        callback(score);
    }
    else if(diff<-1 && diff>=-2) {
        score = {'score':-20};
        callback(score);
    }
    else if(diff<-2 && diff>=-3) {
        score = {'score':-30};
        callback(score);
    }
    else if(diff<-3 && diff>=-4) {
        score = {'score':-50};
        callback(score);
    }
    else if(diff<-4 && diff>=-5) {
        score = {'score':-80};
        callback(score);
    }
    else if(diff<-5 && diff>=-6) {
        score = {'score':-130};
        callback(score);
    }
    else if(diff<-6 && diff>=-7) {
        score = {'score':-210};
        callback(score);
    }
    else if(diff<-7 && diff>=-8) {
        score = {'score':-340};
        callback(score);
    }
    else if(diff<-8 && diff>=-9) {
        score = {'score':-560};
        callback(score);
    }
    else if(diff<-9 && diff>=-10) {
        score = {'score':-900};
        callback(score);
    }
    return;
}

exports.getRankingByCityByLeagueListV2 = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};
    User.find({'_id': req.params.userId}, function(err, user) {

        if(user[0]) {
            User.find({'city': user[0].city}, function(err, users){
                if (err) return;
                users.forEach(function(user) {
                    callbackCount++;                    
                    Expectation.find({leagueId: {$in: req.query.leagueList}, userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){

                        if(expectations.length > 0) {
                            var total_correct = 0;
                            var total_wrong = 0;
                            var score = 0;
                            for(var i = 0; i < expectations.length; i++) {
                                total_correct += expectations[i].correctCnt;
                                total_wrong += expectations[i].wrongCnt;
                                calc_score(expectations[i].correctCnt, expectations[i].avg, function(result) {
                                    if(result)
                                        score += result.score;
                                });
                            }

                            var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                            if(user._id == req.params.userId)
                                currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                            if(total_correct+total_wrong != 0)
                                resultUserList.push(newUserObject);
                        }
                        callbackCount--;
                        if(callbackCount == 0) {
                            resultUserList.sort(predicateBy("score"));
                            for(var i = 0; i < resultUserList.length; i++) {
                                if(resultUserList[i]._id == req.params.userId) {
                                    currentUser.ranking = i + 1;
                                    break;
                                }
                            }
                            //resultUserList = resultUserList.slice(0, 10);
                            resultUserList.push(currentUser);
                            res.json(resultUserList);
                        }
                    });
                });
            });
        }
    });
}

exports.getRankingByCityWithoutLeagueV2 = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};
    User.find({'_id': req.params.userId}, function(err, user) {

        if(user[0]) {
            User.find({'city': user[0].city}, function(err, users){
                if (err) return;
                users.forEach(function(user) {
                    callbackCount++;                    
                    Expectation.find({userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){

                        if(expectations.length > 0) {
                            var total_correct = 0;
                            var total_wrong = 0;
                            var score = 0;
                            for(var i = 0; i < expectations.length; i++) {
                                total_correct += expectations[i].correctCnt;
                                total_wrong += expectations[i].wrongCnt;
                                calc_score(expectations[i].correctCnt, expectations[i].avg, function(result) {
                                    if(result)
                                        score += result.score;
                                });
                            }

                            var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                            if(user._id == req.params.userId)
                                currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                            if(total_correct+total_wrong != 0)
                                resultUserList.push(newUserObject);
                        }
                        callbackCount--;
                        if(callbackCount == 0) {
                            resultUserList.sort(predicateBy("score"));
                            for(var i = 0; i < resultUserList.length; i++) {
                                if(resultUserList[i]._id == req.params.userId) {
                                    currentUser.ranking = i + 1;
                                    break;
                                }
                            }
                            //resultUserList = resultUserList.slice(0, 10);
                            resultUserList.push(currentUser);
                            res.json(resultUserList);
                        }
                    });
                });
            });
        }
    });
}

exports.getRankingByCountryByLeagueListV2 = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};
    User.find({'_id': req.params.userId}, function(err, user) {

        if(user[0]) {
            User.find({'country': user[0].country}, function(err, users){
                if (err) return;
                users.forEach(function(user) {
                    callbackCount++;                    
                    Expectation.find({leagueId: {$in: req.query.leagueList}, userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){
                        if(expectations.length > 0) {
                            var total_correct = 0;
                            var total_wrong = 0;
                            var score = 0;
                            for(var i = 0; i < expectations.length; i++) {
                                total_correct += expectations[i].correctCnt;
                                total_wrong += expectations[i].wrongCnt;
                                calc_score(expectations[i].correctCnt, expectations[i].avg, function(result) {
                                    if(result)
                                        score += result.score;
                                });
                            }

                            var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                            if(user._id == req.params.userId)
                                currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                            if(total_correct+total_wrong != 0)
                                resultUserList.push(newUserObject);
                        }
                        callbackCount--;
                        if(callbackCount == 0) {
                            resultUserList.sort(predicateBy("score"));
                            for(var i = 0; i < resultUserList.length; i++) {
                                if(resultUserList[i]._id == req.params.userId) {
                                    currentUser.ranking = i + 1;
                                    break;
                                }
                            }
                            //resultUserList = resultUserList.slice(0, 10);
                            resultUserList.push(currentUser);
                            res.json(resultUserList);
                        }                        
                    });
                });
            });
        }
    });
}

exports.getRankingByCountryWithoutLeagueV2 = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};
    User.find({'_id': req.params.userId}, function(err, user) {

        if(user[0]) {
            User.find({'country': user[0].country}, function(err, users){
                if (err) return;
                users.forEach(function(user) {
                    callbackCount++;
                    Expectation.find({userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){
                        if(expectations.length > 0) {
                            var total_correct = 0;
                            var total_wrong = 0;
                            var score = 0;
                            for(var i = 0; i < expectations.length; i++) {
                                total_correct += expectations[i].correctCnt;
                                total_wrong += expectations[i].wrongCnt;
                                calc_score(expectations[i].correctCnt, expectations[i].avg, function(result) {
                                    if(result)
                                        score += result.score;
                                });
                            }

                            var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                            if(user._id == req.params.userId)
                                currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                            if(total_correct+total_wrong != 0)
                                resultUserList.push(newUserObject);
                        }
                        callbackCount--;
                        if(callbackCount == 0) {
                            resultUserList.sort(predicateBy("score"));
                            for(var i = 0; i < resultUserList.length; i++) {
                                if(resultUserList[i]._id == req.params.userId) {
                                    currentUser.ranking = i + 1;
                                    break;
                                }
                            }
                            //resultUserList = resultUserList.slice(0, 10);
                            resultUserList.push(currentUser);
                            res.json(resultUserList);
                        }                        
                    });
                });
            });
        }
    });
}

exports.getRankingByFacebookByLeagueListV2 = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};
    User.find({'_id': req.params.userId}, function(err, user) {

        if(user[0]) {
            User.find({$or: [{'fbFriends': user[0].fbID},{'fbID': user[0].fbID}]}, function(err, users){
                if (err) return;
                users.forEach(function(user) {
                    callbackCount++;
                    Expectation.find({leagueId: {$in: req.query.leagueList}, userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){
                        if(expectations.length > 0) {
                            var total_correct = 0;
                            var total_wrong = 0;
                            var score = 0;
                            for(var i = 0; i < expectations.length; i++) {
                                total_correct += expectations[i].correctCnt;
                                total_wrong += expectations[i].wrongCnt;
                                calc_score(expectations[i].correctCnt, expectations[i].avg, function(result) {
                                    if(result)
                                        score += result.score;
                                });
                            }

                            var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                            if(user._id == req.params.userId)
                                currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                            if(total_correct+total_wrong != 0)
                                resultUserList.push(newUserObject);
                        }
                        callbackCount--;
                        if(callbackCount == 0) {
                            resultUserList.sort(predicateBy("score"));
                            for(var i = 0; i < resultUserList.length; i++) {
                                if(resultUserList[i]._id == req.params.userId) {
                                    currentUser.ranking = i + 1;
                                    break;
                                }
                            }
                            //resultUserList = resultUserList.slice(0, 10);
                            resultUserList.push(currentUser);
                            res.json(resultUserList);
                        }                        
                    });
                });
            });
        }
    });
}

exports.getRankingByFacebookWithoutLeagueV2 = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};
    User.find({'_id': req.params.userId}, function(err, user) {

        if(user[0]) {
            User.find({$or: [{'fbFriends': user[0].fbID},{'fbID': user[0].fbID}]}, function(err, users){
                if (err) return;
                users.forEach(function(user) {
                    callbackCount++;
                    Expectation.find({userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){
                        if(expectations.length > 0) {
                            var total_correct = 0;
                            var total_wrong = 0;
                            var score = 0;
                            for(var i = 0; i < expectations.length; i++) {
                                total_correct += expectations[i].correctCnt;
                                total_wrong += expectations[i].wrongCnt;
                                calc_score(expectations[i].correctCnt, expectations[i].avg, function(result) {
                                    if(result)
                                        score += result.score;
                                });
                            }

                            var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                            if(user._id == req.params.userId)
                                currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                            if(total_correct+total_wrong != 0)
                                resultUserList.push(newUserObject);
                        }
                        callbackCount--;
                        if(callbackCount == 0) {
                            resultUserList.sort(predicateBy("score"));
                            for(var i = 0; i < resultUserList.length; i++) {
                                if(resultUserList[i]._id == req.params.userId) {
                                    currentUser.ranking = i + 1;
                                    break;
                                }
                            }
                            //resultUserList = resultUserList.slice(0, 10);
                            resultUserList.push(currentUser);
                            res.json(resultUserList);
                        }                        
                    });
                });
            });
        }
    });
}

exports.getRankingByAllByLeagueListV2 = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};

    User.find({}, function(err, users){
        if (err) return;
        users.forEach(function(user) {
            callbackCount++;                    
            Expectation.find({leagueId: {$in: req.query.leagueList}, userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){
                if(expectations.length > 0) {
                    var total_correct = 0;
                    var total_wrong = 0;
                    var score = 0;
                    for(var i = 0; i < expectations.length; i++) {
                        total_correct += expectations[i].correctCnt;
                        total_wrong += expectations[i].wrongCnt;
                        calc_score(expectations[i].correctCnt, expectations[i].avg, function(result) {
                            if(result)
                                score += result.score;
                        });
                    }

                    var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                    if(user._id == req.params.userId)
                        currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                    if(total_correct+total_wrong != 0)
                        resultUserList.push(newUserObject);
                }
                callbackCount--;
                if(callbackCount == 0) {
                    resultUserList.sort(predicateBy("score"));
                    for(var i = 0; i < resultUserList.length; i++) {
                        if(resultUserList[i]._id == req.params.userId) {
                            currentUser.ranking = i + 1;
                            break;
                        }
                    }
                    //resultUserList = resultUserList.slice(0, 10);
                    resultUserList.push(currentUser);
                    res.json(resultUserList);
                }                
            });
        });
    });
}

exports.getRankingByAllWithoutLeagueV2 = function(req, res){
    var callbackCount = 0;
    var resultUserList = [];
    var currentUser = {};

    User.find({}, function(err, users){
        if (err) return;
        users.forEach(function(user) {
            callbackCount++;

            Expectation.find({userId: user._id}).sort({leagueId: 1}).exec(function(err, expectations){
                if(expectations.length > 0) {
                    var total_correct = 0;
                    var total_wrong = 0;
                    var score = 0;
                    for(var i = 0; i < expectations.length; i++) {
                        total_correct += expectations[i].correctCnt;
                        total_wrong += expectations[i].wrongCnt;
                        calc_score(expectations[i].correctCnt, expectations[i].avg, function(result) {
                            if(result)
                                score += result.score;
                        });
                    }

                    var newUserObject = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                    if(user._id == req.params.userId)
                        currentUser = {'_id': user._id, 'fbID': user.fbID, 'name': user.name, 'correct': total_correct, 'wrong': total_wrong, 'score': score};
                    if(total_correct+total_wrong != 0)
                        resultUserList.push(newUserObject);
                }
                callbackCount--;
                if(callbackCount == 0) {
                    resultUserList.sort(predicateBy("score"));
                    for(var i = 0; i < resultUserList.length; i++) {
                        if(resultUserList[i]._id == req.params.userId) {
                            currentUser.ranking = i + 1;
                            break;
                        }
                    }
                    //resultUserList = resultUserList.slice(0, 10);
                    resultUserList.push(currentUser);
                    res.json(resultUserList);
                }                
            });
        });
    });
}

exports.getUserStatusV2 = function(req, res){
    var correctCount = [0, 0, 0, 0, 0];
    var wrongCount = [0, 0, 0, 0, 0];
    var score = [0, 0, 0, 0, 0];
    var wonCount = 0;

    Expectation.find({'userId': req.params.userId}, function(err, expectations) {
        if(expectations.length>0) {
            for(var i=0; i<expectations.length; i++) {
                if(expectations[i].percent == 100)
                    wonCount++;
                
                correctCount[expectations[i].leagueId-1] += expectations[i].correctCnt;
                wrongCount[expectations[i].leagueId-1] += expectations[i].wrongCnt;
                if(expectations[i].avg != 0) {
                    calc_score(expectations[i].correctCnt, expectations[i].avg, function(result) {
                        if(result)
                            score[expectations[i].leagueId-1] += result.score;
                    });                    
                }

            }

            res.json({status:"success", correctCount: correctCount, wrongCount: wrongCount, score: score, wonCount: wonCount});
        } else {
            res.json({status:"none"});
        }
    });
}