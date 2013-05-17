var app = app || {};

/**
 * A month. No further explaination needed
 */
app.Month = Backbone.RelationalModel.extend({
	defaults: {
		id: null
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
	getAmountAndPam: function () {
		var pam = {}, amount;

		// calculate total
		amount = this.get('expenses').reduce(function (memo, expense) {
			// add up per person
			var amountPerExpense = 0, perParticipant, participants = [];

			// add up all contributions by participants
			expense.get('participations').forEach(function (part) {
				var personCid;
				if (part && part.get('person')) {
					personCid = part.get('person').cid;

					pam[personCid] = pam[personCid] || 0;
					if (typeof part.get('amount') === 'number') {
						amountPerExpense += part.get('amount');
						pam[personCid] += part.get('amount');
					}

					// remember participating persons to subtract their part
					if (part.get('participating') == true) {
						participants.push(personCid);
					}
				}
			});

			if (participants.length > 0) {
				perParticipant = amountPerExpense / participants.length;

				participants.forEach(function (personCid) {
					pam[personCid] = pam[personCid] || 0;
					pam[personCid] -= perParticipant;
				});
			}

			// add up total
			return memo + amountPerExpense;
		}, 0);

		return {
			amount: amount,
			pam: pam
		};
	},
	distributePam: function(pam) {
		var p = _.groupBy(pam, function (v) {
			return 1;
		});
		console.log(p);
	},
	toJSONDecorated: function() {
		var that = this;

		return _.extend(
			this.toJSON(), 
			this.getAmountAndPam(), 
			(function () {
				var sp, month, year, prevMonth, nextMonth;
				sp = that.get('id').split('-');
				year = parseInt(sp[0], 10);
				month = parseInt(sp[1], 10);
				
				if (month === 1) {
					prevMonth = app.Util.formatNumber(year - 1, 4) + '-12';
				} else {
					prevMonth = app.Util.formatNumber(year, 4) + '-' + app.Util.formatNumber(month - 1, 2);
				}
				if (month === 12) {
					nextMonth = app.Util.formatNumber(year + 1, 4) + '-01';
				} else {
					nextMonth = app.Util.formatNumber(year, 4) + '-' + app.Util.formatNumber(month + 1, 2);
				}

				return {
					prevMonth: prevMonth,
					nextMonth: nextMonth
				};
			}())
		);
	}
});