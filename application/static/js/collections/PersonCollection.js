var app = app || {};

app.PersonCollection = Backbone.Collection.extend({
	model: app.Person,
	url: 'persons',
	initialize: function () {
		this.ioBind('create', function (data) {
			if (this.get(data.id)) {
				this.get(data.id).set(data);
			} else {
				this.add(data);
			}
		});
	},
	comparator: function (person) {
		return app.Util.normalizeComparison(person.get('name'));
	}
});
