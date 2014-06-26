var mysql = require('mysql');
var Q = require('q');

var MonthsHandler = function (socket, pool) {
	this.socket = socket;
	this.pool = pool;

	this.socket.on('month:read', this.readMonth.bind(this));
};

MonthsHandler.prototype.readMonth = function (socketData, callback) {
	callback(null, {
		id: socketData.id,
		expenses: []
	});
};


module.exports = function (socket, pool) {
	return new MonthsHandler(socket, pool);
};

