var app = app || {};


(function (app) {
	'use strict';

	app.ExpenseView = app.AView.extend({
		tagName: 'li',
		className: 'expense',
		
		template: _.template($('#expense-template').html()),
		initialize: function () {
			this.listenTo(this.model, 'change:description pseudochange', this.render);
		},
		render: function () {
			this.$el.html(this.template(this.model.toJSONDecorated()));

			if (!this.model.isValid()) {
				this.$el.addClass('invalid')
			} else {
				this.$el.removeClass('invalid');
			} 

			return this;
		}
	});
	
}(app));