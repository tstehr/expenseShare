var app = app || {};

app.MonthView = Backbone.View.extend({
	tagName: 'div',
	template: _.template($('#month-template').html()),
	initialize: function () {
		this.expenseCollectionView = new app.ExpenseCollectionView({
			collection: this.model.get('expenses')
		});

		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model.get('expenses'), 'change add remove', this.render);
	},
	destroy: function () {
		this.remove();
	},
	render: function () {
		// TODO decouple
		this.$el.html(this.template(this.model.toJSONDecorated()));
		this.expenseCollectionView.setElement(this.$('ul'));
		this.expenseCollectionView.render();
		return this;
	}
});