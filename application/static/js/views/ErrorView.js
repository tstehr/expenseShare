var app = app || {};


(function (app) {
	'use strict';

	app.ErrorView = app.AView.extend({
		tagName: 'section',
		className: 'module',

		template: _.template($('#module-template').html()),

		initialize : function (options) {
			this.options = options || {};
		},

		render: function () {
			var msg;
			if (this && this.options && this.options.error) {
				if (this.options.error instanceof Error) {
					msg = this.options.error.message + '<br><br><pre>' + this.options.error.stack + '</pre>';
				} else {
					msg = this.options.error.toString();
				}
			} else {
				msg = new Error().stack;
			}
			this.$el.html(this.template({
				title: this.options && this.options.title || 'Error',
				body: msg
			}));
			return this;
		},
	});
	
}(app));