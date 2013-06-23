var app = app || {};

/**
 * A person who's regularly participating is expenses
 */
app.Person = Backbone.RelationalModel.extend({
	defaults: {
		id: null,
		name: ''
	},
	initialize: function () {
		this.listenTo(this, 'change', _.debounce(function () {
			if (!this.isNew()) {
				this.save();
			}
		}, 300));
	},
	urlRoot: '/api/persons'
});