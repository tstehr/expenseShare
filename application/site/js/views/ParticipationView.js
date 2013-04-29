var app = app || {};

app.ParticipationView = Backbone.View.extend({
	tagName: 'li',

	template: _.template($('#participation-template').html()),

	events: {
		'change [type=checkbox]': 'toggleParticipating',
		'change [type=text]': 'setAmount'
	},

	initialize: function () {
		this.listenTo(this.model.get('person'), 'change:name', this.render);
	},
	render: function () {
		this.$el.html(this.template(_.clone(this.model.attributes)));
		return this;
	},
	toggleParticipating: function (e) {
		this.model.set('participating', e.target.checked);
	},
	setAmount: function (e) {
		var am = parseInt($(e.target).val(), 10);
		this.model.set('amount', Number.isNaN(am) ? 0 : am);
	}
});