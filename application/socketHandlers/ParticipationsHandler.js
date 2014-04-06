var mysql = require('mysql');
var Q = require('q');

var ParticipationsHandler = function (socket, pool) {
	this.socket = socket;
	this.pool = pool;

	socket.on('participation:read', this.readParticipation.bind(this));
	socket.on('participation:create', this.createParticipation.bind(this));
	socket.on('participation:update', this.updateParticipation.bind(this));
	socket.on('participation:delete', this.deleteParticipation.bind(this));
};

ParticipationsHandler.prototype.readParticipation = function (socketData, callback) {
	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			return Q.nmcall(connection, 'query', 'select * from participations where id = ?', [socketData.id])
				.then(function (dbData) {
					callback(null, dbData[0][0]);
				})
				.fin(function () {
					connection.release();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in createParticipation');
			console.dir(err);
			callback(null);
		})
	;
};

ParticipationsHandler.prototype.createParticipation = function (socketData, callback) {
	var socket = this.socket;

	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			// TODO valid person id, expense id?
			return Q.nmcall(
					connection, 'query', 'insert into participations (person,expense,amount,participating) values (?, ?, ?, ?)',
					[socketData.person, socketData.expense, socketData.amount, socketData.participating]
				)
				.then(function (dbData) {
					var json = {
						id: dbData[0].insertId,
						person: socketData.person,
						expense: socketData.expense,
						amount: socketData.amount,
						participating: socketData.participating
					};
					socket.broadcast.emit('expense/' + socketData.expense + ':createParticipation', json);
					callback(null, json);
				})
				.fin(function () {
					connection.release();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in createParticipation');
			console.dir(err);
			callback(null);
		})
	;
};

ParticipationsHandler.prototype.updateParticipation = function (socketData, callback) {
	var socket = this.socket;

	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			// TODO valid person id, expense id?
			return Q.nmcall(
					connection, 'query', 'update participations set person = ?, expense = ?, amount = ?, participating = ? where id = ?',
					[socketData.person, socketData.expense, socketData.amount, socketData.participating, socketData.id]
				)
				.then(function (data) {
					var json = {
						id: socketData.id,
						person: socketData.person,
						expense: socketData.expense,
						amount: socketData.amount,
						participating: socketData.participating
					};
					socket.broadcast.emit('participation/' + socketData.id + ':update', json);
					callback(null, json);
				})
				.fin(function () {
					connection.release();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in updateParticipation');
			console.dir(err);
			callback(null);
		})
	;
};


ParticipationsHandler.prototype.deleteParticipation = function (socketData, callback) {
	var socket = this.socket;

	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			// TODO valid person id, expense id?
			return Q.nmcall(connection, 'query', 'delete from participations where id = ?', [socketData.id])
				.then(function (data) {
					socket.broadcast.emit('participation/' + socketData.id + ':delete', true);
					callback(null, true);
				})
				.fin(function () {
					connection.release();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in deleteParticipation');
			console.dir(err);
			callback(null);
		})
	;
};

module.exports = function (socket, pool) {
	return new ParticipationsHandler(socket, pool);
}