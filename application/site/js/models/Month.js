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
		var MAX_CHANGE_FRACTION = 1, MAX_ITERATIONS = 1e4, CUTOFF = 1e-4;

		var personCids, changes, transfers, maxPerPerson, randomness, change, sd, p1, p2, pFrom, pTo, i;

		personCids = Object.keys(pam);

		changes = {};
		transfers = {};
		personCids.forEach(function (personCid) {
			changes[personCid] = 0;
			transfers[personCid] = {};
		});

		maxPerPerson = _.max(pam, function (x) {
			return Math.abs(x);
		});

		randomness = 1;

		i = 0;

		do {
			change = (maxPerPerson * MAX_CHANGE_FRACTION) * (Math.random() * randomness);

			p1 = personCids[app.Util.randomInt(0, personCids.length - 1)];
			do {
				p2 = personCids[app.Util.randomInt(0, personCids.length - 1)];
			} while (p2 === p1);

			if (pam[p1] + changes[p1] < pam[p2] + changes[p2]) {
				pFrom = p1;
				pTo = p2;
			} else {
				pFrom = p2;
				pTo = p1;
			}
			changes[pFrom] = (changes[pFrom] || 0) + change;
			changes[pTo] = (changes[pTo] || 0) - change;
			transfers[pFrom][pTo] = (transfers[pFrom][pTo] || 0) + change;

			sd = Math.sqrt(_.reduce(personCids, function (memo, personCid) {
				return memo + Math.pow(pam[personCid] + (changes[personCid] || 0), 2);
			}, 0) / personCids.length) / maxPerPerson;
			
			randomness = Math.exp(sd) - 1;

			i++;
		} while (sd > CUTOFF && i < MAX_ITERATIONS);

		console.group(i, sd, randomness);
		console.log(pam);
		console.log(changes);
		console.log(transfers);
		console.groupEnd();
	},
	randomPam: function(cids) {
		var MAX = 2000, IT = 500;
		var pam = {}, p1, p2;

		for (var i; i < IT; i++) {
			p1 = personCids[app.Util.randomInt(0, personCids.length - 1)];
			do {
				p2 = personCids[app.Util.randomInt(0, personCids.length - 1)];
			} while (p2 === p1);
		}
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