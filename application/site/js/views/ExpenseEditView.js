var app = app || {};

/**
 * Displays a expense and enables editing of its properties.
 */
app.ExpenseEditView = app.AView.extend({
	tagName: 'section',
	className: 'module expense-edit',

	template: _.template($('#expense-edit-template').html()),
	headerTemplate: _.template($('#expense-edit-header-template').html()),

	events: {
		'change .expense-description': 'setDescription',
		'click .expense-persistAndClose': 'persistAndClose',
		'click .expense-persistAndEdit': 'persistAndEdit',
		'click .expense-discard': 'deleteModel',
		'click .expense-showDelete': 'showDelete',
		'click .expense-hideDelete': 'hideDelete',
		'click .module-overlay': 'hideDelete',
		'click .expense-delete': 'deleteModel'
	},

	initialize: function () {
		this.participationView = new app.ParticipationCollectionView({
			collection: this.model.get('participations')
		});

		this.listenTo(this.model, 'change pseudochange', this.renderHeader);
	},
	render: function () {
		this.$el.html(this.template(this.model.toJSONDecorated()));

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
	persistAndClose: function () {
		this.persistNewModel(function () {
			app.appRouter.navigate(this.model.get('month').get('id'), {
				trigger: true
			});
		}.bind(this));
	},
	persistAndEdit: function () {
		this.persistNewModel(function () {
			app.appRouter.navigate(this.model.get('month').get('id') + '/expense/' + this.model.get('id'), {
				trigger: true,
				replace: true
			});
		}.bind(this));
	},
	persistNewModel: function (callback)  {
		this.$el.addClass('blocked');

		this.model.saveExpenseAndParticipations().then(
			function () {
				this.$el.removeClass('blocked');
				if (callback) {
					callback();
				}
			}.bind(this), 
			function () {
				// TODO do something more useful than just failing silently
			}
		);
	},
	deleteModel: function () {
		// TODO destroy participations
		var month = this.model.get('month').get('id');
		this.model.destroy();
		app.appRouter.navigate(month, {
			trigger: true
		});
	},
	showDelete: function () {
		this.$el.addClass('deleteShown');
	},
	hideDelete: function () {
		this.$el.removeClass('deleteShown');
	}
});