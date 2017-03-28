var express = require('express')
var app = express()
var User = require('./models/user.js')
var DeviceToken = require('./models/deviceToken.js')
var Withdraw = require('./models/withdraw.js')
var Challenge = require('./models/challenge.js')
var _=require('underscore-node')

exports.register = function(req, res) {
    checkUserInfoValid(req, function(result) {
        if (result.status == 'error') {
            res.json(result);
            return;
        }
        if(result.status == 'existing') {
            console.log("existing: " + JSON.stringify(result.existing_user));
            result.existing_user.fbFriends = req.body.fbFriends;
            if(req.body.deviceToken) {
                //if(result.existing_user.deviceToken)
                    result.existing_user.deviceToken = req.body.deviceToken;
            }
            if(!result.existing_user.badgeNum)
                 result.existing_user.badgeNum = 0;
            var fbEmail = '';
            if(req.body.fbEmail)
                fbEmail = req.body.fbEmail;
            result.existing_user.fbEmail = fbEmail;
            result.existing_user.markModified('fbEmail');
            result.existing_user.save();

            Withdraw.findOne({"userID": result.existing_user._id}, function(err, request) {
                var verifyID = '';
                if(!err && request)
                    verifyID = request._id;
                var updateResult = {
                    status:"update",
                    userID:result.existing_user._id,
                    verifyID:verifyID,
                    score:result.existing_user.score
                };
                res.json(updateResult);
                return;
            });
        }
        else {
            console.log(JSON.stringify(req.body.fbFriends));

            if (req.body.name == '' || req.body.fbID == '') {
                return;
            }
            var fbEmail = '';
            if(req.body.fbEmail)
                fbEmail = req.body.fbEmail;
            var newUser = new User({
                name:req.body.name,
                fbEmail:fbEmail,
                fbID:req.body.fbID,
                fbFriends:req.body.fbFriends,
                balance:0,
                deviceToken:req.body.deviceToken,
                badgeNum:0,
                score:2000
            });
            newUser.save(function(err, data) {
                if (err) {
                    console.log("Creating New User error");
                    return;
                }else{
                    var newResult = {
                        status:result.status,
                        userID:newUser._id,
                        verifyID:'',
                        score:2000
                    };
                    res.json(newResult);
                }
            });
        }
    })
}

// exports.registerDeviceToken = function(req, res) {
//     console.log(req.body);
//     DeviceToken.findOne({OS:req.body.OS, token:req.body.token}, function(err, token) {
//         if(err) {
//             res.json({status:'error'});
//         } else {
//             if(token)
//                 res.json({status:'exist'});
//             else {
//                 var new_token = new DeviceToken({
//                     OS: req.body.OS,
//                     token: req.body.token,
//                     badgeNum: 0
//                 });
//                 new_token.save(function(err, data) {
//                     if(err)
//                         res.json({status:'error'});
//                     else
//                         res.json({status:'success'});
//                 });
//             }
//         }        
//     });
// }

exports.registerDeviceToken = function(req, res) {
    User.findOne({_id:req.body.userID}, function(err, user) {
        if(err) {
            res.json({status:'error'});
        } else {
            if(user) {
                if(user.deviceToken != req.body.token)
                    user.badgeNum = 0;
                user.deviceToken = req.body.token;
                if(!user.badgeNum)
                    user.badgeNum = 0;

                user.markModified('deviceToken');
                user.markModified('badgeNum');
                user.save();
                res.json({status:'success'});
            }
            else {
                res.json({status:'not existing token'});
            }
        }        
    });
}

// exports.clearBadge = function(req, res) {
//     console.log(req.params);
//     DeviceToken.findOne({OS:req.params.OS, token:req.params.tokenID}, function(err, token) {
//         if(err) {
//             res.json({status:'error'});
//         } else {
//             if(token) {
//                 token.badgeNum = 0;
//                 token.save();
//                 res.json({status:'success'});
//             }
//             else {
//                 res.json({status:'not existing token'});
//             }
//         }        
//     });
// }

exports.clearBadge = function(req, res) {
    console.log(req.params);
    User.findOne({_id:req.params.userID}, function(err, user) {
        if(err) {
            res.json({status:'error'});
        } else {
            if(user) {
                //if(user.badgeNum)
                user.badgeNum = 0;
                user.markModified('badgeNum');
                user.save();
                res.json({status:'success'});
            }
            else {
                res.json({status:'not existing user'});
            }
        }        
    });
}

exports.getUserById = function(req, res) {
    console.log(req.params.id);
    User.findById(req.params.id, function(err, user) {
        if (err) return;
        res.json(user);
    })
}

exports.getUserByName = function(req, res) {
    User.find({"name": req.params.name}, function(err, users) {
        if (err) return;
        if(users.length == 0)
            res.json({"exist": false});
        else
            res.json({"exist": true});
    })
}

exports.getAllUsers = function(req, res) {
    User.find({}, function(err, users) {
        if(err) return;
        else
            res.json({status: 'success', users: users});
    })
}

exports.getAllUsersWithAvailability = function(req, res) {
    User.find({}, function(err, users) {
        if(err) return;
        else {
            Challenge.find({$or:[{fromID:req.params.userId}, {toID:req.params.userId}], status:{$ne:1}}, function(err, challenges) {
                if(err) {
                    res.json({status:'error'});
                    return;
                }

                var allUsers = [];
                users.forEach(function(user) {
                    
                    var userChallenge = {};
                    challenges.forEach(function(challenge) {
                        if (user._id == challenge.fromID || user._id == challenge.toID) {
                            userChallenge = challenge;
                        }
                    });
                    var temp = {
                        'user' : user,
                        'user_challenge' : userChallenge
                    };
                    allUsers.push(temp);
                });

                res.json({status: 'success', users: allUsers});
            });
        }
    })
}

exports.getUserByInfo = function(req, res) {
    User.find({"name": req.params.name, "fbID": req.params.fbID}, function(err, users) {
        if (err) return;
        //console.log(JSON.stringify(users));
        if(users.length == 0)
            res.json({"exist": false});
        else
        {
            var newResult = {
                    "exist":true,
                    "userID":users[0]._id
                };
            res.json(newResult);
        }
    });
}

exports.getAllFaceBookID = function(req, res) {
    var fbID_list = [];
    User.find({}, function(err, users) {
        if(err) return;
        users.forEach(function(user) {
            var temp = {
                'fbID' : user.fbID,
                'fbEmail' : user.fbEmail
            };
            fbID_list.push(temp);
        });        
        res.json({'fbList':fbID_list});
    });
}

exports.updateUserLocationById = function(req, res){
    if (req.body['city'] == '' || req.body['country'] == '') {
        return;
    }

    console.log(req.params.id);
    User.findById(req.params.id, function(err, user){
        if (err) return;
        if(user) {
            console.log(JSON.stringify(req.body));
            user.country = req.body.country;
            user.city = req.body.city;
            user.save(function(error, data){
                if (error) {
                    res.json({status:'error'});  
                    return;
                }
                res.json({status:'success'})
            });
        }
        else {
            res.json({status:'none'});
        }
    });
}

function checkUserInfoValid(req, callback){
    User.findOne({fbID:req.body.fbID}, function(err, user) {
        if (err){
            callback({status:'error'})
            return;
        }
        if (user){
            console.log("existing");
            callback({status:'existing', existing_user:user})
            return;
        }        
        console.log("success");
        callback({status:'success'})
    });
}