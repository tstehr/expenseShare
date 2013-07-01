var app = app || {};

app.ErrorView = app.AView.extend({
	tagName: 'section',
	className: 'module',

	template: _.template($('#module-template').html()),

	render: function () {
		this.$el.html(this.template({
			title: this.options.title || 'Error',
			body: this.options.message
		}));
		return this;
	}
})