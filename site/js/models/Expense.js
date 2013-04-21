var app = app || {};

/**
 * Any kind of expense, can have participants
 */
app.Expense = Backbone.RelationalModel.extend({
	defaults: {
		description: null,
		date: null
	},
	relations: [{
		key: 'participations',
		type: Backbone.HasMany,
		relatedModel: 'app.Participation',
		includeInJSON: Backbone.Model.prototype.idAttribute,
		collectionType: 'app.ParticipationList',
		reverseRelation: {
			key: 'expense',
			includeInJSON: Backbone.Model.prototype.idAttribute
		}
	}],
	initialize: function () {
		// setting date to current time, if it isn't set
		if(this.get('date') == null) {
			this.set('date', Date.now());
		}
		
		this.calculateAmount();
		this.addAllParticipations(app.persons);

		this.listenTo(this.get('participations'), 'change add remove', this.calculateAmount);

		this.listenTo(app.persons, 'reset', this.addAllParticipations);
		this.listenTo(app.persons, 'add', this.addOneParticipation);
		this.listenTo(app.persons, 'remove', this.removeOneParticipation);
	},
	calculateAmount: function () {
		this.set('amount', this.get('participations').reduce(function (memo, part) {
			if (part.get('participating')) {
				return memo + part.get('amount');
			} else {
				return memo;
			}
		}, 0));
	},
	addOneParticipation: function (person) {
		var part = this.get('participations').getByPerson(person);
		if (!part) {
			this.get('participations').add(new app.Participation({person: person}));
		}
	},
	addAllParticipations: function (collection) {
		this.get('participations').reset();
		collection.each(_.bind(function (person) {
			this.addOneParticipation(person);
		}, this));
	},
	removeOneParticipation: function (person) {
		this.get('participations').remove(this.get('participations').getByPerson(person));
	}
})