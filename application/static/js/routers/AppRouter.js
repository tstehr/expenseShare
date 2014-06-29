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
			'transfers': 'showTransfers',
			'expenses/new': 'createExpense',
			'expenses/:id': 'editExpense',
			'': 'showHome',
			'*path': 'showError'
		},
		initialize: function (appView) {
			this.appView = appView;

			this.route(/(.*)\/+$/, 'removeTrailingSlashes', function (path) {
				path = path.replace(/(\/)+$/, '');
				this.navigate(path, true);
			});
		},
		showMonth: function() {
		},
		showTransfers: function () {
			this.appView.showExpensesView(true);
		},
		editExpense: function (id) {
			this.appView.showExpenseEditView(id);
		},
		createExpense: function () {
			this.appView.showExpenseCreateView();
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
		showHome: function () {
			this.appView.showExpensesView();
		},
		showError: function (path) {
			this.appView.showErrorView('The URL you entered is invalid');
		}
	});
	
}(app));