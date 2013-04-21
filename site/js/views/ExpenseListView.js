var app = app || {};

app.ExpenseListView = app.AListView.extend({
	createView: function (model) {
		return new app.ExpenseView({model: model});
	}
});