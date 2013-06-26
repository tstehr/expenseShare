var application_root = __dirname;

var express = require('express');
var path = require('path');
var mysql = require('mysql');
var _ = require('underscore');
var Q = require('q');

var argv = require('optimist').argv;


var app, pool;

var defaults = {
	sqlHost: 'localhost',
	sqlDB: 'expense_share',
	port: 4242
};

var config = _.extend(defaults, argv);


if (!config.sqlUser && !config.sqlPassword) {
	throw new Error('Please supply mysql username and password. Options: --sqlUser --sqlPassword');
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


// create server
app = express();
app.use(express.bodyParser());
app.use(express.basicAuth('expense', 'share'));
app.use(express.static(path.join(application_root, 'static')));
// Some fake latency for testing
// app.use(function (req, res, next) {
// 	setTimeout(next, (Math.random() + Math.random()) * 2000);
// });
app.use(app.router);


//Show all errors in development
app.use(express.errorHandler({
	dumpExceptions: true, 
	showStack: true 
}));

// setup API-routes
require('./endpoints/months.js').init(app, pool);
require('./endpoints/persons.js').init(app, pool);
require('./endpoints/expenses.js').init(app, pool);
require('./endpoints/participations.js').init(app, pool);

// API default
app.all('/api/*', function(req,res) {
	console.log('Someone tried to access endpoint', req.method, req.params[0]);
	res.send(404);
});

// serve index file to all other requests
app.all('*', function (req, res) {
	res.sendfile(path.join(application_root, 'static/index.html'));
});

app.listen(config.port, function() {
	console.log('Express server listening on port %d in %s mode', config.port, app.settings.env);
});
