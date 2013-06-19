// Module dependencies.
var application_root = __dirname,
	express = require('express'), // Web framework
	path = require('path'), // Utilities for dealing with file paths
	mysql = require('mysql'), // Database
	argv = require('optimist').argv; // arguments


//Connect to mySQL Server
var connect = function(host, user, password){
	var connection = mysql.createConnection({
		host: host,
		user: user,
		password: password
	});
	connection.connect();
	connection.query('use expense_share', function(err,res) {
		if (err) {
			throw err;
		}
	});
	connection.query('set names utf8', function(err,res) {});
	return connection;
};

var connectionWrapper = function () {
	var args = arguments;
	var connection;

	return function () {
		if (
			!connection || !connection._socket || 
			!connection._socket.readable || !connection._socket.writeable
		) {
			connection = connect.apply(this, args);
		}
		return connection;
	}
};

var sendError = function(res){
	res.set('Content-type', 'application/json; charset=utf8');
	res.send('');
};


//Create server
var app, connection;

app = express();

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


//months
app.get('/api/months/:id', function (req, res) {
	var monId = req.params.id;
	connection().query(
		'select id from expense_share.expenses where month = ?',
		[monId],
		function(err,results){
			if(err) {
				sendError(res);
				return;
			}
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
		}
	);
});

//persons
app.get('/api/persons',function(req, res){
	connection().query(
		'select * from expense_share.persons',
		function(err,results){
			if(err) {
				sendError(res);
				return;
			}
			res.set('Content-type', 'application/json; charset=utf8');
			res.send(JSON.stringify(results));
		}
	);
});
app.post('/api/persons',function(req,res){
	connection().query(
		'insert into persons(name) values(?)',
		[req.body.name],
		function(err,results){
			if(err){
				sendError(res);
				return;
			}
			req.body.id = results.insertId;
			res.set('Content-type', 'application/json; charset=utf8');
			res.send(JSON.stringify(req.body));
		}
	);
});
app.get('/api/persons/:id',function(req,res){
	console.log('/api/persons/:id get');
});
app.put('/api/persons/:id',function(req,res){
	connection().query(
		'update expense_share.persons set name = ? where id = ?',
		[req.body.name,req.body.id],
		function(err,result){
			if(err){
				sendError(res);
				return;
			}
		}
	);
	res.set('Content-type', 'application/json; charset=utf8');
	res.send(JSON.stringify(req.body));
});
app.delete('/api/persons/:id',function(req,res){
//TODO: Sinvolles delete, da die personen aus dem System nicht wieder entfernt werden können

	//connection().query(
		//'delete from expense_share.persons where id = ?',
		//[req.params.id],
		//function(err,result){console.log(err);}
	//);
	res.set('Content-type', 'application/json; charset=utf8');
	res.send(JSON.stringify(''));
});

//expenses
app.post('/api/expenses',function(req,res){
	connection().query(
		'insert into expense_share.expenses (description,expenses.month) values (?,?)',
		[req.body.description,req.body.month],
		function(err,result){
			if(err){
				sendError(res);
				return;
			}
			req.body.id = result.insertId;
			delete req.body.participations;
			res.set('Content-type', 'application/json; charset=utf8');
			res.send(JSON.stringify(req.body));
		}
	);
});
app.get('/api/expenses/:id',function(req, res){
	var exId = req.params.id;
	connection().query(
		'select id,description from expense_share.expenses where id=?',
		[exId],
		function(err,exp){
			if (err || exp.length == 0) {
				sendError(res);
				return;
			}
			var data = {
				id : exp[0].id,
				description : exp[0].description,
				participations : []
			};
			connection().query(
				'select id from expense_share.participations where expense=?',
				[exId],
				function(err,part){
					if(err) {
						sendError(res);
						return;
					}
					part.forEach(function(element, index){
					data.participations[index] = element.id;
				}
			);
			res.set('Content-type', 'application/json; charset=utf8');
			res.send(JSON.stringify(data));
		});
	});
});
app.put('/api/expenses/:id',function(req,res){
	connection().query(
		'update expense_share.expenses set description=?, expenses.month=? where id=?',
		[req.body.description, req.body.month, req.body.id],
		function(err,results){
			if(err) {
				sendError(res);
				return;
			}
			res.set('Content-type', 'application/json; charset=utf8');
			res.send(JSON.stringify(req.body));
		}
	);
});
app.delete('/api/expenses/:id',function(req,res){
	var delId = req.params.id;
	connection().query(
		'delete from expense_share.expenses where id = ?',
		[req.params.id],
		function(err,result){
			if(err){
				sendError(res);
				return;
			}
		}
	);
	connection().query(
		'delete from expense_share.participations where expense = ?',
		[req.params.id],
		function(err,result){
			if(err){
				sendError(res);
				return;
			}
		}
	);
	res.set('Content-type', 'application/json; charset=utf8');
	res.send('');
});

//participations
app.post('/api/participations',function(req,res){
	connection().query(
		'insert into expense_share.participations (person,expense,amount,participating) values(?,?,?,?)',
		[req.body.person,req.body.expense,req.body.amount,req.body.participating],
		function(err,result){
			if(err) {
				sendError(res);
				return;
			}
			req.body.id = result.insertId;
			res.set('Content-type', 'application/json; charset=utf8');
			res.send(JSON.stringify(req.body));
		}
	);
});
app.get('/api/participations/:id',function(req,res){
	connection().query('select * from expense_share.participations where id=?', [req.params.id], function(err, results){
		if(err) {
			sendError(res);
			return;
		}
		res.set('Content-type', 'application/json; charset=utf8');
		res.send(JSON.stringify(results[0]));
	});
});
app.put('/api/participations/:id',function(req,res){
	connection().query(
		'update expense_share.participations set participating = ?, amount = ?, person = ?, expense = ? where id = ?',
		[req.body.participating,req.body.amount,req.body.person,req.body.expense,req.body.id],
		function(err, result){
			if(err){
				sendError(res);
				return;
			}
			res.set('Content-type', 'application/json; charset=utf8');
			res.send(JSON.stringify(req.body));
		}
	);
});
app.delete('/api/participations/:id',function(req,res){
	connection().query(
		'delete from expense_share.participations where id = ?',
		[req.params.id],
		function(err, result){
			if(err){
				sendError(res);
				return;
			}
			res.set('Content-type', 'application/json; charset=utf8');
			res.send('');
		}
	);
});

app.all('/api/*', function(req,res){
	sendError(res);
});

//default
app.all('*', function (req, res) {
	res.sendfile(path.join(application_root, 'site/index.html'));
});

try {
	if (!argv.sqlUser && !argv.sqlPassword) {
		throw new Error('Please supply mysql username and password. Options: --sqlUser --sqlPassword');
	}
	connection = connectionWrapper(argv.sqlServer || 'localhost', argv.sqlUser, argv.sqlPassword);

	app.listen(4242, function() {
		console.log('Express server listening on port %d in %s mode', 4242, app.settings.env);
	});
} catch (e) {
	console.log(e);
}
