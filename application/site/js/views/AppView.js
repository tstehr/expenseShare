var app = app || {};

app.AppView = Backbone.View.extend({
	initialize: function () {
		// TODO use a template and bind the model elements to elements in the template instead of 
		// appending to this.$el

		this.personListView = new app.PersonListView({
			collection: app.persons
		});
	},
	render: function () {
		this.$el.append(this.personListView.render().el);
		if (this.activeView) {
			this.$el.append(this.activeView.render().el);
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