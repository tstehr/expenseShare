app = app || {};

(function (app) {
	'use strict';

	app.AppTransfersView = app.AView.extend({
		tagName: 'section',
		// TODO change classnames and styles and stuff...
		className: 'month-transfers',

		structure: _.template($('#app-transfers-template').html()),
		amountTemplate: _.template($('#app-transfers-amount-template').html()),

		initialize: function () {
			this.transferCollectionView = new app.TransferCollectionView({
				collection: this.model.get('transfers')
			});
			
			this.listenTo(this.model, 'change:amount', this.renderAmount);
		},
		render: function () {
			this.$el.html(this.structure(this.model.toJSON()));
			
			this.renderAmount(this);
			this.renderTransfers(this);
			
			return this;
		},
		renderAmount: function () {
			this.$('> .amount').html(this.amountTemplate(this.model.toJSON()));
			
			return this;
		},
		renderTransfers: function () {
			this.transferCollectionView.setElement(this.$('> .transfer-list'));
			this.transferCollectionView.render();
		}
	});
	
}(app));