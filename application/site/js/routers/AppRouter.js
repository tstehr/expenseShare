var app = app || {};

// TODO implement this. should interact with AppView
// Idea: http://addyosmani.github.io/backbone-fundamentals/#routers
//app.ExpenseShareRouter = Backbone.Router.extend({
//	"month" : 
// Routen
// /month/[YYYY]-[dd]  app.appView.showMonth
// /expense/[id]
// /persons/
//});

var expenseRouter = Backbone.Router.extend({
	routes: {
		"monthView/:date" : "showByDate"
	},
	showByDate: function(date){
	//	document.write(date);
		app.appView.showMonth(date);
	},
	});
