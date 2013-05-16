var app = app || {};

/**
 * A month. No further explaination needed
 */
app.Month = Backbone.RelationalModel.extend({
	defaults: {
		id: null,
		totalAmount: null,
		personAmountMap: null
	},
	relations: [{
		key: 'expenses',
		type: Backbone.HasMany,
		relatedModel: 'app.Expense',
		includeInJSON: Backbone.Model.prototype.idAttribute,
		collectionType: 'app.ExpenseList',
		autoFetch: true,
		reverseRelation: {
			key: 'month',
			includeInJSON: Backbone.Model.prototype.idAttribute
		}
	}],
	urlRoot: '/api/months',
	initialize: function () {
		this.calculateAmount();

		this.listenTo(this.get('expenses'), 'change add remove', this.calculateAmount);
	},
	calculateAmount: function () {
		var pam = {};

		// calculate total
		this.set('totalAmount', this.get('expenses').reduce(function (memo, expense) {
			// add up per person
			var perParticipant, participants = [];

			// add up all contributions by participants
			expense.get('participations').forEach(function (part) {
				var personCid;
				if (part && part.get('person')) {
					personCid = part.get('person').cid;

					pam[personCid] = pam[personCid] || 0;
					if (typeof part.get('amount') === 'number') {
						pam[personCid] += part.get('amount');
					}

					// remeber participating persons to subtract their part
					if (part.get('participating') == true) {
						participants.push(personCid);
					}
				}
			});

			if (participants.length > 0) {
				perParticipant = expense.get('amount') / participants.length;

				participants.forEach(function (personCid) {
					pam[personCid] = pam[personCid] || 0;
					pam[personCid] -= perParticipant;
				});
			}

			// add up total
			return memo + expense.get('amount');
		}, 0));
		this.set('personAmountMap', pam);
	}
});