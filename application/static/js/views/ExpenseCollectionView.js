var app = app || {};


(function (app) {
	'use strict';

	app.ExpenseCollectionView = app.ACollectionView.extend({
		tagName: 'ul',
		createView: function (model) {
			return new app.ExpenseView({model: model});
		},
	});
	
}(app));