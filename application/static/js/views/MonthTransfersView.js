app = app || {};

app.MonthTransfersView = app.AView.extend({
	tagName: 'section',
	className: 'month-transfers',

	template: _.template($('#month-transfers-template').html()),

	initialize: function () {
		this.listenTo(this.model, 'change pseudochange', this.render);
	},
	render: function () {
		this.$el.html(this.template(this.model.toJSONDecorated()));
		return this;
	}
});