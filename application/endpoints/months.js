var mysql = require('mysql');
var Q = require('q');

var pool;

var getMonth = function (req, res) {
	var monthId = req.params.id;

	Q.nmcall(pool, 'getConnection')
		.then(function (connection) {
			return Q.nmcall(connection, 'query', 'select * from expenses where month = ?', [monthId])
				.then(function (expensesData) {
					var expenses = expensesData[0];
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
					var partsData = Array.prototype.slice.call(arguments, 1);
					partsData.forEach(function (partData, i) {
						expenses[i].participations = partData[0];
					});
					res.set('Content-type', 'application/json; charset=utf8');
					res.send(JSON.stringify({
						id: monthId,
						expenses: expenses
					}));
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function () {
			console.log('Error in getMonth',  arguments);
			res.send(400);
		})
	;
};


module.exports.init = function (app, connectionPool) {
	pool = connectionPool;
	app.get('/api/months/:id', getMonth);
};

