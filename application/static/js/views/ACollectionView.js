var app = app || {};


/**
 * Generic view for a sorted collection that correctly handles insertion and removal 
 * without completely rerendereing its child views.
 * Child views need to implement the 'createView' method the create views for the 
 * collection's members.
 */
app.ACollectionView = app.AView.extend({
	initialize: function () {
		this._viewPointers = {};

		this.listenTo(this.collection, 'add', this.handleAdd);
		this.listenTo(this.collection, 'remove', this.handleRemove);
		this.listenTo(this.collection, 'reset', this.handleReset);
		this.listenTo(this.collection, 'sort', this.handleSort);
	},

	render: function () {
		this.reset();
		return this;
	},
	dispose: function () {
		this.disposeAllViews();
		this.remove();
	},

	createView: function (model) {
		console.error('implement');
	},

	getView: function (model) {
		if (!this._viewPointers[model.cid]) {
			this._viewPointers[model.cid] = this.createView(model);
		}
		return this._viewPointers[model.cid];
	},
	disposeView: function (model) {
		this.disposeViewByCid(model.cid);
	},
	disposeViewByCid: function (cid) {
		if (this._viewPointers[cid]) {
			this._viewPointers[cid].dispose();
		}
		delete this._viewPointers[cid];
	},
	disposeAllViews: function () {
		Object.keys(this._viewPointers).forEach((function (cid) {
			this.disposeViewByCid(cid);
		}.bind(this)));
	},

	handleAdd: function (model, collection, options) {
		var index = this.collection.indexOf(model);
		this.addOne(model, index);
	},
	handleRemove: function (model, collection, options) {
		this.disposeView(model);
	},
	handleReset: function (collection) {
		this.reset();
	},
	handleSort: function () {
		this.getCollectionEl().empty();
		this.addAll();
	},

	addOne: function (model, index) {
		var view, prevView;
		view = this.getView(model);

		for (var i = 1; i <= index && !prevView; i++) {
			prevView = this._viewPointers[this.collection.at(index - i).cid];
		}

		if (prevView) {
			prevView.$el.after(view.render().el);
		} else {
			this.getCollectionEl().prepend(view.render().el);
		}
	},
	reset: function () {
		this.disposeAllViews();

		if (this.collection) {
			this.addAll();
		}
	},
	addAll: function () {
		this.collection.each(_.bind(function (model, index, collection) {
			this.addOne(model, index);
		}, this));
	},
	getCollectionEl: function () {
		return this.$collectionEl || this.$el;
	}
});