var app = app || {};

app.AppView = app.AView.extend({
	events: {
		'click a[href^="/"]': 'navigate'
	},
	initialize: function () {
		FastClick.attach(document.body);
		$(window).on('keyup', this.handleKeyup.bind(this));

		$(document).on('touchmove', function (e) {
			console.log(e);
		});
		this._views = {};
		this._viewEls = {
			'main': this.$('.mainView'),
			'side': this.$('.sideView'),
			'transfer': this.$('.transferView'),
			'person': this.$('.personView')
		};

		// in case we create to many danfeling views for mobile, could use this
		// this._viewEls = {
		// 	main: this.$el
		// };

		this.setView('person', new app.WrappingModuleView({
			title: 'Persons',
			view: new app.PersonCollectionView({
				collection: app.persons
			})
		}));
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
	setupMonthCommon: function (month) {
		this.setView('side', new app.MonthView({
			model: month
		}));

		this.setView('transfer', new app.WrappingModuleView({
			title: 'Transfers',
			view: new app.MonthTransfersView({
				model: month
			})
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

			this._views['side'].$el.addClass('blocked');

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
	showPersonView: function () {
		this.setView('side', null);
		this.setView('transfer', null);

		this.setView('main', new app.WrappingModuleView({
			title: 'Persons',
			view: new app.PersonCollectionView({
				collection: app.persons
			})
		}));
	},
	setView: function (name, view) {
		if (!this._viewEls[name]) {
			view.dispose();
		} else {
			this.disposeView(name);
			this._views[name] = view;
			this._viewEls[name].empty();
			if (this._views[name]) {
				this._viewEls[name].append(this._views[name].render().el);
			}
		}
	},
	disposeView: function (name) {
		if (this._views[name]) {
			this._views[name].dispose();
		}
	}
});
