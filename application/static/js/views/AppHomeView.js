var app = app || {};


(function (app) {
	'use strict';

	app.AppHomeView = app.AView.extend({
		tagName: 'section',
		className: 'module home',

		structure: _.template($('#app-home-template').html()),

		events: {
			'click .home-toggle': 'toggleTransferView'
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
		},
		dispose: function () {
			this.expenseCollectionView.dispose();
			this.appTransfersView.dispose();
			this.remove();
		},
		render: function () {
			this.$el.html(this.structure(this.model.toJSON()));

			this.setElClasses();
			
			this.expenseCollectionView.setElement(this.$('.expense-list'));
			this.expenseCollectionView.render();

			this.appTransfersView.setElement(this.$('.home-transfers'));
			this.appTransfersView.render();

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