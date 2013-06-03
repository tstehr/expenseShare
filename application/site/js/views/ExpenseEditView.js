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
		'change .expense-description': 'setDescription',
		'click .expense-save': 'persistNewModel',
		'click .expense-discard': 'discardNewModel',
		'click .expense-back': 'closeView',
	},

	initialize: function () {
		this.participationView = new app.ParticipationCollectionView({
			collection: this.model.get('participations')
		});

		this.listenTo(this.model, 'change pseudochange', this.renderHeader);
	},
	render: function () {
		this.$el.html(this.template());

		this.participationView.setElement(this.$('ul')[0]);

		this
			.renderHeader()
			.renderParticipations()
		;

		return this;
	},
	dispose: function () {
		this.participationView.dispose();
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
	setDescription: function (e) {
		this.model.set('description', e.target.value);
	},
	persistNewModel: function ()  {
		// TODO save participations
		// TODO indicate running activity to user, disable interactions
		this.model.save().then(this.closeView.bind(this));
	},
	discardNewModel: function () {
		// TODO destroy participations
		var month = this.model.get('month').get('id');
		this.model.destroy();
		this.gotoMonth(month);
	},
	closeView: function () {
		console.log('ccv');
		this.gotoMonth(this.model.get('month').get('id'));
	},
	gotoMonth: function (month) {
		app.appRouter.navigate('month/' + month  , {
			trigger: true
		});
	}
});