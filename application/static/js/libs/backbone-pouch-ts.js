/**
 * Version: 0.2.1
 */

var BackbonePouch = function (options) {
	this.db = options.db;

	this.changeQueueLock = 0;
	this.changeQueue = [];
	this.boundElements = {};

	this.db.changes({
		live:true,
	})
		.on('change', _.bind(this.enqueueChange, this))
	;
};

BackbonePouch.prototype.sync = function (method, el, options) {	
	console.log(method, this.getKey(el), el.cid, JSON.stringify(el.attributes));

	this.lockChangeQueue();

	var promise;

	if (el instanceof Backbone.Collection) {
		promise = this[method + 'Collection'](el, options);
	} else {
		this.assertIdAttribute(el);

		if (method == 'delete') {
			this.unbind(el);
		}

		promise = this[method](el, options);
	}

	return promise
			.then(_.bind(function (doc) {
				options.success(doc);

				if (method != 'delete') {
					this.bind(el);
				}

				console.log('end', method, this.getKey(el), el.cid, JSON.stringify(el.attributes));
				this.unlockChangeQueue();

				return doc;
			}, this), _.bind(function (error) {
				options.error(error);

				console.log('endfail', method, this.getKey(el), el.cid, JSON.stringify(el.attributes));
				this.unlockChangeQueue();

				throw error;
			}, this))
		;	
};

BackbonePouch.prototype.getSync = function () {
	return this.sync.bind(this);
};

BackbonePouch.prototype.create = function (model, options) {
	var prefix;
	try {
		prefix = this.getUrl(model) + '_';
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
	var prefix = this.getUrl(collection);
	
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

BackbonePouch.prototype.bind = function (el) {
	var key = this.getKey(el);
	console.log('bind', this.getKey(el), el.cid, JSON.stringify(el.attributes));
	
	var boundElements = this.getBoundElements(key);
	if (!_.contains(boundElements, el)) {
		boundElements.push(el);
	}

	if (el instanceof Backbone.Collection) {
		el.forEach(_.bind(this.bind, this));
	}
};

BackbonePouch.prototype.unbind = function (el) {
	var key = this.getKey(el);
	console.log('unbind', key, el.cid);
	this.boundElements[key] = _.without(this.getBoundElements(key), el);
};

BackbonePouch.prototype.lockChangeQueue = function () {
	this.changeQueueLock++;
	console.log('locking change queue', this.changeQueueLock, 'changes', this.changeQueue.length);
};

BackbonePouch.prototype.unlockChangeQueue = function () {
	this.changeQueueLock--;
	console.log('unlocking change queue', this.changeQueueLock, 'changes', this.changeQueue.length);

	this.processChangeQueue();
};

BackbonePouch.prototype.enqueueChange = function (change) {
	this.changeQueue.push(change);
	console.log('enqueuing change', change.seq, 'changes', this.changeQueue.length);

	this.processChangeQueue();
};

BackbonePouch.prototype.processChangeQueue = function () {
	var change;
	while (!this.changeQueueLock && this.changeQueue.length) {
		change = this.changeQueue.splice(0, 1)[0];
		this.handleChange(change);
	}
};

BackbonePouch.prototype.handleChange = function (change) {
	console.log('change', change.seq, change);
	
	this.handleModelChange(change);
	if (!change.deleted) {
		this.handleCollectionChange(change);
	}
};

BackbonePouch.prototype.handleModelChange = function (change) {
	var modelKey = change.id;
	var rev = _.last(change.changes).rev;

	var boundModels = this.getBoundElements(modelKey);

	_.forEach(boundModels, _.bind(function (model) {
		if (change.deleted) {
			// the db document was deleted, destroy all the models
			model.collection.remove(model);
			this.unbind(model);
		} else if (model.get('_rev') != rev) {
			// the db record is not on the same revison as the model, update the model
			model.fetch();
		}
	}, this));
};

BackbonePouch.prototype.handleCollectionChange = function (change) {
	var modelId = change.id;
	var modelIdElements = modelId.split('_');

	if (modelIdElements.length > 1)  {
		var collectionKey = modelIdElements[0];
		var boundCollections = this.getBoundElements(collectionKey);

		_.forEach(boundCollections, function (collection) {
			if (!collection.get(modelId)) {
				var newModel = collection.add({
					_id: modelId
				});
				newModel.fetch();
			}
		});
	}
};

BackbonePouch.prototype.getBoundElements = function (key) {
	var instances = this.boundElements[key];
	if (!instances) {
		this.boundElements[key] = instances = [];
	}
	return instances;
};

BackbonePouch.prototype.assertIdAttribute = function (model) {
	if (model.idAttribute !== '_id') {
		throw Error('"idAttribute" must be "_id"');
	}
};

BackbonePouch.prototype.getUrl = function (model) {
	return _.result(model, 'url');
};

BackbonePouch.prototype.getKey = function (el) {
	if (el instanceof Backbone.Collection) {
		return this.getUrl(el);
	} else {
		return el.id;
	}
};
