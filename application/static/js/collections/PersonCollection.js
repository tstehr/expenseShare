var app = app || {};

(function (app) {
	'use strict';

	app.PersonCollection = Backbone.Collection.extend({
		model: app.Person,
		url: 'person',
		initialize: function () {
			this.listenTo(this, 'change:name change:hidden', this.sort);
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
		},
	});

}(app));