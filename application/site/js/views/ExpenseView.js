var app = app || {};

app.ExpenseView = app.AView.extend({
	tagName: 'li',
	className: 'expense',
	
	template: _.template($('#expense-template').html()),
	initialize: function () {
		this.listenTo(this.model, 'change:description pseudochange', this.render);
	},
	render: function () {
		this.$el.html(this.template(this.model.toJSONDecorated()));

		if (!this.model.isValid()) {
			this.$el.addClass('invalid')
		} else {
			this.$el.removeClass('invalid');
		} 

		return this;
	}
});