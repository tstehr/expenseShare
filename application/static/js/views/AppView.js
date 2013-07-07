var app = app || {};

app.AppView = app.AView.extend({
	events: {
		'click a[href^="/"]': 'navigate'
	},
	initialize: function () {
		FastClick.attach(document.body);
		$(window).on('keyup', this.handleKeyup.bind(this));

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
	handleKeyup: function (e) {
		// 'panic button'
		if (e.altKey && e.keyCode === 81) {
			if (this._views['main'] instanceof app.ExpenseEditView) {
				this._views['main'].participationView.collection.sort();
			}
			this.render();
		}
	},
	showLoginView: function () {
		this.disposeAllViews();

		var lw = new app.LoginView();
		this.setView('main', lw);
		return lw;
	},
	showErrorView: function (message) {
		this.disposeAllViews();

		this.setView('main', new app.ErrorView({
			message: message
		}));
	},
	setupMonthCommon: function (month) {
		this.setView('side', new app.MonthView({
			model: month
		}));

		this.setView('transfer', new app.WrappingModuleView({
			title: 'Transfers',
			view: app.MonthTransfersView,
			model: month
		}));
	},
	showMonthView: function (monthId, transfersShown) {
		app.Month.findOrCreateAndFetch(monthId).then(function (month) {
			this.setupMonthCommon(month);

			this.setView('main', new app.MonthView({
				model: month,
				transfersShown: !!transfersShown,
				isMain: true
			}));
		}.bind(this));
	},
	showExpenseCreateView: function (monthId) {
		app.Month.findOrCreateAndFetch(monthId).then(function (month) {
			this.setupMonthCommon(month);

			this._views['side'].setBlocked(true);

			this.setView('main', new app.ExpenseEditView({
				model: 	new app.Expense({
					month: monthId
				})
			}));
		}.bind(this));
	},
	showExpenseEditView: function (monthId, id) {
		app.Month.findOrCreateAndFetch(monthId).then(function (month) {
			this.setupMonthCommon(month);

			this.setView('main', new app.ExpenseEditView({
				model: app.Expense.findOrCreate({id: id})
			}));
		}.bind(this));
	},
	showPersonsView: function () {
		this.setView('side', new app.PersonCollectionView({
			collection: app.persons
		}));
		this.setView('transfer', null);

		this.setView('main', new app.PersonCollectionView({
			collection: app.persons
		}));
	},
	showPersonCreateView: function () {
		var np = new app.Person();
		app.persons.add(np);

		this.setView('side', new app.PersonCollectionView({
			collection: app.persons
		}));
		this.setView('transfer', null);

		this.setView('main', new app.PersonEditView({
			model: np
		}));
	},
	showPersonEditView: function (id) {
		this.setView('side', new app.PersonCollectionView({
			collection: app.persons
		}));
		this.setView('transfer', null);

		this.setView('main', new app.PersonEditView({
			model: app.Person.findOrCreate({id: id})
		}));
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
				view.dispose();
				this._views[name].resetState();
			} else {
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
