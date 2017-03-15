// BASE SETUP
// =============================================================================

// call the packages we need
var express    		= require('express');
var bodyParser 		= require('body-parser');
var cookieParser 	= require('cookie-parser');
var methodOverride 	= require('method-override');
var app        		= express();
var morgan     		= require('morgan');
var passport   		= require('passport');
// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({limit: '500mb', extended: true })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json({limit: '500mb'}));

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// Use the session middleware
app.use(cookieParser());

//-------------
var port     = process.env.PORT || 8080; // set our port

// CREATE OUR ROUTER
var router = express.Router();
require('./app/routes.js')(router);

require('./app/passport.js');
app.use(passport.initialize());

// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// error handlers
// Catch unauthorised errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  }
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Request on port:' + port);
exports = module.exports = app;