var app = app || {};

(function (app) {
	'use strict';

	/**
	 * Any kind of expense, can have participants
	 */
	app.Expense = Backbone.RelationalModel.extend({
		defaults: {
			_id: null,
			description: '',
			created: 0,
		},
		relations: [{
			key: 'participations',
			type: Backbone.HasMany,
			relatedModel: 'app.Participation',
			includeInJSON: true,
			collectionType: 'app.ParticipationCollection',
			reverseRelation: {
				key: 'expense',
				includeInJSON: Backbone.Model.prototype.idAttribute
			}
		}],
		urlRoot: 'expense', 
		initialize: function () {
			// trigger event on this model whenever it's participations change, since toJSONDecorated uses them
			this.listenTo(this.get('participations'), 'pseudochange change add remove', function () {
				// can't trigger "change" event here since backbone-relational interferers with it's propagation
				// cf. Backbone.RelationalModel.trigger
				this.trigger('pseudochange');
			});

			// TODO reenable ioBind
			// if (this.isNew()) {
			// 	this.listenToOnce(this, 'sync', this.doIoBind.bind(this));
			// } else {
			// 	this.doIoBind();
			// }
		},
		doIoBind: function () {
			this.ioBind('createParticipation', function (data) {
				this.get('participations').add(data);
			});
			this.ioBind('update', function (data) {
				this.set(data);
			});
			this.ioBind('delete', function (data) {
				if (this.collection) {
					this.collection.remove(this);
				}
				this.set('id', null);
			});
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
				return 'An expense needs at least one participant!';
			}
		},
		saveIfNotNew: function () {
			var changed;
			if (!this.isNew()) {
				this.save();
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
		},
	});

}(app));