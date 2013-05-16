var app = app || {};

app.MonthView = Backbone.View.extend({
	tagName: 'div',
	template: _.template($('#month-template').html()),
	initialize: function () {
		this.expenseListView = new app.ExpenseListView({
			collection: this.model.get('expenses')
		})
	},
	destroy: function () {
		this.remove();
	},
	render: function () {
		this.$el.html(this.template(this.model.toJSON()));
		this.expenseListView.setElement(this.$('ul'));
		this.expenseListView.render();
		return this;
	}
});