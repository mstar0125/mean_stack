var express = require('express')
var app = express()
var DeviceToken = require('./models/deviceToken.js')

var pushserverurl = 'gateway.push.apple.com';
var	pushcert = 'app/NewProdPuntrPushCert.pem';
var	pushkey = 'app/NewProdPuntrPushKey.pem';

// var pushserverurl = 'gateway.sandbox.push.apple.com';
// var pushcert = 'app/NewDevPuntrPushCert.pem';
// var pushkey = 'app/NewDevPuntrPushKey.pem';

var PushServer = new function(){
	this.apn = require('apn');
	this.apnOptions;
	this.apnConnection;

	this.gcm = require('node-gcm');
	this.server_access_key;
	this.sender;
	this.init = function(){

		//----APPLE PUSH SERVICES----////////
		console.log("Push Server URL:" + pushserverurl);
		this.apnOptions = {
			cert: pushcert,
			key: pushkey,
			gateway: pushserverurl,
			passphrase: "Puntr88"
		};
		this.apnConnection = new this.apn.Connection(this.apnOptions);
		this.apnConnection.on('connected', function(){ console.log("----Push Server Connected!----")});
		this.apnConnection.on('error', function(error){ console.log(error)});


		//-----GOOGLE CLOUD MESSAGING-----///		
		this.server_access_key = "";
		this.sender = new this.gcm.Sender(this.server_access_key);
	}
	this.send = function(deviceType, tokenId, badge_num, message, payload){
		if (deviceType == 'iOS') {
			console.log("sending iOS push notification");
			var deviceToken = tokenId;
			var myDevice = new this.apn.Device(deviceToken);
			var note = new this.apn.Notification();
			note.expiry = Math.floor(Date.now() / 1000) + 10800;// Expires 3 hour from now.
			note.alert = message;
			note.badge = badge_num;
			note.sound = "default";
			if(payload)
				note.payload = payload;
			this.apnConnection.pushNotification(note, myDevice);
		}else if(deviceType.toUpperCase() == 'ANDROID'){
			// var registrationIds = [];
			// registrationIds.push(tokenId);
			// var note = new gcm.Message({
			// 	collapseKey:'Puntr88',
			// 	delayWhileIdle:true,
			// 	timeToLive:1,
			// 	data:{
			// 		type:type,
			// 		id:id
			// 	},
			// 	notification: {
			//         title: "Puntr",
			//         icon: "ic_launcher",
			//         body: message
			//     }
			// });
			// this.sender.send(note, { deviceTokens: registrationIds }, 2 ,function (err, result) {
		 //    	console.log(result);
			// });
		}
	}
}

PushServer.init();

exports.PushServer = PushServer;

exports.anyTestFunction = function(req, res){	
	console.log("Testing PushNotification...");
	PushServer.send('iOS', '20f098a9d1f28f2a5349b5dafca06cadaa976eca3faca68f68086622a06bfaf1', 1, "TEST");
	console.log("--- Test Push Notification Sent! ---");
	res.json({status:'success'});
}