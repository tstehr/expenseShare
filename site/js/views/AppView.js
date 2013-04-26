var app = app || {};

app.AppView = Backbone.View.extend({
	initialize: function () {
		// TODO use a template and bind the model elements to elements in the template instead of 
		// appending to this.$el
		this.expenseListView = new app.ExpenseListView({
			collection: app.expenses
		});

		this.personListView = new app.PersonListView({
			collection: app.persons
		});
	},
	render: function () {
		this.$el.append(this.expenseListView.render().el);
		this.$el.append(this.personListView.render().el);
	},
	showExpenses: function () {
		
	}
});