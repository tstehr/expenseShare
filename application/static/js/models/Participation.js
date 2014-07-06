var app = app || {};

(function (app) {
	'use strict';

	/**
	 * Connecting a person with an expense
	 */
	app.Participation = Backbone.RelationalModel.extend({
		defaults: {
			id: null,
			participating: false,
			amount: 0
		},
		relations: [{
			type: Backbone.HasOne,
			key: 'person',
			relatedModel: 'app.Person',
			includeInJSON: Backbone.Model.prototype.idAttribute
		}],
		urlRoot: 'participation',
		initialize: function () {
			if (this.get('person')) {
				this.listenTo(this.get('person'), 'change destroy', (function () {
					this.trigger('pseudochange', this);
				}.bind(this)));
			}


			// TODO reenable ioBind
			// if (this.isNew()) {
			// 	this.listenToOnce(this, 'sync', this.doIoBind.bind(this));
			// } else {
			// 	this.doIoBind();
			// }
		},
		toJSONDecorated: function () {
			return _.extend(this.toJSON(), {
				personName: this.get('person').get('name')
			});
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
				this.save();
			}
		},
	});

}(app));