var app = app || {};


/**
 * Generic view for a sorted collection that correctly handles insertion and removal 
 * without completely rerendereing its child views.
 * Child views need to implement the 'createView' method the create views for the 
 * collection's members.
 */
app.AListView = Backbone.View.extend({
	initialize: function () {
		this._viewPointers = {};

		this.listenTo(this.collection, 'add', this.handleAdd);
		this.listenTo(this.collection, 'remove', this.removeOne);
		this.listenTo(this.collection, 'reset', this.addAll);
	},
	render: function () {
		this.addAll(this.collection);
		return this;
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
	removeView: function (model) {
		this._viewPointers[model.cid].remove();
		delete this._viewPointers[model.cid];
	},
	handleAdd: function (model, collection, options) {
		var index = collection.indexOf(model);
		this.addOne(model, index);
	},
	addOne: function (model, index) {
		var view = this.getView(model);
		var children = this.$el.children();

		if (children.length === 0 || index === 0) {
			this.$el.prepend(view.render().el);
		} else {
			children.filter(':eq(' + (index-1) + ')').after(view.render().el);
		}
	},
	addAll: function (collection) {
		this.$el.empty();
		collection.each(_.bind(function (model, index, collection) {
			this.addOne(model, index);
		}, this));
	},
	removeOne: function (model, collection, options) {
		this.$('> :nth-child(' + (options.index+1) + ')').remove();
	}
});