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
		'expense/:id': 'editExpense',
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
	editExpense: function (id) {
		app.appView.showExpenseEditView(id);
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
