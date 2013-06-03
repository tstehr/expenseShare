var app = app || {};

app.ParticipationCollectionView = app.ACollectionView.extend({
	initialize: function () {
		this._originalCollection = this.collection;

		this.collection = new app.ParticipationBaseCollection();

		this.collection.add(this._originalCollection.toArray());
		this.collection.add(this._originalCollection._slaveCollection.toArray());

		this.collection.sort();

		this.listenTo(this._originalCollection, 'add', this.addToJoinedCollection);
		this.listenTo(this._originalCollection, 'remove', this.removeFromJoinedCollection);
		this.listenTo(this._originalCollection._slaveCollection, 'add', this.addToJoinedCollection);
		this.listenTo(this._originalCollection._slaveCollection, 'remove', this.removeFromJoinedCollection);

		// call "super"
		app.ACollectionView.prototype.initialize.call(this);
	},

	createView: function (model) {
		return new app.ParticipationView({model: model});
	},

	dispose: function () {
		delete this.collection;
		delete this._originalCollection;
		this.disposeAllViews();
		this.remove();
	},

	addToJoinedCollection: function (model) {
		this.collection.add(model);
	},
	removeFromJoinedCollection: function (model) {
		this.collection.remove(model);
	}
});