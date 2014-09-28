var app = app || {};

(function (app) {
	'use strict';

	app.PersonEditView = app.AView.extend({
		tagName: 'section',
		className: 'module edit-module person-edit',

		template: _.template($('#person-edit-template').html()),

		events: {
			'change .person-name': 'setName',
			'change .person-hidden': 'setHidden',
			'click .edit-module-persistAndClose': 'persistAndClose',
			'click .edit-module-persistAndEdit': 'persistAndEdit',
			'click .edit-module-discard': 'deleteModel'
		},
		
		initialize: function () {
			this.listenTo(this.model, 'change:name', this.render);
			this.listenTo(this.model, 'change:_id change:hidden', this.setElClasses);
		},
		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			this.setElClasses();
			return this;
		},
		setElClasses: function () {
			if (this.model.isNew()) {
				this.$el.addClass('isNew');
			} else {
				this.$el.removeClass('isNew');
			}

			if (this.model.get('hidden')) {
				this.$el.addClass('isHidden');
			} else {
				this.$el.removeClass('isHidden');
			}
		},
		dispose: function () {
			if (this.model.isNew()) {
				this.model.destroy();
			}
			this.remove();
		},
		setName: function (e) {
			this.model.set('name', e.target.value);
			this.model.saveIfNotNew();
		},
		setHidden: function (e) {
			this.model.set('hidden', !!e.target.checked);
			this.model.saveIfNotNew();
		},
		persistAndClose: function () {
			this.persistNewModel(function () {
				app.appRouter.navigate('persons', {
					trigger: true
				});
			}.bind(this));
		},
		persistAndEdit: function () {
			this.persistNewModel(function () {
				app.appRouter.navigate('persons/' + this.model.id, {
					replace: true,
					trigger: true
				});
			}.bind(this));
		},
		persistNewModel: function (callback)  {
			this.setBlocked(true);

			// TODO handle server issued deletes

			this.model.save().then(
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
			app.appRouter.navigate('/persons', {
				trigger: true
			});
		},
	});
	
}(app));