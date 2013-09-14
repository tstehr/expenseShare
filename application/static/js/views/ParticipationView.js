var app = app || {};

app.ParticipationView = app.AView.extend({
	tagName: 'li',

	template: _.template($('#participation-template').html()),

	events: {
		'change .participation-toggle': 'setParticipating',
		'blur .participation-amount': 'setAmount'
	},

	initialize: function () {
		this.listenTo(this.model, 'change pseudochange', function (e) {
			console.log('Got change event', e, this.model.get('person').get('name'));
			this.render();
		}.bind(this));
		// this.listenTo(this.model, 'destroy', this.dispose);
	},
	render: function () {
		console.log('Rerendering', this.model.get('person').get('name'));
		
		var data = this.model.toJSONDecorated();
		data.cid = this.model.cid;
		this.$el.html(this.template(data));
		return this;
	},
	setParticipating: function (e) {
		this.model.set('participating', e.target.checked);
		this.model.saveIfNotNew();
	},
	setAmount: function (e) {
		var am = app.Util.parseCurrency(e.target.value) || 0;
		if (this.model.get('amount') === am) {
			this.render();
		} else {
			this.model.set('amount', am);
			this.model.saveIfNotNew();
		}
	}
});