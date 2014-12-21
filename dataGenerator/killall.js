var couchdb = require('then-couchdb'),
	Promise = require('promise');

var db = couchdb.createClient('http://127.0.0.1:5984/expense_share');

db.allDocs()
	.then(function (docs) {
		var deletedDocs = docs
			.map(function (doc) {
				doc._deleted = true;
				return doc;
			})
		;

		return db.saveAll(deletedDocs);
	})
	.then(function () {
		console.log('done');
	})
	.catch(function (e) {
		console.log('fail', e);
	})
;