var app = app || {};

/**
 * Displays a expense and enables editing of its properties.
 */
app.ExpenseEditView = app.AView.extend({
	tagName: 'section',

	template: _.template($('#expense-edit-template').html()),
	headerTemplate: _.template($('#expense-edit-header-template').html()),

	initialize: function () {
		this.participationView = new app.ParticipationCollectionView({
			collection: this.model.get('participations')
		});

		this.listenTo(this.model, 'change', this.renderHeader);
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
	destroy: function () {
		this.participationView.destroy();
		this.remove();
	},
	renderHeader: function () {
		console.log('Rerendering EEV Header', this, this.model);
		this.$('header').html(this.headerTemplate(this.model.toJSONDecorated()));
		return this;
	},
	renderParticipations: function () {
		this.participationView.render();
		return this;
	}
});