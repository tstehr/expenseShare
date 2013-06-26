var mysql = require('mysql');
var Q = require('q');

var pool;

/*
//participations
app.delete('/api/participations/:id',function(req,res){
	connection.query(
		'delete from ' + database + '.participations where id = ?',
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


*/


var createParticipation = function (req, res) {
	Q.nmcall(pool, 'getConnection')
		.then(function (connection) {
			// TODO valid person id, expense id?
			return Q.nmcall(
					connection, 'query', 'insert into participations (person,expense,amount,participating) values (?, ?, ?, ?)',
					[req.body.person, req.body.expense, req.body.amount, req.body.participating]
				)
				.then(function (data) {
					res.set('Content-type', 'application/json; charset=utf8');
					res.send(JSON.stringify({
						id: data[0].insertId,
						person: req.body.person,
						expense: req.body.expense,
						amount: req.body.amount,
						participating: req.body.participating
					}));
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in createParticipation');
			console.dir(err);
			res.send(400);
		})
	;
};

var changeParticipation = function (req, res) {
	var participationId = req.params.id;

	Q.nmcall(pool, 'getConnection')
		.then(function (connection) {
			// TODO valid person id, expense id?
			return Q.nmcall(
					connection, 'query', 'update participations set person = ?, expense = ?, amount = ?, participating = ? where id = ?',
					[req.body.person, req.body.expense, req.body.amount, req.body.participating, participationId]
				)
				.then(function (data) {
					res.set('Content-type', 'application/json; charset=utf8');
					res.send(JSON.stringify({
						id: participationId,
						person: req.body.person,
						expense: req.body.expense,
						amount: req.body.amount,
						participating: req.body.participating
					}));
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in changeParticipation');
			console.dir(err);
			res.send(400);
		})
	;
};


var deleteParticipation = function (req, res) {
	var participationId = req.params.id;

	Q.nmcall(pool, 'getConnection')
		.then(function (connection) {
			// TODO valid person id, expense id?
			return Q.nmcall(connection, 'query', 'delete from participations where id = ?', [participationId])
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
			console.log('Error in deleteParticipation');
			console.dir(err);
			res.send(400);
		})
	;
};

module.exports.init = function (app, connectionPool) {
	pool = connectionPool;

	// TODO app.get('/api/participations/:id', ...)
	app.post('/api/participations', createParticipation);
	app.put('/api/participations/:id', changeParticipation);
	app.delete('/api/participations/:id', deleteParticipation);
};