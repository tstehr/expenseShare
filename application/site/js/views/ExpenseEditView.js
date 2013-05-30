var app = app || {};

/**
 * Displays a expense and enables editing of its properties.
 */
app.ExpenseEditView = app.AView.extend({
	tagName: 'section',
	className: 'expense-edit',

	template: _.template($('#expense-edit-template').html()),
	headerTemplate: _.template($('#expense-edit-header-template').html()),

	events: {
		'change .expense-edit-name': 'setName'
	},

	initialize: function () {
		this.participationView = new app.ParticipationCollectionView({
			collection: this.model.get('participations')
		});

		this.listenTo(this.model, 'change pseudochange', this.renderHeader);
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
		this.$('header').html(this.headerTemplate(this.model.toJSONDecorated()));

		if (!this.model.isValid()) {
			this.$el.addClass('invalid');
		} else {
			this.$el.removeClass('invalid');
		} 

		return this;
	},
	renderParticipations: function () {
		this.participationView.render();
		return this;
	},
	setName: function (e) {
		this.model.set('description', e.target.value);
	}
});