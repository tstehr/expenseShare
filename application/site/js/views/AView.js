var app = app || {};

app.AView = Backbone.View.extend({
	destroy: function () {
		this.remove();
	}
});