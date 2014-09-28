var app = app || {};

(function (app) {
	'use strict';

	/**
	 * The application dataset
	 */
	app.App = Backbone.RelationalModel.extend({
		defaults: {
			amount: 0
		},

		relations: [
			{
				key: 'persons',
				type: Backbone.HasMany,
				relatedModel: 'app.Person',
				collectionType: 'app.PersonCollection',
			}, {
				key: 'expenses',
				type: Backbone.HasMany,
				relatedModel: 'app.Expense',
				collectionType: 'app.ExpenseCollection',
			}, {
				key: 'transfers',
				type: Backbone.HasMany,
				relatedModel: 'app.Transfer',
				collectionType: 'app.TransferCollection',
			}
		],

		initialize: function () {
			this.updateAmountAndTransfers();
			this.updateAmountAndTransfersDecounced = _.debounce(this.updateAmountAndTransfers, 200);

			this.listenTo(this.get('expenses'), 'pseudochange change add remove', function () {
				this.trigger('pseudochange');
				this.updateAmountAndTransfersDecounced();
			});
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
							personId = part.get('person').id;

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
			var INSIGNIFICANCE_CUTOFF, personIds, transfers, high, low;

			// values smaller than this are ignored by the algorithm
			INSIGNIFICANCE_CUTOFF = 4;

			transfers = [];

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

						transfer = this.fetchTransfer(lowEl.id, highEl.id, change);
						transfers.push(transfer);

						// stop once there is no money left on the current high account anymore
						if (highEl.val <= INSIGNIFICANCE_CUTOFF) {
							moneyLeft = false;
						}
					}
					return moneyLeft;
				}.bind(this));
			}.bind(this));
			
			this.get('transfers').difference(transfers).forEach(function (transfer) {
				transfer.destroy();
			});
			
			this.get('transfers').set(transfers);
		},
		fetchTransfer: function(fromId, toId, amount) {
			var transfer = this.get('transfers').findWhere({
				fromPerson: app.Person.findOrCreate({_id: fromId}),
				toPerson: app.Person.findOrCreate({_id: toId}),
			});
			
			if (transfer) {
				transfer.set('amount', amount);
			} else {
				transfer = new app.Transfer({
					fromPerson: app.Person.findOrCreate({_id: fromId}),
					toPerson: app.Person.findOrCreate({_id: toId}),
					amount: amount
				});
			}
			
			return transfer;
		},
	});
	
}(app));