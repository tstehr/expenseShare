var app = app || {};

app.ExpenseView = app.AView.extend({
	tagName: 'li',
	template: _.template($('#expense-template').html()),
	initialize: function () {
		this.listenTo(this.model, 'change:description pseudochange', this.render);
	},
	render: function () {
		this.$el.html(this.template(this.model.toJSONDecorated()));
		return this;
	}
});