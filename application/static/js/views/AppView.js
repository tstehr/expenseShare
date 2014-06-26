var app = app || {};

(function (app) {
	'use strict';

	app.AppView = app.AView.extend({
		events: {
			'click a[href^="/"]': 'navigate'
		},
		initialize: function () {
			FastClick.attach(document.body);
			$(document).on('touchmove', function (e) {
				var inScrolling = $('.module-body').find(e.target);
				if (inScrolling.length > 0) {
					console.log('STOP');
					e.stopPropagation();
				} else {
					e.preventDefault();
				}
			});

			this._views = {};
			this._viewEls = {
				'main': this.$('.mainView'),
				'side': this.$('.sideView'),
				'transfer': this.$('.transferView')
			};

			// in case we create to many dangeling views for mobile, could use this
			// this._viewEls = {
			// 	main: this.$el
			// };
		},
		render: function () {
			Object.keys(this._viewEls).forEach(function (viewName) {
				if (this._views[viewName]) {
					this._views[viewName].render();
				}
			}.bind(this));
		},
		navigate: function (e) {
			var url;
			if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
				e.preventDefault();
				url = $(e.currentTarget).attr('href').replace(/^\//, "");
				app.appRouter.navigate(url, {
					trigger: true
				});
			}
		},	
		setupMonthCommon: function (month) {
			this.setView('side', new app.MonthView({
				model: month
			}));

			this.setView('transfer', new app.WrappingModuleView({
				title: 'Transfers',
				model: month
				view: app.AppTransfersView,
			}));
		},
		showErrorView: function (error) {
			this.disposeAllViews();

			this.setView('main', new app.ErrorView({
				error: error
			}));
		},
		showLoginView: function () {
			this.disposeAllViews();

			var lw = new app.LoginView();
			this.setView('main', lw);
			return lw;
		},
		showMonthView: function (monthId, transfersShown) {
			app.Month.findOrCreateAndFetch(monthId)
				.then(function (month) {
					this.setupMonthCommon(month);

					this.setView('main', new app.MonthView({
						model: month,
						transfersShown: !!transfersShown,
						isMain: true
					}));
				}.bind(this))
				.fail(this.showErrorView.bind(this))
				.done()
			;
		},
		showExpenseCreateView: function (monthId) {
			app.Month.findOrCreateAndFetch(monthId)
				.then(function (month) {
					this.setupMonthCommon(month);

					this._views['side'].setBlocked(true);

					this.setView('main', new app.ExpenseEditView({
						model: 	new app.Expense({
							month: monthId
						})
					}));
				}.bind(this))
				.fail(this.showErrorView.bind(this))
				.done()
			;
		},
		showExpenseEditView: function (monthId, id) {
			app.Month.findOrCreateAndFetch(monthId)
				.then(function (month) {
					this.setupMonthCommon(month);

					if (!app.Expense.findOrCreate({id: id}, {create: false})) {
						throw new Error('Expense not found!');
					}

					this.setView('main', new app.ExpenseEditView({
						model: app.Expense.findOrCreate({id: id})
					}));

				}.bind(this))
				.fail(this.showErrorView.bind(this))
				.done()
			;
		},
		showPersonsView: function () {
			try {
				this.setView('side', new app.PersonCollectionView({
					collection: app.persons
				}));
				this.setView('transfer', null);

				this.setView('main', new app.PersonCollectionView({
					collection: app.persons
				}));
			} catch (e) {
				this.showErrorView(e);
			}
		},
		showPersonCreateView: function () {
			try {
				var np = new app.Person();
				app.persons.add(np);

				this.setView('side', new app.PersonCollectionView({
					collection: app.persons
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
					collection: app.persons
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