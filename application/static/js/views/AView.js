var app = app || {};

(function (app) {
	'use strict';

	app.AView = Backbone.View.extend({
		dispose: function () {
			this.remove();
		},
		setBlocked: function (block) {
			if (block) {
				this.$el.addClass('blocked');
			} else {
				this.$el.removeClass('blocked');
			}
		},
		resetState: function () {
			
		}
	});
	
}(app));