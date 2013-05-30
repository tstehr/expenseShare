app = app || {};

app.MonthTransfersView = app.AView.extend({
	tagName: 'div',

	template: _.template($('#month-transfers-template').html()),

	initialize: function () {
		this.listenTo(this.model, 'change pseudochange', this.render);
	},
	render: function () {
		this.$el.html(this.template(this.model.toJSONDecorated()));
		return this;
	}
});