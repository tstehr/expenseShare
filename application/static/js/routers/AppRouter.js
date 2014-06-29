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
		initialize: function (appView) {
			this.appView = appView;

			this.route(/(.*)\/+$/, 'removeTrailingSlashes', function (path) {
				path = path.replace(/(\/)+$/, '');
				this.navigate(path, true);
			});
		},
		showMonth: function(date) {
			date = '2000-01';
			this.appView.showMonthView(date);
		},
		showMonthTransfers: function (date) {
			date = '2000-01';
			this.appView.showMonthView(date, true);
		},
		editExpense: function (date, id) {
			date = '2000-01';
			this.appView.showExpenseEditView(date, id);
		},
		createExpense: function (date) {
			date = '2000-01';
			this.appView.showExpenseCreateView(date);
		},
		showPersons: function () {
			this.appView.showPersonsView();
		},
		editPerson: function (id) {
			this.appView.showPersonEditView(id);
		},
		createPerson: function () {
			this.appView.showPersonCreateView();
		},
		showCurrentMonth: function (path) {
			var date = '2000-01';
			this.appView.showMonthView(date);
		},
		showError: function (path) {
			this.appView.showErrorView('The URL you entered is invalid');
		}
	});
	
}(app));