var app = app || {};


(function (app) {
	'use strict';

	// TODO implement this. should interact with AppView
	// Idea: http://addyosmani.github.io/backbone-fundamentals/#routers

	app.AppRouter = Backbone.Router.extend({
		routes: {
			'persons': 'showPersons',
			'persons/new': 'createPerson',
			'persons/:id': 'editPerson',
			':date/transfers': 'showMonthTransfers',
			':date/expenses/new': 'createExpense',
			':date/expenses/:id': 'editExpense',
			':date': 'showMonth',
			'': 'showCurrentMonth',
			'*path': 'showError'
		},
		initialize: function () {
			this.route(/(.*)\/+$/, 'removeTrailingSlashes', function (path) {
				path = path.replace(/(\/)+$/, '');
				this.navigate(path, true);
			});
		},
		showMonth: function(date) {
			date = '2000-01';
			app.appView.showMonthView(date);
		},
		showMonthTransfers: function (date) {
			date = '2000-01';
			app.appView.showMonthView(date, true);
		},
		editExpense: function (date, id) {
			date = '2000-01';
			app.appView.showExpenseEditView(date, id);
		},
		createExpense: function (date) {
			date = '2000-01';
			app.appView.showExpenseCreateView(date);
		},
		showPersons: function () {
			app.appView.showPersonsView();
		},
		editPerson: function (id) {
			app.appView.showPersonEditView(id);
		},
		createPerson: function () {
			app.appView.showPersonCreateView();
		},
		showCurrentMonth: function (path) {
			var date = '2000-01';
			app.appView.showMonthView(date);
		},
		showError: function (path) {
			app.appView.showErrorView('The URL you entered is invalid');
		}
	});
	
}(app));