var app = app || {};

app.PersonCollection = Backbone.Collection.extend({
	model: app.Person,
	url: 'persons',
	initialize: function () {
		this.listenTo(this, 'change:name change:hidden', this.sort);

		this.ioBind('create', function (data) {
			if (this.get(data.id)) {
				this.get(data.id).set(data);
			} else {
				this.add(data);
			}
		});
	},
	comparator: function (p1, p2) {
		if (
			(p1.get('hidden') && p2.get('hidden')) ||
			(!p1.get('hidden') && !p2.get('hidden'))
		) {
			return app.Util.normalizeComparison(p1.get('name')) < app.Util.normalizeComparison(p2.get('name')) ? -1 : 1;
		} else {
			return p1.get('hidden') ? 1 : -1;
		}
	}
});
