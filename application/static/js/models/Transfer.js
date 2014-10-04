var app = app || {};

(function (app) {
	'use strict';

	// TODO make this not sync
	app.Transfer = Backbone.RelationalModel.extend({
		defaults: {
			amount: 0,
		},

		relations: [
			{
				type: Backbone.HasOne,
				key: 'fromPerson',
				relatedModel: 'app.Person',
				includeInJSON: Backbone.Model.prototype.idAttribute
			}, {
				type: Backbone.HasOne,
				key: 'toPerson',
				relatedModel: 'app.Person',
				includeInJSON: Backbone.Model.prototype.idAttribute
			}
		],
		
		initialize: function () {
			this.listenTo(this.get('fromPerson'), 'change destroy', function () {
				this.trigger('pseudochange');
			});
			this.listenTo(this.get('toPerson'), 'change destroy', function () {
				this.trigger('pseudochange');
			});
		},
		toJSONDecorated: function () {
			return _.extend(this.toJSON(), {
				fromPersonName: this.get('fromPerson').get('name'),
				toPersonName: this.get('toPerson').get('name')
			});
		},
	});

}(app));