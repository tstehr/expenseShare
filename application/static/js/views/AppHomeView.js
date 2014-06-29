var app = app || {};


(function (app) {
	'use strict';

	app.AppHomeView = app.AView.extend({
		tagName: 'section',
		// TODO change classnames and styles and stuff...
		className: 'module month',

		structure: _.template($('#app-expenses-template').html()),
		headerTemplate: _.template($('#app-expenses-header-template').html()),

		events: {
			'click .month-toggle': 'toggleTransferView'
		},

		initialize: function (params) {
			this.transfersShown = params && !!params.transfersShown;
			this.isMain = params && !!params.isMain;

			this.expenseCollectionView = new app.ExpenseCollectionView({
				collection: this.model.get('expenses')
			});

			this.appTransfersView = new app.AppTransfersView({
				model: this.model
			});

			this.listenTo(this.model, 'change', this.renderHeader)
		},
		dispose: function () {
			this.expenseCollectionView.dispose();
			this.appTransfersView.dispose();
			this.remove();
		},
		render: function () {
			this.$el.html(this.structure(this.model.toJSON()));

			this.setElClasses();
			
			this
				.renderHeader()
				.renderBody()
			;

			return this;
		},
		setElClasses: function () {
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
			var data = this.model.toJSON();
			
			data.title = 'Expenses'

			this.$('> .module-header').html(this.headerTemplate(data));
			
			return this;
		},
		renderBody: function () {
			this.expenseCollectionView.setElement(this.$('.expense-list'));
			this.expenseCollectionView.render();

			this.appTransfersView.setElement(this.$('.month-transfers'));
			this.appTransfersView.render();
		},
		toggleTransferView: function () {
			this.transfersShown = !this.transfersShown;
			this.setElClasses();

			if (this.isMain) {
				if (this.transfersShown) {
					app.appRouter.navigate('/transfers');
				} else {
					app.appRouter.navigate('/');
				}
			}
		},
		resetState: function () {
			this.setBlocked(false);
		}
	});
		
}(app));