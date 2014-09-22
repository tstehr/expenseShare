var app = app || {};


(function (app) {
	'use strict';

	app.CarryoverView = app.AView.extend({
		tagName: 'div',
		className: 'module',

		events: {
			'click button.scan': 'scan',
			'click button.do': 'do',
		},
		
		template: _.template(
			'Start: <input type="text" class="start">' + 
			'<button type="button" class="scan">Scan!</button> <button type="button" class="do">Do!</button>' + 
			'<div class="module-body"> <pre class="log">Log: <br></pre></div>'
		),
		
		initialize: function () {
			this.scanStarted = false;
			this.scanFinished = false;
			this.doStarted = false;
			this.newExpenses = [];
		},

		render: function () {
			this.$el.html(this.template({

			}));

			return this;
		},

		scan: function () {
			if (this.scanStarted) {
				this.log('Already scanned!');
				return;
			}
			this.scanStarted = true;

			var startMonth;
			try {
				startMonth = app.Util.parseMonthId(this.$('.start').val());
			} catch (e) {
				this.log(e);
				this.scanStarted = false;
				return;
			}

			var month = new Date(startMonth.year, startMonth.month - 1, 1);

			var now = new Date();
			var currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

			var monthPromises = [];

			while (month.getTime() < currentMonth.getTime()) {
				monthPromises.push(this.handleMonth(month));
				month = new Date(month.getFullYear(), month.getMonth()+1, 1);
			}	

			Q.all(monthPromises).then(function () {
				this.log('Total:' + this.newExpenses.length);
				this.log('Scan finished!<br>');
				this.scanFinished = true;
			}.bind(this));
		},

		handleMonth: function (monthDate) {
			var monthId = this.getMonthId(monthDate);

			var month = null;

			return app.Month.findOrCreateAndFetch(monthId)
				.then(function (theMonth) {
					month = theMonth;

					month.updateAmountAndTransfers();

					var transferPromises = month.get('transfers').map(function (transfer) {
						return transfer.fetch();
					});

					return Q.all(transferPromises);
				})
				.then(function () {
					this.log(monthId);
					this.log('  Transfers: ' + month.get('transfers').length);
					
					var unpaid =  month.get('transfers').filter(function (transfer) {
						return !transfer.get('paid');
					});

					this.log('  Unpaid Transfers: ' + unpaid.length);

					var unpaidExpenses = unpaid.map(function (transfer) {
						var fromPerson = transfer.get('fromPerson');
						var toPerson = transfer.get('toPerson');

						var expense = new app.Expense({
							description: 'Übertrag ' + monthId + ', ' + 
								fromPerson.get('name')  + '->' + toPerson.get('name') + ', ' + 
								app.Util.formatCurrency(transfer.get('amount')),
						});

						var fromParticipation = new app.Participation({
							person: fromPerson,
							participating: true,
						});

						var toParticipation = new app.Participation({
							person: toPerson,
							participating: false,
							amount: transfer.get('amount'),
						});

						expense.get('participations').push(fromParticipation);
						expense.get('participations').push(toParticipation);

						this.log('    ' + expense.get('description'));

						return [transfer, expense];
					}.bind(this));

					this.newExpenses = this.newExpenses.concat(unpaidExpenses);
				}.bind(this))
			;
		},

		do: function () {
			if (!this.scanFinished) {
				this.log('Scan first!');
			}

			if (this.doStarted) {
				this.log('Already done!');
			}
			this.doStarted = true;

			var currentMonth = this.getMonthId(new Date());

			this.log('Current Month: ' + currentMonth);

			this.newExpenses.forEach(function (arr) {
				var transfer = arr[0];
				var expense = arr[1];

				this.log(expense.get('description'));

				transfer.set('paid', true);
				transfer.save();

				expense.set('month', currentMonth);
				expense.save()
					.then(function () {
						expense.get('participations').forEach(function (participation) {
							participation.save();
						});
					})
				;
			}.bind(this));
		},

		log: function (str) {
			this.$('.log').append(str + '<br>');
		},

		getMonthId: function (date) {
			return app.Util.formatNumber(date.getFullYear(), 4) + '-' + app.Util.formatNumber(date.getMonth() + 1, 2); 
		}
	});
	
}(app));