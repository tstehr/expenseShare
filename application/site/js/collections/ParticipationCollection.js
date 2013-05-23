var app = app || {};

app.ParticipationCollection = Backbone.Collection.extend({
	model: app.Participation,
	comparator: function (part) {
		// TODO fix handeling of umlauts
		return;// app.Util.normalizeComparison(part.get('person').get('name')); // part.get('person').get('name').toLowerCase();
	},
	getByPerson: function (person) {
		return this.find(function (part) {
			return part.get('person').id == person.id;
		});
	}
});
