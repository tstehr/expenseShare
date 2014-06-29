var app = app || {};

(function (app) {
	'use strict';

	/**
	 * A month. No further explaination needed
	 */
	app.Month = Backbone.RelationalModel.extend({
		defaults: {
			id: null,
			amount: 0
		},

		relations: [
			{
				key: 'expenses',
				type: Backbone.HasMany,
				relatedModel: 'app.Expense',
				includeInJSON: Backbone.Model.prototype.idAttribute,
				collectionType: 'app.ExpenseCollection',
				reverseRelation: {
					key: 'month',
					includeInJSON: Backbone.Model.prototype.idAttribute
				}
			}, {
				key: 'transfers',
				type: Backbone.HasMany,
				relatedModel: 'app.Transfer',
				includeInJSON: Backbone.Model.prototype.idAttribute,
				collectionType: 'app.TransferCollection',
				reverseRelation: {
					key: 'month',
					includeInJSON: Backbone.Model.prototype.idAttribute
				}
			}
		],

		urlRoot: 'month',
		initialize: function () {
			this.decorators = [];
			
			this.updateAmountAndTransfers();
			this.updateAmountAndTransfersDecounced = _.debounce(this.updateAmountAndTransfers, 200);

			this.listenTo(this.get('expenses'), 'pseudochange change add remove', function () {
				this.trigger('pseudochange');
				this.updateAmountAndTransfersDecounced();
			});

			// TODO reenable ioBind
			// this.ioBind('createExpense', function (data) {
			// 	this.get('expenses').add(data);
			// });
		},
		updateAmountAndTransfers: function () {
			var data, transfers;

			data = this.getAmounts();

			this.set('amount', data.amount);

			this.updateTransfers(data.personAmountMap);

		},
		getAmounts: function () {
			// pam := personAmountMap
			var pam = {}, amount;

			// calculate total
			amount = this.get('expenses').reduce(function (memo, expense) {
				var expenseAmount = 0, perParticipant, participants = [];

				if (expense.isValid()) {
					// add up per person

					// add up all contributions by participants
					expense.get('participations').forEach(function (part) {
						var personId;
						if (part && part.get('person')) {
							personId = part.get('person').get('id');

							pam[personId] = pam[personId] || 0;
							if (typeof part.get('amount') === 'number') {
								expenseAmount += part.get('amount');
								pam[personId] += part.get('amount');
							}

							// remember participating persons to subtract their part
							if (part.get('participating') == true) {
								participants.push(personId);
							}
						}
					});

					if (expenseAmount !== 0) {
						perParticipant = expenseAmount / participants.length;

						participants.forEach(function (personId) {
							pam[personId] = pam[personId] || 0;
							pam[personId] -= perParticipant;
						});

						// add up total
						memo += expenseAmount;
					}
				} 
				return memo;
			}, 0);

			return {
				amount: amount,
				personAmountMap: pam
			};
		},
		updateTransfers: function (pam) {
			var INSIGNIFICANCE_CUTOFF, month, personIds, transfers, high, low;

			// values smaller than this are ignored by the algorithm
			INSIGNIFICANCE_CUTOFF = 4;

			transfers = [];
			month = this;

			personIds = Object.keys(pam);

			high = [];
			low = [];

			// spilt pam in high (> 0) and low (< 0) values
			personIds.forEach(function (personId) {
				var data = {
					id: personId,
					val: pam[personId]
				};
				if (pam[personId] < 0) {
					low.push(data);
				} else if (pam[personId] > 0) {
					high.push(data);
				}
			});

			// sort from highest to lowest (by absolute) 
			high = _.sortBy(high, 'val').reverse();
			low = _.sortBy(low, 'val');
			
			high.forEach(function (highEl) {
				low.every(function (lowEl) {
					var change, transfer, moneyLeft = true;

					if (Math.abs(lowEl.val) > INSIGNIFICANCE_CUTOFF) {
						// Move money from high to low
						change = Math.min(highEl.val, Math.abs(lowEl.val));

						highEl.val -= change;
						lowEl.val += change;

						transfer = month.fetchTransfer(lowEl.id, highEl.id, change);
						transfers.push(transfer);


						// stop once there is no money left on the current high account anymore
						if (highEl.val <= INSIGNIFICANCE_CUTOFF) {
							moneyLeft = false;
						}
					}
					return moneyLeft;
				});
			});
			
			this.get('transfers').difference(transfers).forEach(function (transfer) {
				transfer.destroy();
			});
			
			this.get('transfers').set(transfers);
		},
		fetchTransfer: function(fromId, toId, amount) {
			var transfer = this.get('transfers').findWhere({
				fromPerson: app.Person.findOrCreate({id: fromId}),
				toPerson: app.Person.findOrCreate({id: toId}),
			});
			
			if (transfer) {
				transfer.set('amount', amount)
			} else {
				transfer = new app.Transfer({
					fromPerson: app.Person.findOrCreate({id: fromId}),
					toPerson: app.Person.findOrCreate({id: toId}),
					month: this,
					amount: amount
				});
				transfer.fetch();
			}
			
			return transfer;
		},
		getMonthData: function () {
			return app.Util.parseMonthId(this.get('id'));
		},
		getRelatedMonths: function () {
			var prevMonth, nextMonth;
			var data = app.Util.parseMonthId(this.get('id'));
			
			if (data.month === 1) {
				prevMonth = app.Util.formatNumber(data.year - 1, 4) + '-12';
			} else {
				prevMonth = app.Util.formatNumber(data.year, 4) + '-' + app.Util.formatNumber(data.month - 1, 2);
			}
			if (data.month === 12) {
				nextMonth = app.Util.formatNumber(data.year + 1, 4) + '-01';
			} else {
				nextMonth = app.Util.formatNumber(data.year, 4) + '-' + app.Util.formatNumber(data.month + 1, 2);
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
				this.getMonthData(),
				this.getRelatedMonths(),
				{
					transfers: {}
				}
			);
		}
	});

	app.Month.findOrCreateAndFetch = function (monthId) {
		var alreadyExists, month, def;

		def = Q.defer();

		alreadyExists = !!app.Month.findOrCreate({id: monthId}, {
			create: false
		}); 
		month = app.Month.findOrCreate({id: monthId});

		if (alreadyExists) {
			def.resolve(month);
		} else {
			Q.when(month.fetch())
				.then(function () {
					return Q.all(month.fetchRelated('expenses'));
				})
				.then(function () {
					var promises = [];
					month.get('expenses').forEach(function (expense) {
						promises = promises.concat(expense.fetchRelated('participations'));
					})
					return Q.all(promises);
				})
				.then(function () {
					def.resolve(month);
				}, function (err) {
					def.reject(err);
				})
				.done()
			;
		}

		return def.promise;
	};
	
}(app));