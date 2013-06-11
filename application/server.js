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

app.use(express.basicAuth('expense', 'share'));

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
	var connection = mysql.createConnection({
		host : 'localhost',
		user : 'expense',
		password : 'share'
	});
	console.log('Connecting to SQL - Server');
	connection.connect();
	connection.query('use expense_share',function(err,res){});
	connection.query('set names utf8',function(err,res){});
	return connection;
};

var connection = connect(this);
/*
app.get('',function(req,res){});
app.post('',function(req,res){});
app.get(':id',function(req,res){});
app.put(':id',function(req,res){});
app.delete(':id',function(req,res){});
*/
//months

//TODO - ERROR Handling

app.get('/api/months/:id', function (req, res) {
	var monId = req.params.id;
	connection.query('select id from expense_share.expenses where month = ?',monId,function(err,results){
		if(err) throw err;
		//split results to an array of int
		var exp = [];
		results.forEach(function(element, index, array){
			exp[index] = element.id;
		});
		var data = {
			id: monId,
			expenses: exp
		};
		res.set('Content-type', 'application/json; charset=utf8');
		res.send(JSON.stringify(data));
	});
});

//persons
app.get('/api/persons',function(req, res){
	connection.query('select * from expense_share.persons',function(err,results){
		if(err) throw err;
		res.set('Content-type', 'application/json; charset=utf8');
		res.send(JSON.stringify(results));
	});
});
app.post('/api/persons',function(req,res){
	connection.query(
		'insert into persons(name) values(?)',
		[req.body.name],
		function(err,results){
		req.body.id = results.insertId;
		res.set('Content-type', 'application/json; charset=utf8');
		res.send(JSON.stringify(req.body));
	});
});
app.get('/api/persons/:id',function(req,res){
	console.log('/api/persons/:id get');
});
app.put('/api/persons/:id',function(req,res){
	connection.query(
		'update expense_share.persons set name = ? where id = ?',
		[req.body.name,req.body.id],
		function(err,result){}
	);
	res.set('Content-type', 'application/json; charset=utf8');
	res.send(JSON.stringify(req.body));
});
app.delete('/api/persons/:id',function(req,res){
//TODO: Sinvolles delete, da die personen aus dem System nicht wieder entfernt werden können

	//connection.query(
		//'delete from expense_share.persons where id = ?',
		//[req.params.id],
		//function(err,result){console.log(err);}
	//);
	res.set('Content-type', 'application/json; charset=utf8');
	res.send(JSON.stringify(''));
});

//expenses
app.post('/api/expenses',function(req,res){
	connection.query(
				'insert into expense_share.expenses (description,expenses.month) values (?,?)',
				[req.body.description,req.body.month],
				function(err,result){
		req.body.id = result.insertId;
		delete req.body.participations;
		res.set('Content-type', 'application/json; charset=utf8');
		res.send(JSON.stringify(req.body));
	});
});
app.get('/api/expenses/:id',function(req, res){
	var exId = req.params.id;
	connection.query('select id,description from expense_share.expenses where id=?',exId,function(err,exp){
		if(err) throw err;
		var data = {
			id : exp[0].id,
			description : exp[0].description,
			participations : []
		};
		connection.query('select id from expense_share.participations where expense=?',exId,function(err,part){
			if(err) throw err;
			part.forEach(function(element, index){
				data.participations[index] = element.id;
			});
			res.set('Content-type', 'application/json; charset=utf8');
			res.send(JSON.stringify(data));
		});
	});
});
app.put('/api/expenses/:id',function(req,res){
	connection.query(
		'update expense_share.expenses set description=?, expenses.month=? where id=?',
		[req.body.description, req.body.month, req.body.id],
		function(err,results){
				if(err) {
					throw err;
				}
				res.set('Content-type', 'application/json; charset=utf8');
				res.send(JSON.stringify(req.body));
		}
	);
});
app.delete('/api/expenses/:id',function(req,res){
	var delId = req.params.id;
	connection.query(
		'delete from expense_share.expenses where id = ?',
		[req.params.id],
		function(err,result){if(err) throw err;}
	);
	connection.query(
		'delete from expense_share.participations where expense = ?',
		[req.params.id],
		function(err,result){if(err) throw err;}
	);
	res.set('Content-type', 'application/json; charset=utf8');
	res.send('');
});

//participations
app.post('/api/participations',function(req,res){
	connection.query(
		'insert into expense_share.participations (person,expense,amount,participating) values(?,?,?,?)',
		[req.body.person,req.body.expense,req.body.amount,req.body.participating],
		function(err,result){
			if(err) throw err;
			req.body.id = result.insertId;
			res.set('Content-type', 'application/json; charset=utf8');
			res.send(JSON.stringify(req.body));
		}
	);
});
app.get('/api/participations/:id',function(req,res){
	connection.query('select * from expense_share.participations where id=?', [req.params.id], function(err, results){
		if(err) throw err;
		res.set('Content-type', 'application/json; charset=utf8');
		res.send(JSON.stringify(results[0]));
	});
});
app.put('/api/participations/:id',function(req,res){
	connection.query(
		'update expense_share.participations set participating = ?, amount = ?, person = ?, expense = ? where id = ?',
		[req.body.participating,req.body.amount,req.body.person,req.body.expense,req.body.id],
		function(err, res){
			if(err) throw err;
		}
	);
	res.set('Content-type', 'application/json; charset=utf8');
	res.send(JSON.stringify(req.body));
});
app.delete('/api/participations/:id',function(req,res){
	connection.query(
		'delete from expense_share.participations where id = ?',
		[req.params.id],
		function(err, res){}
	);
	res.set('Content-type', 'application/json; charset=utf8');
	res.send('');
});

//default
app.get('*', function (req, res) {
	res.sendfile(path.join(application_root, 'site/index.html'));
});

//Start server
var port = 4242;

app.listen(port, function() {
	console.log('Express server listening on port %d in %s mode', port, app.settings.env );
	
});
