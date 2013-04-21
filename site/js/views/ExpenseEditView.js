var app = app || {};

/**
 * Displays a expense and enables editing of its properties.
 */
app.ExpenseEditView = Backbone.View.extend({
	tagName: 'section',

	template: _.template($('#expense-edit-template').html()),
	headerTemplate: _.template($('#expense-edit-header-template').html()),

	initialize: function () {
		this.participationView = new app.ParticipationListView({
			collection: this.model.get('participations')
		});

		this.listenTo(this.model, 'change:description change:amount', this.renderHeader);
	},

	render: function () {
		this.$el.html(this.template());

		this.participationView.setElement(this.$('ul'));

		this
			.renderHeader()
			.renderParticipations()
		;

		return this;
	},

	renderHeader: function () {
		this.$('header').html(this.headerTemplate(this.model.toJSON()));
		return this;
	},

	renderParticipations: function () {
		this.participationView.render();
		return this;
	}
});