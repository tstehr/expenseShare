var app = app || {};

app.ExpenseListView = app.AListView.extend({
	tagName: 'ul',
	createView: function (model) {
		return new app.ExpenseView({model: model});
	}
});