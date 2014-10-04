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