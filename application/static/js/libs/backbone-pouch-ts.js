var BackbonePouch = function (options) {
	this.db = options.db;
};


BackbonePouch.prototype.create = function (model, options) {
	var prefix;
	try {
		prefix = model.url() + '_';
	} catch (e) {
		prefix = '';
	}
	var modelJSON = model.toJSON();
	modelJSON._id = prefix + uuid.v4();

	return this.db.put(modelJSON)
		.then(function (resp) {
			return this.db.get(resp.id);
		}.bind(this))
	;
};

BackbonePouch.prototype.read = function (model, options) {
	return this.db.get(model.id);
};

BackbonePouch.prototype.update = function (model, options) {
	return this.db.put(model.toJSON())
		.then(function (resp) {
			return this.db.get(resp.id);
		}.bind(this))
	;
};

BackbonePouch.prototype.delete = function (model, options) {
	return this.db.remove(model.toJSON());
};

BackbonePouch.prototype.readCollection = function (collection, options) {
	var prefix = _.result(collection, 'url');
	
	return this.db.allDocs({
		startkey: prefix + '_', 
		endkey: prefix + '_\ufff0',
		include_docs: true,
	})
		.then(function (response) {
			return _.map(response.rows, function (row) {
				return row.doc;
			});
		})
	;
};


BackbonePouch.prototype.sync = function (method, model, options) {	
	var promise;

	if (model instanceof Backbone.Collection) {
		promise = this[method + 'Collection'](model, options);
	} else {
		if (model.idAttribute !== '_id') {
			throw Error('"idAttribute" must be "_id"');
		}

		promise = this[method](model, options);
	}

	return promise
			.then(function (doc) {
				options.success(doc);
				return doc;
			}, function (error) {
				options.error(error);
				throw error;
			})
		;	
};

BackbonePouch.prototype.getSync = function () {
	return this.sync.bind(this);
};