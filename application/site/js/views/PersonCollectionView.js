var app = app || {};

app.PersonCollectionView = app.ACollectionView.extend({
	tagName: 'ul',
	createView: function (model) {
		return new app.PersonView({model: model});
	}
});