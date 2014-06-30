var application_root = __dirname;

var http = require('http');
var express = require('express');
var connect = require('connect');
var session = require('connect-session');
var socketIo = require('socket.io');
var SessionSockets = require('session.socket.io');
var path = require('path');
var mysql = require('mysql');
var _ = require('underscore');
var Q = require('q');



var personHandler = require('./socketHandlers/PersonHandler');
var expenseHandler = require('./socketHandlers/ExpenseHandler');
var participationHandler = require('./socketHandlers/ParticipationHandler');



var server, app, io, pool, sessionStore, cookieParser;

var config = {
	sqlHost: 'localhost',
	port: 1337,
	staticDir: 'static_dist',
	sessionSecret: Math.round(Math.random() * 1e200).toString(36)
};

_.extend(config, require('./config.json'));


if (!config.sqlUser && !config.sqlPassword) {
	throw new Error('Please supply mysql username and mysql password. ');
}

if (!config.sqlDB) {
	throw new Error('Please supply database name');
}

if (!config.user && !config.password) {
	throw new Error('Please supply username and password. ');
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
sessionStore = new session.session.MemoryStore();

app.use(cookieParser);
app.use(express.session({
	store: sessionStore
}));

app.use(express.bodyParser());
app.use(express.static(path.join(application_root, config.staticDir)));
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
		(req.body.username === config.user && req.body.password === config.password)
	) {
		req.session.loggedIn = true;
		req.session.loggedIn.maxAge = new Date(Date.now() + 3600000),
		res.send(true);
	} else {
		res.send(false);
	}
});

// serve index file to all other requests
app.get('*', function (req, res) {
	res.sendfile(path.join(application_root, config.staticDir + '/index.html'));
});

// create http server using express as listener
server = http.createServer(app);

// create socket
io = socketIo.listen(server);

io.set('log level', 1);

(new SessionSockets(io, sessionStore, cookieParser)).on('connection', function (err, socket, session) {
	console.log(session);
	if (session && session.loggedIn) {
		personHandler(socket, pool);
		expenseHandler(socket, pool);
		participationHandler(socket, pool);
	}
});

server.listen(config.port, function() {
	console.log('Express server listening on port %d in %s mode', config.port, app.settings.env);
});
