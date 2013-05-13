var app = app || {};

/**
 * Any kind of expense, can have participants
 */
app.Expense = Backbone.RelationalModel.extend({
	defaults: {
		id: null,
		description: null,
		day: null
	},
	relations: [{
		key: 'participations',
		type: Backbone.HasMany,
		relatedModel: 'app.Participation',
		includeInJSON: Backbone.Model.prototype.idAttribute,
		collectionType: 'app.ParticipationList',
		autoFetch: true,
		reverseRelation: {
			key: 'expense',
			includeInJSON: Backbone.Model.prototype.idAttribute
		}
	}],
	urlRoot: '/api/expenses',
	initialize: function () {
		// setting date to current time, if it isn't set
		if (this.get('day') == null) {
			this.set('day', Date.now());
		}

		// initialize the amount
		this.calculateAmount();

		// TODO refactor into own methods
		// this.listenTo(this, 'sync', function () {
		// 	console.log('Sync done... #' + this.get('id'), this);
		// 	$.when.apply(this, this.fetchRelated('participations')).done(_.bind(function () {
		// 		console.log('Fetch related done #' + this.get('id'), this);
		// 		this.addAllParticipations(app.persons);
		// 		this.calculateAmount();
		// 	}, this));
		// });

		this.listenTo(this.get('participations'), 'change add remove', function () {
			this.calculateAmount();
		});

		// initialize participations
		/*

		this.listenTo(app.persons, 'reset', this.addAllParticipations);
		this.listenTo(app.persons, 'add', this.addOneParticipation);
		this.listenTo(app.persons, 'remove', this.removeOneParticipation);*/
		
		
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
		collection.each(_.bind(function (person) {
			this.addOneParticipation(person);
		}, this));
	},
	removeOneParticipation: function (person) {
		this.get('participations').remove(this.get('participations').getByPerson(person));
	}
})