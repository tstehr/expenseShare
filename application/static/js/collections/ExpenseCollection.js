var app = app || {};

(function (app) {
	'use strict';

	app.ExpenseCollection = Backbone.Collection.extend({
		model: app.Expense,
		url: 'expense',
		comparator: function (e1, e2) {
			return e1.get('created') > e2.get('created') ? -1 : 1;		
		},
	});
}(app));