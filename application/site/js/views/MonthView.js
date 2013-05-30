var app = app || {};

app.MonthView = app.AView.extend({
	tagName: 'section',

	structure: $('#a-module-template').html(),
	headerTemplate: _.template($('#month-header-template').html()),
	bodyStructure: $('#month-body-template').html(),

	initialize: function () {
		this.expenseCollectionView = new app.ExpenseCollectionView({
			collection: this.model.get('expenses')
		});

		this.monthTransfersView = new app.MonthTransfersView({
			model: this.model
		});

		this.listenTo(this.model, 'change pseudochange', this.renderHeader)
	},
	destroy: function () {
		this.expenseCollectionView.destroy();
		this.monthTransfersView.destroy();
		this.remove();
	},
	render: function () {
		this.$el.html(this.structure);
		
		this
			.renderHeader()
			.renderBody()
		;

		return this;
	},
	renderHeader: function () {
		// TODO decide wether to put this in model or view	
		var data = this.model.toJSONDecorated();
		
		var monthName = app.MonthView.months[data.month-1];
		var yearName = "’" + app.Util.formatNumber(data.year - Math.round(data.year / 100) * 100, 2);

		data.title = monthName + ' ' + yearName;

		this.$('> .module-header').html(this.headerTemplate(data));
		
		return this;
	},
	renderBody: function () {
		var body = this.$('> .module-body');

		body.html(this.bodyStructure);

		this.expenseCollectionView.setElement(body.find('> .expenses'));
		this.expenseCollectionView.render();

		this.monthTransfersView.setElement(body.find('> .transfers'));
		this.monthTransfersView.render();
	}
});

app.MonthView.months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']