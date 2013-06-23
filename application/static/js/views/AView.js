var app = app || {};

app.AView = Backbone.View.extend({
	dispose: function () {
		this.remove();
	}
});