var app = app || {};

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
		includeInJSON: Backbone.Model.prototype.idAttribute,
		autoFetch: true
	}],
	urlRoot: '/api/participations',
	initialize: function () {
		// TODO respond to "destroy" of this.person

		// wait until person is availible
		this.listenTo(this, 'change:person', (function () {
			// trigger pseudochange event when person changes, since its value is used in toJSONDecorated
			this.listenTo(this.get('person'), 'change:name', (function () {
				this.trigger('pseudochange');
			}.bind(this)));
		}.bind(this)));
	},
	toJSONDecorated: function () {
		return _.extend(this.toJSON(), {
			personName: this.get('person') ? this.get('person').get('name') : 'Anonymus'
		});
	}
})