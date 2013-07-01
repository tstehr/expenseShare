var mysql = require('mysql');
var Q = require('q');

var PersonsHandler = function(socket, pool) {
	this.socket = socket;
	this.pool = pool;

	this.socket.on('persons:read', this.readPersons.bind(this));
	this.socket.on('person:read', this.readPerson.bind(this));
	this.socket.on('person:create', this.createPerson.bind(this));
	this.socket.on('person:update', this.updatePerson.bind(this));
	this.socket.on('person:delete', this.deletePerson.bind(this));
};

PersonsHandler.prototype.readPersons = function (socketData, callback) {
	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			return Q.nmcall(connection, 'query', 'select * from persons')
				.then(function (dbData) {
					callback(null, dbData[0]);
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in readPersons');
			console.dir(err);
			callback(null)
		})
	;
};

PersonsHandler.prototype.readPerson = function (socketData, callback) {
	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			return Q.nmcall(connection, 'query', 'select * from persons where id = ?', [socketData.id])
				.then(function (dbData) {
					callback(null, dbData[0][0]);
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in readPersons');
			console.dir(err);
			callback(null)
		})
	;
};

PersonsHandler.prototype.createPerson = function (socketData, callback) {
	var socket = this.socket;

	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			return Q.nmcall(connection, 'query', 'insert into persons(name) values(?)', [socketData.name])
				.then(function (dbData) {
					var json = {
						id: dbData[0].insertId,
						name: socketData.name
					};
					socket.broadcast.emit('persons:create', json);
					callback(null, json);
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function () {
			console.log('Error in createPerson',  arguments);
			callback(null);
		})
	;
};

PersonsHandler.prototype.updatePerson = function (socketData, callback) {
	var socket = this.socket;

	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			return Q.nmcall(
					connection, 'query', 'update persons set name = ? where id = ?', 
					[socketData.name, socketData.id]
				)
				.then(function (dbData) {
					var json = {
						id: socketData.id,
						name: socketData.name
					};
					callback(null, json);
    				socket.broadcast.emit('person/' + socketData.id + ':update', json);
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function () {
			console.log('Error in updatePerson',  arguments);
			callback(null);
		})
	;
}

PersonsHandler.prototype.deletePerson = function (socketData, callback) {
	var socket = this.socket;

	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			return Q.nmcall(
					connection, 'query', 'delete from persons where id = ?', 
					[socketData.id]
				)
				.then(function (dbData) {
					callback(null, true);
    				socket.broadcast.emit('person/' + socketData.id + ':delete');
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function () {
			console.log('Error in updatePerson',  arguments);
			callback(null);
		})
	;
}

module.exports = function (socket, pool) {
	return new PersonsHandler(socket, pool);
};