var app = app || {};

/**
 * Any kind of expense, can have participants
 */
app.Expense = Backbone.RelationalModel.extend({
	defaults: {
		id: null,
		description: null
	},
	relations: [{
		key: 'participations',
		type: Backbone.HasMany,
		relatedModel: 'app.Participation',
		includeInJSON: Backbone.Model.prototype.idAttribute,
		collectionType: 'app.ParticipationCollection',
		reverseRelation: {
			key: 'expense',
			includeInJSON: Backbone.Model.prototype.idAttribute
		}
	}],
	urlRoot: '/api/expenses', 
	initialize: function () {
		// TODO refactor into own methods
		// this.listenTo(this, 'sync', function () {
		// 	console.log('Sync done... #' + this.get('id'), this);
		// 	$.when.apply(this, this.fetchRelated('participations')).done(_.bind(function () {
		// 		console.log('Fetch related done #' + this.get('id'), this);
		// 		this.addAllParticipations(app.persons);
		// 		this.calculateAmount();
		// 	}, this));
		// });

		// trigger event on this model whenever it's participations change, since toJSONDecorated uses them
		this.listenTo(this.get('participations'), 'change add remove', function () {
			// can't trigger "change" event here since backbone-relational interferers with it's propagation
			// cf. Backbone.RelationalModel.trigger
			this.trigger('pseudochange');
		});

		// TODO model or view?
		this.listenTo(this, 'change', _.debounce(function () {
			if (!this.isNew()) {
				this.save();
			}
		}, 300));

		// TODO save participations
	},
	validate: function () {
		var count = 0, amount = 0;

		this.get('participations').each(function (part) {
			if (part.get('participating')) {
				count++;
			}
			if (typeof part.get('amount') === 'number') {
				amount += part.get('amount');
			}
		});
		if (count === 0 && amount !== 0)  {
			return 'An expenses needs at least one partipant!';
		}
	},
	getAmount: function () {
		return this.get('participations').reduce(function (memo, part) {
			if (typeof part.get('amount') === 'number') {
				return memo + part.get('amount');
			}
			return memo;
		}, 0);
	},
	toJSONDecorated: function(){
		return _.extend(this.toJSON(), {
			amount: this.getAmount(),
			isNew: this.isNew()
		});
	}
})