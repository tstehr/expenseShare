var app = app || {};

app.ExpenseCollectionView = app.AListView.extend({
	tagName: 'ul',
	createView: function (model) {
		return new app.ExpenseView({model: model});
	}
});