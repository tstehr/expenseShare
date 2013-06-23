var app = app || {};

app.PersonCollection = Backbone.Collection.extend({
	model: app.Person,
	url: '/api/persons',
	comparator: function (person) {
		return app.Util.normalizeComparison(person.get('name'));
	}
});
