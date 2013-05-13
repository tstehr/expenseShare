var app = app || {};

app.AppView = Backbone.View.extend({
	initialize: function () {
		// TODO use a template and bind the model elements to elements in the template instead of 
		// appending to this.$el

		this.personListView = new app.PersonListView({
			collection: app.persons
		});
	},
	render: function () {
		console.log('abc');
		this.$el.append(this.personListView.render().el);
	}
});