// Module dependencies.
var application_root = __dirname,
	express = require('express'), //Web framework
	path = require('path'), //Utilities for dealing with file paths
	mysql = require('mysql'); //Database access

//Create server
var app = express();

// Configure server

//parses request body and populates request.body
app.use(express.bodyParser());

//Where to serve static content
app.use(express.static(path.join(application_root, 'site')));

//perform route lookup based on url and HTTP method
app.use(app.router);

//Show all errors in development
app.use(express.errorHandler({
	dumpExceptions: true, 
	showStack: true 
}));

//Connect to mySQL Server
var connect = function(app){
	
	
//	console.log(mysql);
	var connection = mysql.createConnection({
		host : 'localhost',
		user : 'expense',
		password : 'share'
	});
	console.log('Connecting to SQL - Server');
	connection.connect();
	return connection;
};

var connection = connect(this);

app.get('/api/months/:id', function (req, res) {
	console.log('Data asked');
	var monId = req.params.id;
	connection.query('select * from expense_share.expenses where mon = ?',monId,function(err,results){
		if(err) throw err;
		var data = {
			id: monId,
			expenses: results
		};
		res.set('Content-type', 'application/json; charset=utf8');
		res.send(JSON.stringify(data));
	});
});



app.get('*', function (req, res) {
	res.sendfile(path.join(application_root, 'site/index.html'));
});
//Start server
var port = 4242;

app.listen(port, function() {
	console.log('Express server listening on port %d in %s mode', port, app.settings.env );
	
});



var createRestInterface = function(app, name, query){
	console.log("Createing RI with query " + query + " for " + name);
	connection.query(query, function(err,data,fiedls){
		if(err) throw err;
		console.log(data);
		app.get('/api/' + name, function(res, req){
			res.set('Content-type', 'application/json; charset=utf8');
			res.send(JSON.stringify(data));
		});
	});
};









