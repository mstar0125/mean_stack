var express = require('express')
var mongoose = require('mongoose');
var app = express()
var Withdraw = require('./models/withdraw.js')
var User = require('./models/user.js')
var _=require('underscore-node')


exports.postVerifyRequest = function(req, res){
	console.log(JSON.stringify(req.body));

	var detail = {};
		detail.birthday = req.body.birthday;
		detail.address = req.body.address;
		detail.country = req.body.country;
		detail.city = req.body.city;
		detail.postalcode = req.body.postalcode;
		detail.phone = req.body.phone;
		detail.email = req.body.email;

	var empty_requests = [];

	var newRequest = new Withdraw({
				            userID: req.params.userId,
							name: req.body.name,
							picture: req.body.picture,
							detail: detail,
							status: 0,
							withdraw_requests:empty_requests
     					});

	newRequest.save(function(err, result) {
		if(err) {
			console.log("Error creating new request");
			return;
		}
		else {
			console.log("Created new verification request");
			res.json({status: 'success', requestID:newRequest._id});
		}
	});
}

exports.getVerifyStatus = function(req, res) {
	console.log(req.params.id);
	Withdraw.findById(req.params.id, function(err, item) {
		if(err)
			res.json(err);
		else {
			if(item)
				res.json({status:'success', req_status:item.status});
			else
				res.json({status:'none'});
		}
	});
}

exports.updateVerifyStatus = function(req, res) {
	console.log(req.params.id);
	console.log(req.body.new_status);

	Withdraw.findById(req.params.id, function(err, item) {
		item.status = req.body.new_status;
		item.save(function(err, result) {
			if(err)
				res.json(err);
			else
				res.json({status:'success'});
		});
	});

}

exports.updatePicture = function(req, res) {
	console.log(req.params.id);
	console.log(req.body.picture);

	Withdraw.findById(req.params.id, function(err, item) {
		item.picture = req.body.picture;
		item.status = 0;
		item.save(function(err, result) {
			if(err)
				res.json(err);
			else
				res.json({status:'success'});
		});
	});

}

exports.getAllRequests = function(req, res) {
	Withdraw.find({}, function(err, withdraws) {
		if(!err) {
			res.send({status:'success', requests:withdraws});
		}
	});
}

exports.postWithdrawRequest = function(req, res) {
	console.log(JSON.stringify(req.body));

	Withdraw.findById(req.params.id, function(err, request) {
		if(request) {
			var temp = {};
			temp.withdraw_amount = parseFloat(req.body.withdraw_amount);
			temp.balance = parseFloat(req.body.balance);
			temp.total_won = parseInt(req.body.total_won);

			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();
			if(dd<10) {
			    dd='0'+dd;
			} 

			if(mm<10) {
			    mm='0'+mm;
			} 
			today = mm+'/'+dd+'/'+yyyy;

			temp.withdraw_date = today;
			temp.withdraw_process = false;

			request.withdraw_requests.push(temp);

			request.save(function(err, result) {
				if(err) {
					console.log("Error creating new request");
					return;
				}
				else {
					console.log("Created new withdraw request");
					console.log(request.userID);
					User.findById(request.userID, function(err, user) {
						if(user) {
							console.log(JSON.stringify(user));
							user.balance -= parseFloat(req.body.withdraw_amount);
							user.save(function(err) {
								if(!err) {
									res.json({status:'success', balance: user.balance});
								}
							});							
						}
					});	
					//res.json({status: 'success'});
				}
			});
		}
	});	
}

exports.updateWithdrawStatus = function(req, res) {
	console.log(req.params.id);
	console.log(req.body.new_status);

	Withdraw.findById(req.params.id, function(err, item) {
		item.withdraw_requests[req.body.index].withdraw_process = req.body.new_status;
		item.save(function(err, result) {
			if(err)
				res.json(err);
			else {
				/*if(req.body.new_status == true) {
					console.log(item.userID);
					User.findById(item.userID, function(err, user) {
						if(user) {
							console.log(JSON.stringify(user));
							user.balance -= item.withdraw_amount;
							user.save(function(err, result) {
								if(!err) {
									res.json({status:'success', balance: user.balance});
								}
							});							
						}
					});					
				}*/
				res.json({status:'success'});
			}
		});		
	});

}


