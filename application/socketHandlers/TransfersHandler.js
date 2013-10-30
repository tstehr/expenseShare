var mysql = require('mysql');
var Q = require('q');

var TransfersHandler = function (socket, pool) {
	this.socket = socket;
	this.pool = pool;

	socket.on('transfer:read', this.readTransfer.bind(this));
	socket.on('transfer:update', this.updateTransfer.bind(this));
	socket.on('transfer:delete', this.deleteTransfer.bind(this));
};

TransfersHandler.prototype.readTransfer = function (socketData, callback) {
	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			var data = [socketData.month, socketData.fromPerson, socketData.toPerson];
			return Q.nmcall(
                    connection, 'query', 'select * from transfers where month = ? and fromPerson = ? and toPerson = ?', 
                    [socketData.month, socketData.fromPerson, socketData.toPerson]
                )
				.then(function (dbData) {
                    socketData.paid = !!dbData[0].length;
					socketData.id = data.join('-');
					callback(null, socketData);
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in createTransfer');
			console.dir(err);
			callback(null);
		})
	;
};

TransfersHandler.prototype.updateTransfer = function (socketData, callback) {
	console.log(socketData);
	if (socketData.paid) {
		this.createTransfer(socketData, callback);
	} else {
		this.deleteTransfer(socketData, callback);
	}
}

TransfersHandler.prototype.createTransfer = function (socketData, callback) {
	var socket = this.socket;
	
	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			var data = [socketData.month, socketData.fromPerson, socketData.toPerson];
			return Q.nmcall(connection, 'query', 'insert into transfers values(?, ?, ?)', data)
				.then(function (dbData) {
                    socketData.paid = true;
					socketData.id = data.join('-');
					callback(null, socketData);
    				socket.broadcast.emit('transfer/' + socketData.id + ':update', socketData);
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function (err) {
			console.log(Date.now() + ' Error in createTransfer');
			console.dir(err);
			callback(null);
		})
	;
};

TransfersHandler.prototype.deleteTransfer = function (socketData, callback) {
	var socket = this.socket;
	
	Q.nmcall(this.pool, 'getConnection')
		.then(function (connection) {
			var data = [socketData.month, socketData.fromPerson, socketData.toPerson];
			return Q.nmcall(connection, 'query', 'delete from transfers where month = ? and fromPerson = ? and toPerson = ?', data)
				.then(function (dbData) {
                    socketData.paid = false;
					socketData.id = data.join('-');
					callback(null, socketData);
    				socket.broadcast.emit('transfer/' + socketData.id + ':update', socketData);
				})
				.fin(function () {
					connection.end();
				})
			;
		})
		.fail(function (err) {
			console.log('Error in deleteTransfer');
			console.dir(err);
			callback(null);
		})
	;
};


module.exports = function (socket, pool) {
	return new TransfersHandler(socket, pool);
}