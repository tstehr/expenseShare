var application_root = __dirname;

var http = require('http');
var express = require('express');
var connect = require('connect');
var socketIo = require('socket.io');
var SessionSockets = require('session.socket.io');
var path = require('path');
var mysql = require('mysql');
var _ = require('underscore');
var Q = require('q');

var argv = require('optimist').argv;

var personsHandler = require('./socketHandlers/PersonsHandler');
var monthsHandler = require('./socketHandlers/MonthsHandler');
var expensesHandler = require('./socketHandlers/ExpensesHandler');
var participationsHandler = require('./socketHandlers/ParticipationsHandler');



var server, app, io, pool, sessionStore, cookieParser;

var defaults = {
	sqlHost: 'localhost',
	sqlDB: 'expense_share',
	port: 4242
};

var config = _.extend(defaults, argv);


if (!config.sqlUser && !config.sqlPassword && !config.sessionSecret) {
	throw new Error('Please supply mysql username, mysql password and session secret. Options: --sqlUser --sqlPassword --sessionSecret');
}

pool = mysql.createPool({
	host: config.sqlHost,
	user: config.sqlUser,
	password: config.sqlPassword,
	connectionLimit: 5
});

pool.on('connection', function (connection) {
	Q.nmcall(connection, 'query', 'use ' + config.sqlDB)
		.then(function () {
			return Q.nmcall(connection, 'query', 'set names utf8');
		})
		.then(
			function () {
				console.log('New connection initialized.');
			}, 
			function (err) {
				console.log('Failed to initialize connection!');
				console.log(err);
			}
		)
	;
});

// create express server
app = express();

cookieParser = express.cookieParser(config.sessionSecret);
sessionStore = new connect.middleware.session.MemoryStore();

app.use(cookieParser);
app.use(express.session({
	store: sessionStore
}));

app.use(express.bodyParser());
app.use(express.static(path.join(application_root, 'static')));
app.use(app.router);

//Show all errors in development
app.use(express.errorHandler({
	dumpExceptions: true, 
	showStack: true 
}));

// respond to login requests
app.get('/auth', function (req, res) {
	res.send(!!req.session.loggedIn);
});
app.post('/auth', function (req, res) {
	if (
		req.session.loggedIn || 
		(req.body.username === 'expense' && req.body.password === 'share')
	) {
		req.session.loggedIn = true;
		res.send(true);
	} else {
		res.send(false);
	}
});

// serve index file to all requests
app.get('*', function (req, res) {
	res.sendfile(path.join(application_root, 'static/index.html'));
});

// create http server using express as listener
server = http.createServer(app);

// create socket
io = socketIo.listen(server);

(new SessionSockets(io, sessionStore, cookieParser)).on('connection', function (err, socket, session) {
	console.log(session);
	if (session && session.loggedIn) {
		monthsHandler(socket, pool);
		personsHandler(socket, pool);
		expensesHandler(socket, pool);
		participationsHandler(socket, pool);
	}
});

server.listen(config.port, function() {
	console.log('Express server listening on port %d in %s mode', config.port, app.settings.env);
});
