var express = require('express')
var app = express()
var Notification = require('./models/notification.js')
var _=require('underscore-node')

exports.getPendingNotifications = function(req, res) {
    Notification.find({user_id:req.params.userId, status:{$ne:0}}, function(err, notifications) {
        if(err) {
            res.json({status:'error'});
            return;
        }
        res.json({status:'success', notifications:notifications});
    });
}

exports.saveNotification = function(req, res) {
    var new_notification = new Notification({
                user_id:   req.params.userId,
                message:     req.params.message,
                payload:       req.params.payload,
                status:         req.params.status
            });

    new_notification.save(function(err, data) {
        if (err) {
            console.log("Creating New Notification error");
            res.json({status:'error'});
        } else {
            newResult = {
                status:"success",
                notificationId:new_notification._id
            };
            res.json(newResult);
        }
    });
}

exports.updateNotificationStatus = function(req, res) {

    Notification.findById(req.params.id, function(err, notification){
        if (err) return;
        if(notification) {
            notification.status = 1;
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