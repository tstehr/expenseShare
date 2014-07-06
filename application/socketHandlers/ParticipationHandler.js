var mysql = require('mysql');
var Q = require('q');

var ParticipationHandler = function (socket, pool) {
	this.socket = socket;
	this.pool = pool;

	socket.on('participation:read', this.readParticipation.bind(this));
	socket.on('participation:create', this.createParticipation.bind(this));
	socket.on('participation:update', this.updateParticipation.bind(this));
	socket.on('participation:delete', this.deleteParticipation.bind(this));
};

ParticipationHandler.generateId = function (data) {
	return data.person + '_' + data.expense;
};

ParticipationHandler.unpackId = function (id) {
	var split, object = null;

	if (typeof id === 'string') {
		unpacked = id.split('_');

		if (unpacked.length === 2) {
			object = {
				person: unpacked[0],
				expense: unpacked[1],
			};
		}
	}

	return object;
};

ParticipationHandler.prototype.readParticipation = function (socketData, callback) {
	// TODO validate incoming id (is it <person>_<expense>?)
	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			return Q.nmcall(
					connection, 'query', 'select * from participations where person = ? and expense = ?', 
					[socketData.person, socketData.expense]
				)
				.then(function (dbData) {
					var json = dbData[0][0];
					json.id = ParticipationHandler.generateId(json);
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

ParticipationHandler.prototype.createParticipation = function (socketData, callback) {
	var socket = this.socket;

	// TODO validate incoming id (is it <person>_<expense>?)
	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			// TODO valid person id, expense id?
			return Q.nmcall(
					connection, 'query', 'insert into participations (person,expense,amount,participating) values (?, ?, ?, ?)',
					[socketData.person, socketData.expense, socketData.amount, socketData.participating]
				)
				.then(function (dbData) {
					var json = {
						person: socketData.person,
						expense: socketData.expense,
						amount: socketData.amount,
						participating: socketData.participating
					};
					json.id = ParticipationHandler.generateId(json);

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

ParticipationHandler.prototype.updateParticipation = function (socketData, callback) {
	var socket = this.socket;

	// TODO validate incoming id (is it <person>_<expense>?)
	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			// TODO valid person id, expense id?
			return Q.nmcall(
					connection, 'query', 'update participations set amount = ?, participating = ? where person = ? and expense = ?',
					[socketData.amount, socketData.participating, socketData.person, socketData.expense]
				)
				.then(function (data) {
					// TODO check whether something was actually updated (mysql changed lines)
					var json = {
						person: socketData.person,
						expense: socketData.expense,
						amount: socketData.amount,
						participating: socketData.participating
					};
					json.id = ParticipationHandler.generateId(json);

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


ParticipationHandler.prototype.deleteParticipation = function (socketData, callback) {
	var socket = this.socket;

	// TODO validate incoming id (is it <person>_<expense>?)
	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			// TODO valid person id, expense id?
			return Q.nmcall(
					connection, 'query', 'delete from participations where person = ? and expense = ?', 
					[socketData.person, socketData.expense]
				)
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

module.exports = ParticipationHandler;
