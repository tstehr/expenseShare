var app = app || {};

/**
 * A person who's regularly participating is expenses
 */
app.Person = Backbone.RelationalModel.extend({
	defaults: {
		id: null,
		name: null
	},
	urlRoot: '/api/persons'
});