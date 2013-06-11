var app = app || {};

app.PersonView = app.AView.extend({
	tagName: 'li',

	template: _.template($('#person-template').html()),

	events: {
		'change [type=text]': 'setName'
	},

	initialize: function () {
		this.listenTo(this.model, 'change:name', this.render);
		this.listenTo(this.model, 'destroy', this.dispose);
	},
	render: function () {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	setName: function (e) {
		this.model.set('name', e.target.value);
	}
});