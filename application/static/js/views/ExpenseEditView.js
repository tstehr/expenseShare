var app = app || {};

/**
 * Displays a expense and enables editing of its properties.
 */
app.ExpenseEditView = app.AView.extend({
	tagName: 'section',
	className: 'module edit-module',

	template: _.template($('#expense-edit-template').html()),
	headerTemplate: _.template($('#expense-edit-header-template').html()),

	events: {
		'change .expense-description': 'setDescription',
		'click .edit-module-persistAndClose': 'persistAndClose',
		'click .edit-module-persistAndEdit': 'persistAndEdit',
		'click .edit-module-discard': 'deleteModel',
		'click .edit-module-delete': 'deleteModel',
		'click .edit-module-showDelete': 'showDelete',
		'click .edit-module-hideDelete': 'hideDelete',
		'click .module-overlay': 'hideDelete'
	},

	initialize: function () {
		this.modelMonthId = this.model.get('month').id;

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
		if (this.model.isNew()) {
			this.model.destroy();
		}
		this.remove();
	},
	renderHeader: function () {
		this.$('header').html(this.headerTemplate(this.model.toJSONDecorated()));

		if (!this.model.isValid()) {
			this.$el.addClass('invalid');
		} else {
			this.$el.removeClass('invalid');
		}

		if (this.model.isNew()) {
			this.$el.addClass('isNew');
		} else {
			this.$el.removeClass('isNew');
		}

		return this;
	},
	renderParticipations: function () {
		this.participationView.render();
		return this;
	},
	setDescription: function (e) {
		this.model.set('description', e.target.value);
		this.model.saveIfNotNew();
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
			app.appRouter.navigate(this.model.get('month').get('id') + '/expenses/' + this.model.get('id'), {
				replace: true,
				trigger: true
			});
		}.bind(this));
	},
	persistNewModel: function (callback)  {
		this.setBlocked(true);

		// if a delete was issued by the server the model is removed from its month
		// in this case we need to restore it here before saving
		if (!this.model.get('month') && this.modelMonthId) {
			this.model.set('month', this.modelMonthId);
		}

		this.model.saveExpenseAndParticipations().then(
			function () {
				this.setBlocked(false);
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
		this.model.destroy();
		app.appRouter.navigate(this.modelMonthId, {
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