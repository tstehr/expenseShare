var app = app || {};

app.PersonList = Backbone.Collection.extend({
	model: app.Person,
	url: 'api/persons',
	comparator: function (person) {
		console.log('comparator', person);
		// TODO fix handeling of umlauts
		return person.get('name').toLowerCase();
	}
});