var app = app || {};

app.AppView = Backbone.View.extend({
	events: {
		'click a[href^="/"]': 'navigate'
	},
	initialize: function () {
		// TODO use a template and bind the model elements to elements in the template instead of 
		// appending to this.$el

		this.personCollectionView = new app.PersonCollectionView({
			collection: app.persons
		});
	},
	render: function () {
		this.$el.append(this.personCollectionView.render().el);
		if (this.activeView) {
			this.$el.append(this.activeView.render().el);
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
	destroyActiveView: function () {
		if (this.activeView && this.activeView.destroy && typeof this.activeView.destroy === 'function') {
			this.activeView.destroy();
		}
	},
	showMonth: function (id) {
		this.destroyActiveView();
		this.activeView = new app.MonthView({
			model: app.Month.findOrCreate({id: id})
		});
		this.render();
	}
});