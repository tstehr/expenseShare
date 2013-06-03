var app = app || {};

app.ParticipationView = app.AView.extend({
	tagName: 'li',

	template: _.template($('#participation-template').html()),

	events: {
		'change [type=checkbox]': 'setParticipating',
		'change [type=text]': 'setAmount'
	},

	initialize: function () {
		this.listenTo(this.model, 'change pseudochange', this.render);
		this.listenTo(this.model, 'destroy', this.dispose);
	},
	render: function () {
		this.$el.html(this.template(this.model.toJSONDecorated()));
		return this;
	},
	setParticipating: function (e) {
		this.model.set('participating', e.target.checked);
	},
	setAmount: function (e) {
		var am = parseInt($(e.target).val(), 10);
		this.model.set('amount', Number.isNaN(am) ? 0 : am);
	}
});