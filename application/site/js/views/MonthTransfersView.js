app = app || {};

app.MonthTransfersView = app.AView.extend({
	tagName: 'div',
	template: _.template($('#month-transfers-template').html()),
	render: function () {
		this.$el.html(this.template(this.model.toJSONDecorated()));
		return this;
	}
});