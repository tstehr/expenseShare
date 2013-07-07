var mysql = require('mysql');
var Q = require('q');

var ExpensesHandler = function (socket, pool) {
	this.socket = socket;
	this.pool = pool;

	this.socket.on('expense:read', this.readExpense.bind(this));
	this.socket.on('expense:create', this.createExpense.bind(this));
	this.socket.on('expense:update', this.updateExpense.bind(this));
	this.socket.on('expense:delete', this.deleteExpense.bind(this));
};

ExpensesHandler.prototype.readExpense = function (socketData, callback) {
	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			return Q.nmcall(
					connection, 'query', 'select id, description, expenses.month from expenses where id = ?', 
					[socketData.id]
				)
				.then(function (dbData) {
					var expense = dbData[0][0];
					console.log(expense);
					return [
						Q.resolve(expense), 
						Q.nmcall(
							connection, 'query', 'select * from participations where expense = ?', 
							[expense.id]
						)
					];
				})
				.spread(function (expense, dbData) {
					expense.participations = dbData[0];
					callback(null, expense);
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in readExpense');
			console.error(err);
			callback(null);
		})
	;
};

ExpensesHandler.prototype.createExpense = function (socketData, callback) {
	var socket = this.socket;

	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			// TODO valid month id?
			return Q.nmcall(
					connection, 'query', 'insert into expenses (description, expenses.month) values (?, ?)', 
					[socketData.description, socketData.month]
				)
				.then(function (data) {
					var json = {
						id: data[0].insertId,
						description: socketData.description,
						month: socketData.month
					};

					socket.broadcast.emit('month/' + socketData.month + ':createExpense', json);
					callback(null, json);
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in createExpense');
			console.dir(err);
			callback(null);
		})
	;
};

ExpensesHandler.prototype.updateExpense = function (socketData, callback) {
	var socket = this.socket;

	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			// TODO valid month id?
			return Q.nmcall(
					connection, 'query', 'update expenses set description = ?, month = ? where id = ?', 
					[socketData.description, socketData.month, socketData.id]
				)
				.then(function (data) {
					var json = {
						id: socketData.id,
						description: socketData.description,
						month: socketData.month
					};
					socket.broadcast.emit('expense/' + socketData.id + ':update', json);
					callback(null, json);
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in updateExpense');
			console.dir(err);
			callback(null);
		})
	;
};

ExpensesHandler.prototype.deleteExpense = function (socketData, callback) {
	var socket = this.socket;
	
	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			// TODO valid month id?
			return Q.all(
					Q.nmcall(connection, 'query', 'delete from expenses where id = ?', [socketData.id]),
					Q.nmcall(connection, 'query', 'delete from participations where expense = ?', [socketData.id])
				)
				.then(function (data) {
					socket.broadcast.emit('expense/' + socketData.id + ':delete', true);
					callback(null, true);
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in deleteExpense');
			console.dir(err);
			callback(null);
		})
	;
};


module.exports = function (socket, pool) {
	return new ExpensesHandler(socket, pool);
};