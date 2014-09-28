var app = app || {};

(function (app) {
	'use strict';

	/**
	 * Connecting a person with an expense
	 */
	app.Participation = Backbone.RelationalModel.extend({
		defaults: {
			participating: false,
			amount: 0
		},
		relations: [{
			type: Backbone.HasOne,
			key: 'person',
			relatedModel: 'app.Person',
			includeInJSON: Backbone.Model.prototype.idAttribute
		}],
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
			this.ioBind('delete', function () {
				if (this.collection) {
					this.collection.remove(this);
				}
				this.set('id', null);
			});
		},
		isEmpty: function () {
			return this.get('amount') === 0 && !this.get('participating');
		},
		saveIfNotNew: function () {
			if (this.get('expense') && !this.get('expense').isNew()) {
				return this.get('expense').save();
			}
		},
	});

}(app));