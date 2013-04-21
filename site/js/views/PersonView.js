var app = app || {};

app.PersonView = Backbone.View.extend({
	tagName: 'li',
	template: _.template($('#person-template').html()),
	initialize: function () {
		this.listenTo(this.model, 'change:name', this.render);
	},
	render: function () {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});