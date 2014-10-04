var app = app || {};

(function (app) {
	'use strict';

	/**
	 * A person who's regularly participating is expenses
	 */
	app.Person = Backbone.RelationalModel.extend({
		defaults: {
			_id: null,
			name: '',
			hidden: false
		},
		urlRoot: 'person',
		saveIfNotNew: function () {
			if (!this.isNew()) {
				this.save();
			}
		},
	});
	
}(app));