var app = app || {};

app.ExpenseCollectionView = app.ACollectionView.extend({
	tagName: 'ul',
	createView: function (model) {
		return new app.ExpenseView({model: model});
	}
});