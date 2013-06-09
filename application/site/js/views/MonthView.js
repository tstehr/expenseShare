var app = app || {};

app.MonthView = app.AView.extend({
	tagName: 'section',
	className: 'module month',

	structure: _.template($('#month-template').html()),
	headerTemplate: _.template($('#month-header-template').html()),

	events: {
		'click .month-toggle': 'toggleTransferView'
	},

	initialize: function (params) {
		this.transfersShown = params && !!params.transfersShown;
		this.isMain = params && !!params.isMain;

		this.expenseCollectionView = new app.ExpenseCollectionView({
			collection: this.model.get('expenses')
		});

		this.monthTransfersView = new app.MonthTransfersView({
			model: this.model
		});

		this.listenTo(this.model, 'change', this.renderHeader)
	},
	dispose: function () {
		this.expenseCollectionView.dispose();
		this.monthTransfersView.dispose();
		this.remove();
	},
	render: function () {
		this.$el.html(this.structure(this.model.toJSONDecorated()));

		this.setElClass();
		
		this
			.renderHeader()
			.renderBody()
		;

		return this;
	},
	setElClass: function () {
		if (this.isMain) {
			this.$el.addClass('main');
		} else {
			this.$el.removeClass('main');
		}

		if (this.transfersShown) {
			this.$el.addClass('transfersShown');
		} else {
			this.$el.removeClass('transfersShown');
		}
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
		this.expenseCollectionView.setElement(this.$('.expense-list'));
		this.expenseCollectionView.render();

		this.monthTransfersView.setElement(this.$('.month-transfers'));
		this.monthTransfersView.render();
	},
	toggleTransferView: function () {
		this.transfersShown = !this.transfersShown;
		this.setElClass();

		if (this.isMain) {
			if (this.transfersShown) {
				app.appRouter.navigate(this.model.get('id') + '/transfers');
			} else {
				app.appRouter.navigate(this.model.get('id'));
			}
		}
	}
});

app.MonthView.months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']