var app = app || {};

app.PersonListView = app.AListView.extend({
	createView: function (model) {
		return new app.PersonView({model: model});
	}
});