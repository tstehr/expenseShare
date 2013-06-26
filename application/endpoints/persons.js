var mysql = require('mysql');
var Q = require('q');

var pool;


var getPersons = function (req, res) {
	Q.nmcall(pool, 'getConnection')
		.then(function (connection) {
			return Q.nmcall(connection, 'query', 'select * from persons')
				.then(function (personData) {
					res.set('Content-type', 'application/json; charset=utf8');
					res.send(JSON.stringify(personData[0]));
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in getPersons');
			console.dir(err);
			res.send(400);
		})
	;
};

var createPerson = function (req, res) {
	Q.nmcall(pool, 'getConnection')
		.then(function (connection) {
			return Q.nmcall(connection, 'query', 'insert into persons(name) values(?)', [req.body.name])
				.then(function (data) {
					res.set('Content-type', 'application/json; charset=utf8');
					res.send(JSON.stringify({
						id: data[0].insertId,
						name: req.body.name
					}));
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function () {
			console.log('Error in createPerson',  arguments);
			res.send(400);
		})
	;
};

var changePerson = function (req, res) {
	var personId = req.params.id;

	Q.nmcall(pool, 'getConnection')
		.then(function (connection) {
			return Q.nmcall(
					connection, 'query', 'update persons set name = ? where id = ?', 
					[req.body.name, personId]
				)
				.then(function (data) {	
					res.set('Content-type', 'application/json; charset=utf8');
					res.send(JSON.stringify({
						id: personId,
						name: req.body.name
					}));				
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function () {
			console.log('Error in changePerson',  arguments);
			res.send(400);
		})
	;
}


module.exports.init = function (app, connectionPool) {
	pool = connectionPool;

	app.get('/api/persons', getPersons);
	// TODO app.get('/api/person/:id')
	app.post('/api/persons', createPerson);
	app.put('/api/persons/:id', changePerson);
	// TODO app.delete('/api/persons')
};