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
	return connection;
//	console.log('Connecting to Server');
//	connection.connect();
//	connection.query('insert into test.hallo values("Ulli",2)',function(err,rows,fields){
//		if(err) throw err;
//		console.log(rows);
//	});
//	connection.query('select * from test.hallo as result', function(err,rows,fields){
//		if(err) throw err;
//		console.log(rows);
//	});
//	connection.end();
//	console.log('Connection terminatet');
};
//Start server
var port = 4242;

app.listen(port, function() {
	app.connection = connect(this);
	connection.connect();
//	var app.connection = connection;
//	connection.end();
	console.log('Express server listening on port %d in %s mode', port, app.settings.env );
	
});



var createRestInterface = function(app, name, querry){
	console.log("Createing RI with querry " + querry + " for " + name);
		var data = app.connection.query(querry);
	app.get('/api/' + name, function(res, req){
		
		res.set('Content-type', 'application/json; charset=utf8');
		res.send(JSON.stringify(data));
	});
		console.log(data);
};



createRestInterface(app,"persons","select * from expense_share.persons");
createRestInterface(app,"expenses","select * from expense_share.expenses");






