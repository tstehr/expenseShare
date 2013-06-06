var app = app || {};

app.AppView = app.AView.extend({
	events: {
		'click a[href^="/"]': 'navigate'
	},
	initialize: function () {
		FastClick.attach(document.body);


		// this.personCollectionViewEl = this.$('.app-personCollectionView');
		this.activeViewEl = this.$el;


		// this.personCollectionView = new app.PersonCollectionView({
		// 	collection: app.persons
		// });
		// this.personCollectionView.setElement(this.personCollectionViewEl);
	},
	render: function () {
		// this.personCollectionView.render();
		if (this.activeView) {
			this.activeView.render();
		}
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
	showMonthView: function (id, transfersShown) {
		this.setActiveView(new app.MonthView({
			model: app.Month.findOrCreate({id: id}),
			transfersShown: !!transfersShown
		}));
	},
	showExpenseEditView: function (id) {
		this.setActiveView(new app.ExpenseEditView({
			model: app.Expense.findOrCreate({id: id})
		}));
	},
	showPersonView: function () {
		this.setActiveView(new app.PersonCollectionView({
			collection: app.persons
		}));
	},
	setActiveView: function (view) {
		this.disposeActiveView();
		this.activeView = view;
		this.activeViewEl.empty();
		this.activeViewEl.append(this.activeView.render().el);
	},
	disposeActiveView: function () {
		if (this.activeView) {
			this.activeView.dispose();
		}
	}
});