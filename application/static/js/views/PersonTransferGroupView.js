var app = app || {};

(function (app) {
	'use strict';

	app.PersonTransferGroupView = app.AView.extend({
		tagName: 'li',

		template: _.template($('#person-transfer-group-template').html()),
		
		initialize: function () {
			this.listenTo(this.model, 'change:name', this.updateName);
			this.listenTo(this.model, 'destroy', this.dispose);
		},
		render: function () {
			this.$el.html(this.template(this.model.toJSON()));

			if (this.model.get('hidden')) {
				this.$el.addClass('isHidden');
			} else {
				this.$el.removeClass('isHidden');
			}

	 		return this;
		},
		updateName: function () {
			this.$('> .person-name').html(this.model.get('name'));
		},
		getListEl: function () {
			return this.$('> .transfer-list');
		},
	});
	
}(app));