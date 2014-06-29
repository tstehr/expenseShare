var app = app || {};

(function (app) {
	'use strict';

	/**
	 * A person who's regularly participating is expenses
	 */
	app.Person = Backbone.RelationalModel.extend({
		defaults: {
			id: null,
			name: '',
			hidden: false
		},
		urlRoot: 'person',
		initialize: function () {
			// TODO reenable ioBind
			// if (this.isNew()) {
			// 	this.listenToOnce(this, 'sync', this.doIoBind.bind(this));
			// } else {
			// 	this.doIoBind();
			// }
		},
		doIoBind: function () {
			this.ioBind('update', function (data) {
				this.set(data);
			});

			this.ioBind('delete', function (data) {
				if (this.collection) {
					this.collection.remove(this);
				}
				this.set('id', null);
			});
		},
		saveIfNotNew: function () {
			if (!this.isNew()) {
				this.save();
			}
		}
	});
	
}(app));