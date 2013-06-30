var mysql = require('mysql');
var Q = require('q');

var MonthsHandler = function (socket, pool) {
	this.socket = socket;
	this.pool = pool;

	this.socket.on('month:read', this.readMonth.bind(this));
};

MonthsHandler.prototype.readMonth = function (socketData, callback) {
	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			// TODO month id valid?
			return Q.nmcall(connection, 'query', 'select * from expenses where month = ?', [socketData.id])
				.then(function (dbData) {
					var expenses = dbData[0];
					var promises = [Q.resolve(expenses)];
					expenses.forEach(function (expense) {
						promises.push(Q.nmcall(
							connection, 'query', 
							'select * from participations where expense = ?', [expense.id]
						));
					});
					return promises;
				})
				.spread(function (expenses) {
					var partsDbData = Array.prototype.slice.call(arguments, 1);
					partsDbData.forEach(function (dbData, i) {
						expenses[i].participations = dbData[0];
					});
					callback(null, {
						id: socketData.id,
						expenses: expenses
					});
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function () {
			console.log('Error in readMonth',  arguments);
			callback(null);
		})
	;
};


module.exports = function (socket, pool) {
	return new MonthsHandler(socket, pool);
};

