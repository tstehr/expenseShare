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
		collectionType: 'app.ExpenseCollection',
		autoFetch: true,
		reverseRelation: {
			key: 'month',
			includeInJSON: Backbone.Model.prototype.idAttribute
		}
	}],
	urlRoot: '/api/months',
	getAmountAndTransfers: function () {
		// pam := personAmountMap
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

			// TODO correctly ignore invalid expenses
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
			transfers: this.distributePam(pam)
		};
	},
	distributePam: function (pam) {
		var INSIGNIFICANCE_CUTOFF, personCids, transfers, high, low;

		// values smaller than this are ignored by the algorithm
		INSIGNIFICANCE_CUTOFF = 4;

		var sum = _.reduce(pam, function (memo, x) {
			return memo + x;
		}, 0);
		if (Math.abs(sum) > INSIGNIFICANCE_CUTOFF) {
			throw new TypeError('Input not balanced!');
		}

		personCids = Object.keys(pam);
		transfers = {};
		personCids.forEach(function (personCid) {
			transfers[personCid] = {};
		});

		high = [];
		low = [];

		// spilt pam in high (> 0) and low (< 0) values
		personCids.forEach(function (personCid) {
			var data = {
				id: personCid,
				val: pam[personCid]
			};
			if (pam[personCid] < 0) {
				low.push(data);
			} else if (pam[personCid] > 0) {
				high.push(data);
			}
		});

		// sort from highest to lowest (by absolute) 
		high = _.sortBy(high, 'val').reverse();
		low = _.sortBy(low, 'val');
		
		high.forEach(function (highEl) {
			low.every(function (lowEl) {
				var change;

				if (Math.abs(lowEl.val) > INSIGNIFICANCE_CUTOFF) {
					// Move money from high to low
					change = Math.min(highEl.val, Math.abs(lowEl.val));

					highEl.val -= change;
					lowEl.val += change;

					// remmeber amount of transferred money
					transfers[lowEl.id][highEl.id] = change;

					// stop once there is no money left current high account anymore
					if (highEl.val <= INSIGNIFICANCE_CUTOFF) {
						return false;
					}
				}
				return true;
			});
		});

		return transfers;
	},
	getRelatedMonths: function () {
		var sp, month, year, prevMonth, nextMonth;
		sp = this.get('id').split('-');
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
	},
	toJSONDecorated: function() {
		var that = this;

		return _.extend(
			this.toJSON(), 
			this.getAmountAndTransfers(), 
			this.getRelatedMonths()
		);
	}
});