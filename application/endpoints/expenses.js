var mysql = require('mysql');
var Q = require('q');

var pool;


var createExpense = function (req, res) {
	Q.nmcall(pool, 'getConnection')
		.then(function (connection) {
			// TODO valid month id?
			return Q.nmcall(connection, 'query', 'insert into expenses (description, expenses.month) values (?, ?)', [req.body.description, req.body.month])
				.then(function (data) {
					res.set('Content-type', 'application/json; charset=utf8');
					res.send(JSON.stringify({
						id: data[0].insertId,
						description: req.body.description,
						month: req.body.month
					}));
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in createExpense');
			console.dir(err);
			res.send(400);
		})
	;
};

var changeExpense = function (req, res) {
	var expenseId = req.params.id;

	Q.nmcall(pool, 'getConnection')
		.then(function (connection) {
			// TODO valid month id?
			return Q.nmcall(
					connection, 'query', 'update expenses set description = ?, month = ? where id = ?', 
					[req.body.description, req.body.month, expenseId]
				)
				.then(function (data) {
					res.set('Content-type', 'application/json; charset=utf8');
					res.send(JSON.stringify({
						id: expenseId,
						description: req.body.description,
						month: req.body.month
					}));
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in changeExpense');
			console.dir(err);
			res.send(400);
		})
	;
};

var deleteExpense = function (req, res) {
	var expenseId = req.params.id;

	Q.nmcall(pool, 'getConnection')
		.then(function (connection) {
			// TODO valid month id?
			return Q.all(
					Q.nmcall(connection, 'query', 'delete from expenses where id = ?', [expenseId]),
					Q.nmcall(connection, 'query', 'delete from participations where expense = ?', [expenseId])
				)
				.then(function (data) {
					res.set('Content-type', 'application/json; charset=utf8');
					res.send(200);
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in deleteExpense');
			console.dir(err);
			res.send(400);
		})
	;
};


module.exports.init = function (app, connectionPool) {
	pool = connectionPool;

	// TODO app.get('/api/expenses/:id', ...)
	app.post('/api/expenses', createExpense);
	app.put('/api/expenses/:id', changeExpense);
	app.delete('/api/expenses/:id', deleteExpense);
};