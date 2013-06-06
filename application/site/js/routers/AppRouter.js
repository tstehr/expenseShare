var app = app || {};

// TODO implement this. should interact with AppView
// Idea: http://addyosmani.github.io/backbone-fundamentals/#routers

// Routen
// /month/[YYYY]-[dd]  app.appView.showMonth
// /expense/[id]
// /persons/

app.AppRouter = Backbone.Router.extend({
	routes: {
		'month/:date': 'showMonth',
		'month/:data/transfers': 'showMonthTransfers',
		'expense/:id': 'editExpense',
		'month/:date/createExpense': 'createExpense',
		'persons': 'showPersons',
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
	editExpense: function (id) {
		app.appView.showExpenseEditView(id);
	},
	createExpense: function (date) {
		var expense = new app.Expense({
			month: date
		});
		app.appView.setActiveView(new app.ExpenseEditView({
			model: expense
		}));
	},
	showPersons: function () {
		app.appView.showPersonView();
	},
	showCurrentMonth: function (path) {
		var now = new Date();
		var currentMonth = app.Util.formatNumber(now.getFullYear(), 4) + '-' + app.Util.formatNumber(now.getMonth() + 1, 2); 
		this.navigate('month/' + currentMonth, true);
	},
	showError: function (path) {
		// TODO add proper error handeling
		alert('The destination you\'ve called is not availible: "' + path + '"')
	}
});
