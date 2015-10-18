var	nano = require('nano'),
	Promise = require('prfun');

var db = nano({
	url: 'http://127.0.0.1:5984/expense_share',
	//log: console.log.bind(console),
});

db.listPr = Promise.promisify(db.list, false, db);
db.bulkPr = Promise.promisify(db.bulk, false, db);

db.listPr()
	.then(function (resp) {
		var deletedDocs = resp.rows
			.map(function (row) {
				return {
					_id: row.id,
					_rev: row.value.rev,
					_deleted: true,
				}
			})
		;

		return db.bulkPr({docs: deletedDocs});
	})
	.then(function () {
		console.log('done');
	})
	.catch(function (e) {
		console.log('fail', e);
	})
;