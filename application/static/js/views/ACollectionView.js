var app = app || {};

(function (app) {
	'use strict';
		
	/**
	 * Generic view for a sorted collection that correctly handles insertion and removal 
	 * without completely rerendereing its child views.
	 * Child views need to implement the 'createView' method the create views for the 
	 * collection's members.
	 */
	app.ACollectionView = app.AView.extend({
		initialize: function () {
			// We cache our views, so needn't recreate them all the time
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
			var cid = model.cid;
			if (this._viewPointers[cid]) {
				this._viewPointers[cid].dispose();	
				delete this._viewPointers[cid];
			}
		},
		disposeAllViews: function () {
			Object.keys(this._viewPointers).forEach((function (cid) {
				this.disposeView(this._viewPointers[cid]);
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
		handleSort: function (model, options) {
			// if this is a sort after adding, don't do anything
			if ((options && !options.add) || !options) {
				// re-add all views in the correct order
				this.collection.each(_.bind(function (model, index, collection) {
					var view = this.getView(model);
					this.getCollectionEl().append(view.el);
				}, this));
			}
		},

		addOne: function (model, index) {
			var view, prevView;
			view = this.getView(model);

			// try to get the view of the model that is before the new model in the collection
			prevView = this.getPrevView(index);

			if (prevView) {
				// insert after the prevView
				prevView.$el.after(view.render().el);
			} else {
				// there is no prevView, therefore we are at the beginning; insert as first element
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
		},
		getPrevView: function (index) {
			return this.getPrev(this.collection, this._viewPointers, index);
		},
		getPrev: function(collection, pointers, index) {
			// get the view of the first model that is before the one at the given index in the given collection
			var prev;
			for (var i = index - 1; i >= 0 && !prev; i--) {
				prev = pointers[collection.at(i).cid];
			}
			return prev;
		},
	});
	
}(app));