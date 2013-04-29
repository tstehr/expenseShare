var app = app || {};

app.PersonListView = app.AListView.extend({
	tagName: 'ul',
	createView: function (model) {
		return new app.PersonView({model: model});
	}
});