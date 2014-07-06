app = app || {};

(function (app) {
	'use strict';

	app.WrappingModuleView = app.AView.extend({
		tagName: 'section',
		className: 'module',

		template: _.template($('#module-template').html()),

		initialize: function (params) {
			this.wrappedView = new params.view(params);
			this.title = params.title;
		},

		render: function () {
			this.$el.html(this.template({
				title: this.title
			}));

			this.$('> .module-body').append(this.wrappedView.render().el);

			return this;
		},

		dispose: function () {
			this.wrappedView.dispose();
			this.remove();
		},
	});
	
}(app));