var app = app || {};

app.ErrorView = app.AView.extend({
	tagName: 'section',
	className: 'module',

	template: _.template($('#module-template').html()),

	render: function () {
		var msg;
		console.log(this.options.error instanceof Error, typeof this.options.error);
		if (this.options.error instanceof Error) {
			msg = this.options.error+ '<br><br>';
		} else {
			msg = this.options.error.toString();
		}
		this.$el.html(this.template({
			title: this.options.title || 'Error',
			body: msg
		}));
		return this;
	}
})