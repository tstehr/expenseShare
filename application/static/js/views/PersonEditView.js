var app = app || {};

app.PersonEditView = app.AView.extend({
	tagName: 'section',
	className: 'module edit-module',

	template: _.template($('#person-edit-template').html()),

	events: {
		'change .person-name': 'setName',
		'click .edit-module-delete': 'deleteModel',
		'click .edit-module-showDelete': 'showDelete',
		'click .edit-module-hideDelete': 'hideDelete'
	},
	
	initialize: function () {
		this.listenTo(this.model, 'change:name', this.render);
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
	},
	setName: function (e) {
		this.model.set('name', e.target.value);
		this.model.saveIfNotNew();
	},
	deleteModel: function () {
		// this.model.destroy();
		// app.appRouter.navigate('/persons', {
		// 	trigger: true
		// });
	},
	showDelete: function () {
		this.$el.addClass('deleteShown');
	},
	hideDelete: function () {
		this.$el.removeClass('deleteShown');
	}
});