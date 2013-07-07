var app = app || {};

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
		app.appView.showMonthView(date);
	},
	showMonthTransfers: function (date) {
		app.appView.showMonthView(date, true);
	},
	editExpense: function (date, id) {
		app.appView.showExpenseEditView(date, id);
	},
	createExpense: function (date) {
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
		var now = new Date();
		var date = app.Util.formatNumber(now.getFullYear(), 4) + '-' + app.Util.formatNumber(now.getMonth() + 1, 2); 
		app.appView.showMonthView(date);
	},
	showError: function (path) {
		app.appView.showErrorView('The URL you entered is invalid');
	}
});
