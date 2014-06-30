var app = app || {};

(function (app) {
	'use strict';

	// TODO add some kind of pagination/caching to avoid having to always load all expenses
	// Ideas: https://gist.github.com/aniero/705733 https://github.com/GeReV/Backbone.PagedCollection
	app.ExpenseCollection = Backbone.Collection.extend({
		model: app.Expense,
		url: 'expenses',
		// TODO iobind me
		comparator: function (e1, e2) {
			return e1.get('created') > e2.get('created') ? -1 : 1;		
		}
	});
}(app));