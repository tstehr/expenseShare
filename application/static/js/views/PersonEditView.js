var app = app || {};

app.PersonEditView = app.AView.extend({
	tagName: 'section',

	template: _.template($('#person-edit-template').html()),

	events: {
		'change .person-name': 'setName',
		'click .person-delete': 'deleteModel'
	},
	
	initialize: function () {
		this.listenTo(this.model, 'change:name', this.render);
	},
	render: function () {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	setName: function (e) {
		this.model.set('name', e.target.value);
	},
	deleteModel: function () {
		this.model.destroy();
		app.appRouter.navigate('/persons', {
			trigger: true
		})
	}
});