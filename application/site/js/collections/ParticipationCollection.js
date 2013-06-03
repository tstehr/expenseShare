var app = app || {};


/**
 * A simple collection of Participations 
 */
app.ParticipationBaseCollection = Backbone.Collection.extend({
	model: app.Participation,
	comparator: function (part) {
		return app.Util.normalizeComparison(part.get('person') ? part.get('person').get('name') : '');
	},
	getByPerson: function (person) {
		if (!(person instanceof app.Person)) {
			return null;
		}
		return this.filter(function (part) {
			return !!part.get('person') && part.get('person').id == person.id;
		});
	}
});

/**
 * This Collection also contains Participations. Additionally, it maintains a _slaveCollection 
 * which contains participations for every person which has no participations containing it in the 
 * master collection.
 * All Participations in the master collection are not empty, that is they have either a amount or 
 * are participating, whilest participations in the slave collection are empty. 
 * If the "empty"-state of a participation changes, it is moved to the corresponding collection.
 */
app.ParticipationCollection = app.ParticipationBaseCollection.extend({
	model: app.Participation,

	initialize: function () {
		this._slaveCollection = new app.ParticipationBaseCollection();

		app.persons.forEach(function (person) {
			this._slaveCollection.add(new app.Participation({
				person: person
			}));
		}.bind(this));

		this.listenTo(app.persons, 'add', this.addToSlave);

		this.listenTo(this, 'add', this.removeFromSlave);
		this.listenTo(this, 'remove', this.addToSlave);

		this.listenTo(this._slaveCollection, 'change', function (part) {
			if (!part.isEmpty()) {
				this._slaveCollection.remove(part);
				this.add(part);
			}
		}.bind(this));

		this.listenTo(this, 'change', function (part) {
			if (part.isEmpty()) {
				this.remove(part);
			} else {
				this.removeFromSlave(part);
			}
		}.bind(this));
	},
	extractPerson: function (model) {
		if (model instanceof app.Participation) {
			return model.get('person');
		} 
		if (model instanceof app.Person) {
			return model;
		} 
		throw new TypeError('Can\'t extract person from supplied arguments!');
	},
	removeFromSlave: function (model) {
		var person = this.extractPerson(model);

		var slaveParts = this._slaveCollection.getByPerson(person);
		if (slaveParts) {
			this._slaveCollection.remove(slaveParts)
		}
	},
	addToSlave: function (model) {
		var person = this.extractPerson(model);

		var slaveParts = this._slaveCollection.getByPerson(person);
		if (!slaveParts || slaveParts.length === 0) {
			this._slaveCollection.add(new app.Participation({
				person: person
			}));
		}
	}
});
