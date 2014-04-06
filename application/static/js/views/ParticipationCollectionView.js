var app = app || {};

(function (app) {
	'use strict';

	app.ParticipationCollectionView = app.ACollectionView.extend({
		initialize: function () {
			this._masterCollection = this.collection;
			delete this.collection;

			this.initializeSlave();
			this.initializeJoined();

			// call "super"
			app.ACollectionView.prototype.initialize.call(this);
		},

		initializeSlave: function () {
			this._slaveCollection = new app.ParticipationBaseCollection();
			
			// add all to slave that are not in master
			app.persons.forEach(function (person) {
				if (!this._masterCollection.getByPerson(person).length) {
					this._slaveCollection.add(new app.Participation({
						person: person
					}));
				}
			}.bind(this));

			// keep in sync
			this.listenTo(app.persons, 'add', this.addToSlave);

			this.listenTo(this._masterCollection, 'add', this.removeFromSlave);
			this.listenTo(this._masterCollection, 'remove', this.addToSlave);

			this.listenTo(this._slaveCollection, 'change pseudochange', this.handleSlaveParticipationChange);
		},

		initializeJoined: function () {
			this.collection = new app.ParticipationBaseCollection();

			this.collection.add(this._masterCollection.toArray());
			this.collection.add(this._slaveCollection.filter(function (part) {
				return !part.get('person').get('hidden')
			}));

			this.collection.sort();

			this.listenTo(this._masterCollection, 'add', this.addToJoinedCollection);
			this.listenTo(this._masterCollection, 'remove', this.removeFromJoinedCollection);
			this.listenTo(this._slaveCollection, 'add', this.addToJoinedCollection);
			this.listenTo(this._slaveCollection, 'remove', this.removeFromJoinedCollection);
		},

		createView: function (model) {
			return new app.ParticipationView({model: model});
		},

		dispose: function () {
			delete this.collection;
			delete this._masterCollection;
			delete this._slaveCollection;
			this.disposeAllViews();
			this.remove();
		},


		handleSlaveParticipationChange: function (part) {
			if (!part.isEmpty()) {
				this._slaveCollection.remove(part);
				this._masterCollection.add(part);
			}
			if (!part.get('person') || !part.get('person').collection || part.get('person').get('hidden')) {
				this._slaveCollection.remove(part);
			}
		},
		removeFromSlave: function (model) {
			var person = this.collection.extractPerson(model);

			var slaveParts = this._slaveCollection.getByPerson(person);
			if (slaveParts) {
				this._slaveCollection.remove(slaveParts)
			}
		},
		addToSlave: function (model) {
			var person = this.collection.extractPerson(model);

			if (person && person.collection && !person.get('hidden')) {
				var slaveParts = this._slaveCollection.getByPerson(person);
				if (!slaveParts || slaveParts.length === 0) {
					this._slaveCollection.add(new app.Participation({
						person: person
					}));
				}
			}
		},

		addToJoinedCollection: function (model) {
			this.collection.add(model);	
		},
		removeFromJoinedCollection: function (model) {
			this.collection.remove(model);
		}
	});
	
}(app));