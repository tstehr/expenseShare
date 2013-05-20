var app = app || {};

app.PersonCollectionView = app.AListView.extend({
	tagName: 'ul',
	createView: function (model) {
		return new app.PersonView({model: model});
	}
});