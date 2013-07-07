var app = app || {};

app.PersonView = app.AView.extend({
	tagName: 'li',
	className: 'person',

	template: _.template($('#person-template').html()),
	
	initialize: function () {
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'destroy', this.dispose);
	},
	render: function () {
		this.$el.html(this.template(this.model.toJSON()));

		if (this.model.get('hidden')) {
			this.$el.addClass('isHidden');
		} else {
			this.$el.removeClass('isHidden');
		}

 		return this;
	}
});