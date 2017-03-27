var jwt = require('express-jwt');
var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});


var mongoose   = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/puntrDB_hybrid');
mongoose.connect('mongodb://alexcardo:mongoalex@127.0.0.1:27017/puntrDB')
var db = mongoose.connection;
	db.on('error', function(err){
		console.log('PuntrDB connection failed with error:', err);
	});
	db.once('open', function(){
		console.log('Connected to PuntrDB on Localhost.');
	})

var admin = require('./authentication.js');
var users = require('./users.js');
var leagues = require('./leagues.js');
var rankings = require('./rankings.js');
var prizes = require('./prizes.js');
var withdraws = require('./withdraws.js');
var challenges = require('./challenges.js');
var notifications = require('./notifications.js');
var proxy = require('./proxy.js');
var US_leagues = require('./US_leagues.js');
var US_rankings = require('./US_rankings.js');
var US_prizes = require('./US_prizes.js');
var pushnotification = 	require('./pushnotification.js');

module.exports = function(router) {

	// ROUTES FOR OUR API
	// =============================================================================

	// middleware to use for all requests
	router.use(function(req, res, next) {
		// do logging
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	router.get('/', function(req, res) {
		res.sendfile('./public/index.html');
	});

	// proxy router
	router.route('/proxy')
		.get(proxy.getData)

	router.route('/push')
		.get(pushnotification.anyTestFunction);
	router.route('/us/push')
		.get(pushnotification.anyTestFunction);

	router.route('/register')
		.post(admin.register);
	router.route('/login')
		.post(admin.login);

		
	router.route('/user/register')
		.post(users.register);
	router.route('/us/user/register')
		.post(users.register);
	router.route('/user/:id')
		.get(users.getUserById);
	router.route('/us/user/:id')
		.get(users.getUserById);
	router.route('/user/:name/:fbID')
		.get(users.getUserByInfo);
	router.route('/us/user/:name/:fbID')
		.get(users.getUserByInfo);
	router.route('/users/all')
		.get(users.getAllUsers);
	router.route('/us/users/all')
		.get(users.getAllUsers);
	router.route('/users/fbList')
		.get(users.getAllFaceBookID);
	router.route('/us/users/fbList')
		.get(users.getAllFaceBookID);

	router.route('/deviceToken')
		.post(users.registerDeviceToken);
	router.route('/us/deviceToken')
		.post(users.registerDeviceToken);	
	router.route('/deviceToken/clearBadge/:OS/:userID')
		.post(users.clearBadge);	
	router.route('/us/deviceToken/clearBadge/:OS/:userID')
		.post(users.clearBadge);	

	router.route('/user/location/:id')
		.post(users.updateUserLocationById);
	router.route('/us/user/location/:id')
		.post(users.updateUserLocationById);


	router.route('/league/:index')
		.get(leagues.getLeagueDataByIndex);

	router.route('/league/:index')
		.post(leagues.updateLeagueDataByIndex);

	router.route('/league/pickable/:userId/:leagueIndex')
		.get(leagues.getPickableFixtureData);

	router.route('/league/:leagueId/expect')
		.post(leagues.postExpectData);

	router.route('/league/:userId/:weekNO/expect')
		.get(leagues.getExpectData);

	router.route('/league/:userId/expect')
		.get(leagues.getUserExpectData);

	router.route('/league/:id/expect/report')
		.get(leagues.getExpectDataById);


	router.route('/us/league/:index')
		.get(US_leagues.getLeagueDataByIndex);

	router.route('/us/league/:index')
		.post(US_leagues.updateLeagueDataByIndex);

	router.route('/us/league/pickable/:userId/:leagueIndex')
		.get(US_leagues.getPickableFixtureData);

	router.route('/us/league/:leagueId/expect')
		.post(US_leagues.postExpectData);

	router.route('/us/league/:userId/:weekNO/expect')
		.get(US_leagues.getExpectData);

	router.route('/us/league/:userId/expect')
		.get(US_leagues.getUserExpectData);
	
	router.route('/us/league/:id/expect/report')
		.get(US_leagues.getExpectDataById);


	router.route('/ranking/city/:userId')
		.get(rankings.getRankingByCityWithoutLeague);

	router.route('/ranking/country/:userId')
		.get(rankings.getRankingByCountryWithoutLeague);

	router.route('/ranking/all/:userId')
		.get(rankings.getRankingByAllWithoutLeague);

	router.route('/ranking/facebook/:userId')
		.get(rankings.getRankingByFacebookWithoutLeague);



	router.route('/ranking/city/:userId/all/list')
		.get(rankings.getRankingByCityByLeagueList);

	router.route('/ranking/country/:userId/all/list')
		.get(rankings.getRankingByCountryByLeagueList);

	router.route('/ranking/all/:userId/all/list')
		.get(rankings.getRankingByAllByLeagueList);

	router.route('/ranking/facebook/:userId/all/list')
		.get(rankings.getRankingByFacebookByLeagueList);

	router.route('/status/:userId')
		.get(rankings.getUserStatus);

	
	router.route('/us/ranking/city/:userId')
		.get(US_rankings.getRankingByCityWithoutLeague);

	router.route('/us/ranking/country/:userId')
		.get(US_rankings.getRankingByCountryWithoutLeague);

	router.route('/us/ranking/all/:userId')
		.get(US_rankings.getRankingByAllWithoutLeague);

	router.route('/us/ranking/facebook/:userId')
		.get(US_rankings.getRankingByFacebookWithoutLeague);



	router.route('/us/ranking/city/:userId/all/list')
		.get(US_rankings.getRankingByCityByLeagueList);

	router.route('/us/ranking/country/:userId/all/list')
		.get(US_rankings.getRankingByCountryByLeagueList);

	router.route('/us/ranking/all/:userId/all/list')
		.get(US_rankings.getRankingByAllByLeagueList);

	router.route('/us/ranking/facebook/:userId/all/list')
		.get(US_rankings.getRankingByFacebookByLeagueList);

	router.route('/us/status/:userId')
		.get(US_rankings.getUserStatus);



	router.route('/prizepool/:league_index')
		.post(prizes.updatePoolData);

	router.route('/prizepool')
		.get(prizes.getPrizePoolData);

	router.route('/prizepool/:league_index')
		.get(prizes.getLeaguePoolData);



	router.route('/us/prizepool/:league_index')
		.post(US_prizes.updatePoolData);

	router.route('/us/prizepool')
		.get(US_prizes.getPrizePoolData);

	router.route('/us/prizepool/:league_index')
		.get(US_prizes.getLeaguePoolData);



	router.route('/verify/:userId')
		.post(withdraws.postVerifyRequest);
	router.route('/us/verify/:userId')
		.post(withdraws.postVerifyRequest);

	router.route('/verify/:id/status')
		.get(withdraws.getVerifyStatus);
	router.route('/us/verify/:id/status')
		.get(withdraws.getVerifyStatus);

	router.route('/verify/:id/update/status')
		.post(withdraws.updateVerifyStatus);
	router.route('/us/verify/:id/update/status')
		.post(withdraws.updateVerifyStatus);

	router.route('/verify/:id/update/picture')
		.post(withdraws.updatePicture);
	router.route('/us/verify/:id/update/picture')
		.post(withdraws.updatePicture);

	router.route('/verify/all')
		.get(withdraws.getAllRequests);
	router.route('/us/verify/all')
		.get(withdraws.getAllRequests);

	router.route('/withdraw/:id')
		.post(withdraws.postWithdrawRequest);
	router.route('/us/withdraw/:id')
		.post(withdraws.postWithdrawRequest);

	router.route('/withdraw/:id/update/status')
		.post(withdraws.updateWithdrawStatus);
	router.route('/us/withdraw/:id/update/status')
		.post(withdraws.updateWithdrawStatus);		


	/* -----------  APIs V2.0 -------------*/
	router.route('/v2/ranking/city/:userId')
		.get(rankings.getRankingByCityWithoutLeagueV2);

	router.route('/v2/ranking/country/:userId')
		.get(rankings.getRankingByCountryWithoutLeagueV2);

	router.route('/v2/ranking/all/:userId')
		.get(rankings.getRankingByAllWithoutLeagueV2);

	router.route('/v2/ranking/facebook/:userId')
		.get(rankings.getRankingByFacebookWithoutLeagueV2);



	router.route('/v2/ranking/city/:userId/all/list')
		.get(rankings.getRankingByCityByLeagueListV2);

	router.route('/v2/ranking/country/:userId/all/list')
		.get(rankings.getRankingByCountryByLeagueListV2);

	router.route('/v2/ranking/all/:userId/all/list')
		.get(rankings.getRankingByAllByLeagueListV2);

	router.route('/v2/ranking/facebook/:userId/all/list')
		.get(rankings.getRankingByFacebookByLeagueListV2);

	router.route('/v2/status/:userId')
		.get(rankings.getUserStatusV2);


	router.route('/us/v2/ranking/city/:userId')
		.get(US_rankings.getRankingByCityWithoutLeagueV2);

	router.route('/us/v2/ranking/country/:userId')
		.get(US_rankings.getRankingByCountryWithoutLeagueV2);

	router.route('/us/v2/ranking/all/:userId')
		.get(US_rankings.getRankingByAllWithoutLeagueV2);

	router.route('/us/v2/ranking/facebook/:userId')
		.get(US_rankings.getRankingByFacebookWithoutLeagueV2);



	router.route('/us/v2/ranking/city/:userId/all/list')
		.get(US_rankings.getRankingByCityByLeagueListV2);

	router.route('/us/v2/ranking/country/:userId/all/list')
		.get(US_rankings.getRankingByCountryByLeagueListV2);

	router.route('/us/v2/ranking/all/:userId/all/list')
		.get(US_rankings.getRankingByAllByLeagueListV2);

	router.route('/us/v2/ranking/facebook/:userId/all/list')
		.get(US_rankings.getRankingByFacebookByLeagueListV2);

	router.route('/us/v2/status/:userId')
		.get(US_rankings.getUserStatusV2);


	router.route('/v2/challenge/getWeeks/:leagueType/:leagueID')
		.get(challenges.getChallengableWeeks);
	router.route('/v2/challenge/request/:fromID/:toID/:leagueType/:leagueID/:start/:duration')
		.post(challenges.postRequest);
	router.route('/v2/challenge/accept/:fromID/:toID/:leagueType/:leagueID/:start/:duration')
		.post(challenges.acceptRequest);
	router.route('/v2/challenge/decline/:fromID/:toID')
		.post(challenges.declineRequest);
	router.route('/v2/challenge/getUserChallenges/:userID/:leagueType')
		.get(challenges.getUserChallenges);

	router.route('/us/v2/challenge/getWeeks/:leagueType/:leagueID')
		.get(challenges.getChallengableWeeks);
	router.route('/us/v2/challenge/request/:fromID/:toID/:leagueType/:leagueID/:start/:duration')
		.post(challenges.postRequest);
	router.route('/us/v2/challenge/accept/:fromID/:toID/:leagueType/:leagueID/:start/:duration')
		.post(challenges.acceptRequest);
	router.route('/us/v2/challenge/decline/:fromID/:toID')
		.post(challenges.declineRequest);
	router.route('/us/v2/challenge/getUserChallenges/:userID/:leagueType')
		.get(challenges.getUserChallenges);

	router.route('/v2/notification/pending/:userId')
		.get(notifications.getPendingNotifications);
	router.route('/us/v2/notification/pending/:userId')
		.get(notifications.getPendingNotifications);

	router.route('/v2/notification/update/:notificationId')
		.post(notifications.updateNotificationStatus);
	router.route('/us/v2/notification/update/:notificationId')
		.post(notifications.updateNotificationStatus);

	router.route('/v2/users/all')
		.get(users.getAllUsersWithAvailability);
	router.route('/v2/us/users/all')
		.get(users.getAllUsersWithAvailability);
};