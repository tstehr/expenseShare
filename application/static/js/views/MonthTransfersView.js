app = app || {};

app.MonthTransfersView = app.AView.extend({
	tagName: 'section',
	className: 'month-transfers',

	structure: _.template($('#month-transfers-template').html()),
	amountTemplate: _.template($('#month-transfers-amount-template').html()),

	initialize: function () {
		this.transferCollectionView = new app.TransferCollectionView({
			collection: this.model.get('transfers')
		});
		
		this.listenTo(this.model, 'change:amount', this.renderAmount);
	},
	render: function () {
		this.$el.html(this.structure(this.model.toJSONDecorated()));
		
		this.renderAmount(this);
		this.renderTransfers(this);
		
		return this;
	},
	renderAmount: function () {
		this.$('> .amount').html(this.amountTemplate(this.model.toJSONDecorated()));
		
		return this;
	},
	renderTransfers: function () {
		this.transferCollectionView.setElement(this.$('> .transfer-list'));
		this.transferCollectionView.render();
	}
});