var app = app || {};

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
		// TODO respond to "destroy" of this.person
		// this.listenTo(this.person, 'destroy', ...)
	}
})