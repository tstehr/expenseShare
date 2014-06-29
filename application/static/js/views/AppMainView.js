var app = app || {};

(function (app) {
	'use strict';

	app.AppMainView = app.AView.extend({
		template: _.template($('#app-template').html()),

		initialize: function () {
			this._views = {};

			this._viewEls = {
				main: null,
				side: null,
				transfer: null,
			};

			// in case we create to many dangeling views for mobile, could use this
			// this._viewEls = {
			// 	main: this.$el
			// };
		},
		render: function () {
			this.$el.html(this.template());

			this._viewEls.main = this.$('.mainView');
			this._viewEls.side = this.$('.sideView');
			this._viewEls.transfer = this.$('.transferView');

			Object.keys(this._viewEls).forEach(function (viewName) {
				if (this._views[viewName]) {
					this._views[viewName].render();
				}
			}.bind(this));

			return this;
		},
		setupCommon: function () {
			this.setView('side', new app.AppHomeView({
				model: this.model
			}));

			this.setView('transfer', new app.WrappingModuleView({
				title: 'Transfers',
				model: this.model,
				view: app.AppTransfersView,
			}));
		},
		showErrorView: function (error) {
			this.disposeAllViews();

			this.setView('main', new app.ErrorView({
				error: error
			}));
		},
		showExpensesView: function (transfersShown) {
			this.setupCommon();

			this.setView('main', new app.AppHomeView({
				model: this.model,
				transfersShown: !!transfersShown,
				isMain: true
			}));

		},
		showExpenseCreateView: function () {
			var expense = new app.Expense({
				created: Date.now() / 1000,
			});

			this.model.get('expenses').add(expense);

			this.setupCommon();

			this._views['side'].setBlocked(true);

			this.setView('main', new app.ExpenseEditView({
				model: 	expense,
			}));
		},
		showExpenseEditView: function (id) {
			this.setupCommon();

			if (app.Expense.findOrCreate({id: id}, {create: false})) {
				this.setView('main', new app.ExpenseEditView({
					model: app.Expense.findOrCreate({id: id}),
				}));
			} else {
				this.showErrorView('Expense not found!')
			}
		},
		showPersonsView: function () {
			try {
				this.setView('side', new app.PersonCollectionView({
					collection: app.persons
				}));
				this.setView('transfer', null);

				this.setView('main', new app.PersonCollectionView({
					collection: this.model.get('persons'),
				}));
			} catch (e) {
				this.showErrorView(e);
			}
		},
		showPersonCreateView: function () {
			try {
				var np = new app.Person();
				this.model.get('persons').add(np);

				this.setView('side', new app.PersonCollectionView({
					collection: this.model.get('persons'),
				}));
				this.setView('transfer', null);

				this.setView('main', new app.PersonEditView({
					model: np
				}));
			} catch (e) {
				this.showErrorView(e);
			}
		},
		showPersonEditView: function (id) {
			try {
				if (!app.Person.findOrCreate({id: id}, {create: false})) {
					throw new Error('Person not found!');
				}

				this.setView('side', new app.PersonCollectionView({
					collection: this.model.get('persons'),
				}));
				this.setView('transfer', null);

				this.setView('main', new app.PersonEditView({
					model: app.Person.findOrCreate({id: id})
				}));
			} catch (e) {
				this.showErrorView(e);
			}
		},
		getView: function (name) {
			return this._views[name];
		},
		setView: function (name, view) {
			if (!this._viewEls[name]) {
				// can't put view anywhere, ignore it
				view.dispose();
			} else if (view && view === this._views[name]) {
				// if trying to set to already set view, ask it to reset itself
				view.resetState();
			} else {
				// try to reuse model or collection view if possible
				if (
					view && this._views[name]  &&
					view.constructor === this._views[name].constructor && 
					(
						(view.model && view.model === this._views[name].model) ||
						(view.collection && view.collection === this._views[name].collection)
					)
				) {
					// can reuse existing view
					view.dispose();
					this._views[name].resetState();
				} else {
					// need to use new view
					this.disposeView(name);
					this._views[name] = view;
					this._viewEls[name].empty();
					if (this._views[name]) {
						this._viewEls[name].append(this._views[name].render().el);
					}
				}				
			}
			
		},
		disposeView: function (name) {
			if (this._views[name]) {
				this._views[name].dispose();
				delete this._views[name];
			}
		},
		disposeAllViews: function () {
			Object.keys(this._viewEls).forEach(function (name) {
				this.disposeView(name);
			}.bind(this));
		}
	});
	
}(app));