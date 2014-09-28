var app = app || {};

(function (app) {
	'use strict';
		
	/**
	 * A simple collection of Participations 
	 */
	app.ParticipationBaseCollection = Backbone.Collection.extend({
		model: app.Participation,
		comparator: function (part) {
			return app.Util.normalizeComparison(part.get('person') ? part.get('person').get('name') : '');
		},
		extractPerson: function (model) {
			var person;
			if (model instanceof app.Participation && model.get('person')) {
				person = model.get('person');
			} 
			if (model instanceof app.Person) {
				person = model;
			} 

			if (person instanceof app.Person) {
				return person;
			} else {
				return null;
			}
		},
		getByPerson: function (model) {
			var person = this.extractPerson(model);
			if (!person) {
				return [];
			}
			return this.filter(function (part) {
				return !!part.get('person') && part.get('person').id == person.id;
			});
		},
	});

	/**
	 * This Collection also contains Participations. 
	 * It makes sure that all participations in the collection are not empty, that is they have either a amount or are participating.
	 * It also pervents adding a participation with a person which is already in the collection, the data of this participation is move to the existing participation instead.
	 */
	app.ParticipationCollection = app.ParticipationBaseCollection.extend({
		model: app.Participation,

		initialize: function () {
			this.listenTo(this, 'change add', this.removeIfEmpty);
		},
		add: function (model) {
			// don't add if part with person already exists in collection
			var persons = this.getByPerson(model);
			if (persons && persons.length > 0 && persons[0] !== model) {
				persons[0].set({
					participating: model.get('participating') || persons[0].get('participating'),
					amount: (model.get('amount') || 0) + (persons[0].get('amount') || 0)
				});
				return persons[0];
			} 
			return app.ParticipationBaseCollection.prototype.add.apply(this, arguments);
		},
		removeIfEmpty: function (part) {
			if (part.isEmpty()) {
				var expense = part.get('expense');
				this.remove(part);
				if (expense) {
					expense.saveIfNotNew();
				}
			}
		},
	}); 

}(app));